import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'ACCOUNTANT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payouts = await prisma.payoutRequest.findMany({
      include: {
        technician: {
          include: { user: { select: { name: true, phone: true, email: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, payouts });
  } catch (error) {
    console.error('Fetch payouts error:', error);
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'ACCOUNTANT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { payoutId, status: rawStatus, trxId: rawTrx, transactionRef, adminNotes } = body;
    const status = rawStatus === 'APPROVED' ? 'PAID' : rawStatus;
    const trxId = rawTrx || transactionRef || '';

    const result = await prisma.$transaction(async (tx: any) => {
      const payout = await tx.payoutRequest.findUnique({
        where: { id: payoutId },
        include: { technician: true },
      });
      if (!payout) throw new Error('Payout request not found');

      const updated = await tx.payoutRequest.update({
        where: { id: payoutId },
        data: {
          status,
          trxId,
          adminNotes,
          paidAt: status === 'PAID' ? new Date() : undefined,
          approvedBy: session.name,
        },
      });

      // If marked as PAID, deduct from technician wallet balance and add wallet transaction record
      if (status === 'PAID') {
        const newBalance = Math.max(0, payout.technician.walletBalance - payout.amount);
        await tx.technicianProfile.update({
          where: { id: payout.technicianId },
          data: {
            walletBalance: newBalance,
            totalWithdrawn: { increment: payout.amount },
          },
        });

        await tx.walletTransaction.create({
          data: {
            technicianId: payout.technicianId,
            type: 'WITHDRAWAL',
            amount: -payout.amount,
            balanceAfter: newBalance,
            description: `Payout processed via ${payout.paymentMethod} (Trx: ${trxId || 'N/A'})`,
            status: 'COMPLETED',
            referenceId: payout.id,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, payout: result });
  } catch (error: any) {
    console.error('Payout update error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update payout' }, { status: 500 });
  }
}

export const PATCH = POST;
