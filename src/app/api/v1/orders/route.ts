import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    let whereClause: any = {};

    if (session) {
      if (session.role === 'CUSTOMER') {
        const customer = await prisma.customerProfile.findUnique({
          where: { userId: session.id },
        });
        if (!customer) return NextResponse.json({ orders: [] });
        whereClause.customerId = customer.id;
      }
      // ADMIN sees all orders
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const [total, orders] = await Promise.all([
      prisma.order.count({ where: whereClause }),
      prisma.order.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: {
            include: { product: true },
          },
          subOrders: {
            include: { seller: true },
          },
          deliveryAddress: true,
          customer: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    const body = await req.json();
    const {
      items, // array of { productId, quantity }
      deliveryAddress, // either string id or object
      paymentMethod = 'CASH_ON_DELIVERY',
      paymentTrxId,
      notes,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Cart items required' }, { status: 400 });
    }

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please sign in or create a customer account to place an order.',
          requiresAuth: true,
          redirectUrl: '/customer/login?redirect=/checkout',
        },
        { status: 401 }
      );
    }

    // Resolve customer profile for authenticated user
    let customerProfileId = session.customerProfileId;
    if (!customerProfileId) {
      let cp = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
      if (!cp) {
        cp = await prisma.customerProfile.create({ data: { userId: session.id } });
      }
      customerProfileId = cp.id;
    }

    if (!customerProfileId) {
      return NextResponse.json(
        { success: false, error: 'Customer profile required. Please sign in again.' },
        { status: 400 }
      );
    }

    // Duplicate transaction ID protection
    if (paymentTrxId && paymentTrxId.trim()) {
      const existingOrder = await prisma.order.findFirst({
        where: { paymentTrxId: paymentTrxId.trim() },
      });
      if (existingOrder) {
        return NextResponse.json(
          { success: false, error: 'This Transaction ID has already been submitted for an existing order.' },
          { status: 400 }
        );
      }
    }

    // Resolve Address
    let addressId = typeof deliveryAddress === 'string' ? deliveryAddress : null;
    let targetDistrict = 'Moulvibazar';
    let targetDivision = 'Sylhet';

    if (!addressId && typeof deliveryAddress === 'object') {
      targetDistrict = deliveryAddress.district || 'Moulvibazar';
      targetDivision = deliveryAddress.division || 'Sylhet';

      const shouldSaveDefault = Boolean(deliveryAddress.saveToProfile);
      if (shouldSaveDefault) {
        await prisma.address.updateMany({
          where: { customerId: customerProfileId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const createdAddr = await prisma.address.create({
        data: {
          customerId: customerProfileId,
          label: deliveryAddress.label || (shouldSaveDefault ? 'Default Address' : 'Order Delivery Address'),
          recipientName: deliveryAddress.recipientName || session.name || 'Customer',
          phone: deliveryAddress.phone || session.phone || '01733983752',
          division: targetDivision,
          district: targetDistrict,
          upazila: deliveryAddress.upazila || `${targetDistrict} Sadar`,
          area: deliveryAddress.area || deliveryAddress.upazila || targetDistrict,
          addressLine: deliveryAddress.addressLine || `${targetDistrict}, Bangladesh`,
          landmark: deliveryAddress.landmark || null,
          isDefault: shouldSaveDefault,
        },
      });
      addressId = createdAddr.id;
    } else if (addressId) {
      const existingAddr = await prisma.address.findUnique({ where: { id: addressId } });
      if (existingAddr) {
        targetDistrict = existingAddr.district;
        targetDivision = existingAddr.division;
      }
    }

    // Dynamic Delivery Charge Calculation based on System Settings & Geography
    const isLocalDistrict = targetDistrict.toLowerCase().includes('moulvibazar');
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['delivery_charge_inside', 'delivery_charge_outside'] } },
    });
    const insideRate = parseFloat(settings.find((s) => s.key === 'delivery_charge_inside')?.value || '60');
    const outsideRate = parseFloat(settings.find((s) => s.key === 'delivery_charge_outside')?.value || '120');

    // Run inventory validation and order creation inside an atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData: any[] = [];
      const sellerItemsMap: Map<string, { items: any[]; subtotal: number; commissionRate: number }> = new Map();

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { seller: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const qty = Math.max(1, item.quantity || 1);

        // Anti-Overselling Guard: verify physical stock
        if (product.stock < qty) {
          throw new Error(
            `Insufficient stock for "${product.name}". Requested ${qty}, but only ${product.stock} available.`
          );
        }

        const unitPrice = product.discountPrice ?? product.price;
        const totalPrice = unitPrice * qty;
        subtotal += totalPrice;

        orderItemsData.push({
          productId: product.id,
          quantity: qty,
          unitPrice,
          totalPrice,
        });

        if (product.sellerId && product.seller) {
          if (!sellerItemsMap.has(product.sellerId)) {
            sellerItemsMap.set(product.sellerId, {
              items: [],
              subtotal: 0,
              commissionRate: product.seller.commissionRate ?? 8.0,
            });
          }
          const group = sellerItemsMap.get(product.sellerId)!;
          group.items.push(product.id);
          group.subtotal += totalPrice;
        }

        // Decrement stock safely
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: qty } },
        });
      }

      // Delivery rule: Free delivery above ৳10,000 inside, ৳15,000 outside
      const freeThreshold = isLocalDistrict ? 10000 : 15000;
      const baseCharge = isLocalDistrict ? insideRate : outsideRate;
      const deliveryCharge = subtotal >= freeThreshold ? 0 : baseCharge;
      const discount = 0;
      const totalAmount = subtotal + deliveryCharge - discount;

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD${dateStr}${randomSuffix}`;

      // Prepare suborders for multi-seller fulfillment
      const subOrdersCreate = Array.from(sellerItemsMap.entries()).map(([sellerId, group], idx) => {
        const commissionAmount = parseFloat(((group.subtotal * group.commissionRate) / 100).toFixed(2));
        const sellerEarnings = group.subtotal - commissionAmount;
        return {
          subOrderNumber: `${orderNumber}-S${idx + 1}`,
          sellerId,
          subtotal: group.subtotal,
          commissionRate: group.commissionRate,
          commissionAmount,
          sellerEarnings,
          status: 'PLACED',
          payoutStatus: 'PENDING',
        };
      });

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customerProfileId,
          status: 'PLACED',
          subtotal,
          deliveryCharge,
          discount,
          totalAmount,
          paymentMethod,
          paymentStatus: paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : (paymentTrxId ? 'VERIFYING' : 'PENDING'),
          paymentTrxId: paymentTrxId?.trim() || null,
          deliveryAddressId: addressId,
          notes,
          items: {
            create: orderItemsData,
          },
          subOrders: subOrdersCreate.length > 0 ? {
            create: subOrdersCreate,
          } : undefined,
        },
        include: {
          items: { include: { product: true } },
          deliveryAddress: true,
          subOrders: { include: { seller: true } },
        },
      });

      // Financial Audit Log
      await tx.auditLog.create({
        data: {
          userId: session?.id || null,
          userRole: session?.role || 'CUSTOMER',
          action: 'ORDER_PLACED',
          entity: 'ORDER',
          entityId: newOrder.id,
          newData: JSON.stringify({
            orderNumber: newOrder.orderNumber,
            totalAmount: newOrder.totalAmount,
            deliveryCharge,
            district: targetDistrict,
            division: targetDivision,
            paymentMethod,
          }),
        },
      });

      return newOrder;
    });

    return NextResponse.json({ success: true, order: result });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 400 }
    );
  }
}
