import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'Unauthorized technician access' }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: payload.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Fetch technician support tickets error:', error);
    return NextResponse.json({ error: 'Failed to load support tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'Unauthorized technician access' }, { status: 401 });
    }

    const body = await req.json();
    const { category, subject, message, priority = 'NORMAL', bookingId } = body;

    if (!subject || !subject.trim() || !message || !message.trim()) {
      return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-TECH-${dateStr}-${randomSuffix}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: payload.id,
        category: category || 'TECHNICIAN',
        subject: subject.trim(),
        message: message.trim() + (bookingId ? `\n[Associated Booking ID: ${bookingId}]` : ''),
        priority: priority === 'URGENT' || priority === 'HIGH' ? priority : 'NORMAL',
        status: 'OPEN',
      },
    });

    // If it's a dispute or urgent safety issue on a booking, also log dispute if bookingId exists
    if (bookingId && (category === 'DISPUTE' || category === 'SAFETY' || category === 'PAYMENT')) {
      try {
        await prisma.dispute.create({
          data: {
            bookingId,
            reporterId: payload.id,
            reporterRole: 'TECHNICIAN',
            reason: subject.trim(),
            description: message.trim(),
            status: 'OPEN',
          },
        });
      } catch {
        // Non-critical if dispute record fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Support ticket submitted successfully. Our team will review and respond promptly.',
      ticket,
    });
  } catch (error: any) {
    console.error('Create support ticket error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit support ticket.' }, { status: 500 });
  }
}
