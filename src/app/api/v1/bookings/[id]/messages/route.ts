import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
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

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        technician: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Role verification
    if (session.role === 'TECHNICIAN') {
      const tech = await prisma.technicianProfile.findUnique({ where: { userId: session.id } });
      if (!tech || booking.technicianId !== tech.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (session.role === 'CUSTOMER') {
      const cust = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
      if (!cust || booking.customerId !== cust.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const messages = await prisma.bookingTimeline.findMany({
      where: {
        bookingId: id,
        status: { in: ['MESSAGE', 'DELAY_NOTE', 'ARRIVAL_UPDATE', 'APPROVAL_REQUEST', 'APPROVAL_DECISION'] },
      },
      orderBy: { timestamp: 'asc' },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Fetch booking messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

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
    const { message, messageType = 'MESSAGE' } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
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

    let recipientUserId: string | null = null;
    let senderRoleLabel = 'Support';

    if (session.role === 'TECHNICIAN') {
      const tech = await prisma.technicianProfile.findUnique({ where: { userId: session.id } });
      if (!tech || booking.technicianId !== tech.id) {
        return NextResponse.json({ error: 'Forbidden: Not your assigned job' }, { status: 403 });
      }
      recipientUserId = booking.customer?.userId || null;
      senderRoleLabel = 'Technician';
    } else if (session.role === 'CUSTOMER') {
      const cust = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
      if (!cust || booking.customerId !== cust.id) {
        return NextResponse.json({ error: 'Forbidden: Not your booking' }, { status: 403 });
      }
      recipientUserId = booking.technician?.userId || null;
      senderRoleLabel = 'Customer';
    } else if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
      recipientUserId = booking.technician?.userId || booking.customer?.userId || null;
      senderRoleLabel = 'NEED ELECTRO Support';
    } else {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    const formattedNote = `[${senderRoleLabel} - ${session.name}]: ${message.trim()}`;

    const newTimelineMsg = await prisma.bookingTimeline.create({
      data: {
        bookingId: id,
        status: messageType,
        actorId: session.id,
        actorRole: session.role,
        note: formattedNote,
      },
    });

    // Notify recipient if present
    if (recipientUserId) {
      await prisma.notification.create({
        data: {
          userId: recipientUserId,
          title: `New Message on Job #${booking.bookingNumber}`,
          message: `${session.name}: ${message.trim().slice(0, 80)}`,
          type: 'BOOKING',
          link: session.role === 'TECHNICIAN' ? '/customer/dashboard' : `/technician/jobs/${id}`,
        },
      });
    }

    return NextResponse.json({ success: true, message: newTimelineMsg });
  } catch (error: any) {
    console.error('Send booking message error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}
