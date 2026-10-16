import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const phone = searchParams.get('phone')?.trim();

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true,
                discountPrice: true,
                warrantyPeriodMonths: true,
              },
            },
          },
        },
        deliveryAddress: true,
        customer: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Phone verification for security if phone was provided or customer has phone
    if (phone) {
      const sanitizedInput = phone.replace(/[^0-9]/g, '');
      const addrPhone = order.deliveryAddress?.phone?.replace(/[^0-9]/g, '') || '';
      const userPhone = order.customer?.user?.phone?.replace(/[^0-9]/g, '') || '';

      const match = (addrPhone && addrPhone.endsWith(sanitizedInput.slice(-10))) ||
                    (userPhone && userPhone.endsWith(sanitizedInput.slice(-10)));

      if (!match) {
        return NextResponse.json(
          { error: 'Phone number does not match this order record' },
          { status: 403 }
        );
      }
    }

    // Sanitize response so only safe tracking information is returned
    const sanitizedOrder = {
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      subtotal: order.subtotal,
      deliveryCharge: order.deliveryCharge,
      discount: order.discount,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryAddress: order.deliveryAddress ? {
        recipientName: order.deliveryAddress.recipientName,
        district: order.deliveryAddress.district,
        division: order.deliveryAddress.division,
        area: order.deliveryAddress.area,
      } : null,
      items: order.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
        product: i.product,
      })),
    };

    return NextResponse.json({ success: true, order: sanitizedOrder });
  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json({ error: 'Failed to retrieve order tracking' }, { status: 500 });
  }
}
