import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, trackingNumber } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only admin can change to processing/shipped/delivered; customer can only cancel if placed
    if (session.role === 'CUSTOMER') {
      if (status !== 'CANCELLED' || order.status !== 'PLACED') {
        return NextResponse.json({ error: 'Customers can only cancel placed orders' }, { status: 403 });
      }
    }

    const updateData: any = { status };
    if (status === 'DELIVERED') {
      updateData.deliveryStatus = 'DELIVERED';
      updateData.paymentStatus = 'PAID';
    } else if (status === 'SHIPPED') {
      updateData.deliveryStatus = 'IN_TRANSIT';
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userRole: session.role,
        action: `ORDER_${status}`,
        entity: 'Order',
        entityId: id,
        newData: JSON.stringify({ status, trackingNumber }),
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
