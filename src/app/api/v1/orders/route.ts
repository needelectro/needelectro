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

    // Resolve Address
    let addressId = typeof deliveryAddress === 'string' ? deliveryAddress : null;
    if (!addressId && typeof deliveryAddress === 'object') {
      const createdAddr = await prisma.address.create({
        data: {
          customerId: customerProfileId,
          recipientName: deliveryAddress.recipientName || 'Customer',
          phone: deliveryAddress.phone || '01733983752',
          division: deliveryAddress.division || 'Sylhet',
          district: deliveryAddress.district || 'Moulvibazar',
          upazila: deliveryAddress.upazila || 'Moulvibazar Sadar',
          area: deliveryAddress.area || 'Moulvibazar Sadar',
          addressLine: deliveryAddress.addressLine || 'Moulvibazar, Bangladesh',
          landmark: deliveryAddress.landmark,
        },
      });
      addressId = createdAddr.id;
    }

    // Calculate subtotal securely on the server side & aggregate seller items
    let subtotal = 0;
    const orderItemsData: any[] = [];
    const sellerItemsMap: Map<string, { items: any[]; subtotal: number; commissionRate: number }> = new Map();

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { seller: true },
      });
      if (!product) continue;
      const unitPrice = product.discountPrice ?? product.price;
      const qty = item.quantity || 1;
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

      // Decrement stock
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: qty } },
      });
    }

    const deliveryCharge = subtotal > 10000 ? 0 : 60;
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

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customerProfileId,
        status: 'PLACED',
        subtotal,
        deliveryCharge,
        discount,
        totalAmount,
        paymentMethod,
        paymentStatus: 'PENDING',
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

    // Record financial audit log
    await prisma.auditLog.create({
      data: {
        userId: session?.id || null,
        userRole: session?.role || 'CUSTOMER',
        action: 'ORDER_PLACED',
        entity: 'ORDER',
        entityId: order.id,
        newData: JSON.stringify({
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          paymentMethod,
          subOrdersCount: subOrdersCreate.length,
        }),
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
