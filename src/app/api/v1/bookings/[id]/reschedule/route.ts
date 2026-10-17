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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { proposedDate, proposedTimeSlot, reason } = body;

    if (!proposedDate || !proposedTimeSlot || !reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: 'Proposed date, time slot, and a clear reason (min 5 chars) are required.' },
        { status: 400 }
      );
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

    // Role verification
    if (session.role === 'TECHNICIAN') {
      const tech = await prisma.technicianProfile.findUnique({ where: { userId: session.id } });
      if (!tech || booking.technicianId !== tech.id) {
        return NextResponse.json({ error: 'Forbidden: You are not assigned to this booking' }, { status: 403 });
      }
    } else if (session.role === 'CUSTOMER') {
      const cust = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
      if (!cust || booking.customerId !== cust.id) {
        return NextResponse.json({ error: 'Forbidden: You do not own this booking' }, { status: 403 });
      }
    } else if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    const note = `[RESCHEDULE REQUEST]: Proposed new schedule: ${proposedDate} (${proposedTimeSlot}). Reason: ${reason.trim()} - Requested by ${session.name} (${session.role}).`;

    await prisma.bookingTimeline.create({
      data: {
        bookingId: id,
        status: 'RESCHEDULE_REQUESTED',
        actorId: session.id,
        actorRole: session.role,
        note,
      },
    });

    // Notify counterpart
    const notifyUserId = session.role === 'TECHNICIAN'
      ? booking.customer?.userId
      : booking.technician?.userId;

    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          title: `Reschedule Requested for Job #${booking.bookingNumber}`,
          message: `${session.name} requested rescheduling to ${proposedDate} (${proposedTimeSlot}). Reason: ${reason}`,
          type: 'BOOKING',
          link: session.role === 'TECHNICIAN' ? '/customer/dashboard' : `/technician/jobs/${id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Reschedule request submitted successfully. Waiting for confirmation.',
      request: { proposedDate, proposedTimeSlot, reason },
    });
  } catch (error: any) {
    console.error('Reschedule request error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit reschedule request' }, { status: 500 });
  }
}
