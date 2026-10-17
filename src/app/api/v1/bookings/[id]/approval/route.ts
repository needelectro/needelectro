import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { action, extraAmount = 0, notes } = body; // action: 'APPROVE' | 'REJECT'

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json({ error: 'Action must be APPROVE or REJECT' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: { include: { user: true } },
        technician: { include: { user: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only customer who owns booking or Admin can approve/reject
    if (session.role === 'CUSTOMER') {
      const customer = await prisma.customerProfile.findUnique({
        where: { userId: session.id },
      });
      if (!customer || booking.customerId !== customer.id) {
        return NextResponse.json({ error: 'Forbidden: You do not own this booking' }, { status: 403 });
      }
    } else if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only customer or admin can approve additional costs' }, { status: 403 });
    }

    const approvedAmount = Number(extraAmount) || 0;
    const nextStatus = 'IN_PROGRESS';

    const updated = await prisma.$transaction(async (tx: any) => {
      const updateData: any = {
        status: nextStatus,
      };

      if (action === 'APPROVE' && approvedAmount > 0) {
        updateData.totalAmount = { increment: approvedAmount };
      }

      const res = await tx.booking.update({
        where: { id },
        data: updateData,
      });

      const timelineNote = action === 'APPROVE'
        ? `Customer approved additional work/cost of ৳${approvedAmount.toLocaleString()}${notes ? `. Notes: ${notes}` : ''}. Work resumed.`
        : `Customer declined additional work/cost${notes ? `. Reason: ${notes}` : ''}. Service resumed under original estimate.`;

      await tx.bookingTimeline.create({
        data: {
          bookingId: id,
          status: 'APPROVAL_DECISION',
          actorId: session.id,
          actorRole: session.role,
          note: timelineNote,
        },
      });

      // Notify technician
      if (booking.technician?.userId) {
        await tx.notification.create({
          data: {
            userId: booking.technician.userId,
            title: action === 'APPROVE' ? 'Additional Cost Approved' : 'Additional Cost Declined',
            message: timelineNote,
            type: 'BOOKING',
            link: `/technician/jobs/${id}`,
          },
        });
      }

      return res;
    });

    return NextResponse.json({
      success: true,
      message: action === 'APPROVE' ? 'Additional cost approved. Technician notified to proceed.' : 'Additional cost declined. Technician notified.',
      booking: updated,
    });
  } catch (error: any) {
    console.error('Approval action error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process approval' }, { status: 500 });
  }
}
