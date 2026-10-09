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

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: { product: true },
        },
        deliveryAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, orders });
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

    // Resolve customer profile
    let customerProfileId = session?.customerProfileId;
    if (!customerProfileId) {
      if (session) {
        let cp = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
        if (!cp) {
          cp = await prisma.customerProfile.create({ data: { userId: session.id } });
        }
        customerProfileId = cp.id;
      } else {
        const defaultCust = await prisma.user.findFirst({
          where: { role: 'CUSTOMER' },
          include: { customerProfile: true },
        });
        customerProfileId = defaultCust?.customerProfile?.id;
      }
    }

    if (!customerProfileId) {
      return NextResponse.json({ error: 'Customer profile required' }, { status: 400 });
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
          area: deliveryAddress.area || 'Kusumbag',
          addressLine: deliveryAddress.addressLine || 'Shop #5, MR Plaza',
          landmark: deliveryAddress.landmark,
        },
      });
      addressId = createdAddr.id;
    }

    // Calculate subtotal securely on the server side
    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
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
      },
      include: {
        items: { include: { product: true } },
        deliveryAddress: true,
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
        newData: JSON.stringify({ orderNumber: order.orderNumber, totalAmount: order.totalAmount, paymentMethod }),
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
