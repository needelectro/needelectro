import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereClause: any = {};
    if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      whereClause.userId = session.id;
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { category, subject, message, priority = 'NORMAL' } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT${dateStr}${randomSuffix}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: session.id,
        category: category || 'GENERAL',
        subject,
        message,
        priority,
        status: 'OPEN',
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
  }
}
