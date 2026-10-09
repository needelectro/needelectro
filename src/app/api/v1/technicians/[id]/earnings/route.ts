import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const technician = await prisma.technicianProfile.findUnique({
      where: { id },
      include: {
        earnings: {
          include: { booking: { select: { bookingNumber: true, service: { select: { name: true } } } } },
          orderBy: { createdAt: 'desc' },
        },
        walletTransactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!technician) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    const totalEarned = (technician.earnings as Array<{ technicianAmount: number }>).reduce((sum: number, e: { technicianAmount: number }) => sum + e.technicianAmount, 0);

    return NextResponse.json({
      success: true,
      wallet: {
        availableBalance: technician.walletBalance,
        totalEarned,
        totalWithdrawn: technician.totalWithdrawn,
        totalCompletedJobs: technician.totalCompletedJobs,
      },
      earnings: technician.earnings,
      transactions: technician.walletTransactions,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 });
  }
}
