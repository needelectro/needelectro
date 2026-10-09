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
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const technician = await prisma.technicianProfile.findUnique({
      where: { userId: payload.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            status: true,
          },
        },
        earnings: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        walletTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!technician) {
      return NextResponse.json({ error: 'Technician profile not found' }, { status: 404 });
    }

    return NextResponse.json({ technician });
  } catch (error) {
    console.error('Error in technicians/me:', error);
    return NextResponse.json({ error: 'Failed to fetch technician profile' }, { status: 500 });
  }
}
