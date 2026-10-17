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

    const technician = await prisma.technicianProfile.findUnique({
      where: { userId: payload.id },
      select: { id: true, walletBalance: true, totalWithdrawn: true },
    });

    if (!technician) {
      return NextResponse.json({ error: 'Technician profile not found' }, { status: 404 });
    }

    const payouts = await prisma.payoutRequest.findMany({
      where: { technicianId: technician.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      walletBalance: technician.walletBalance,
      totalWithdrawn: technician.totalWithdrawn,
      payouts,
    });
  } catch (error) {
    console.error('Error fetching technician payouts:', error);
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
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
      return NextResponse.json({ error: 'Only technicians can request payouts' }, { status: 403 });
    }

    const body = await req.json();
    const { amount, paymentMethod, accountDetails } = body;

    const payoutAmount = parseFloat(amount);
    if (isNaN(payoutAmount) || payoutAmount < 500) {
      return NextResponse.json(
        { error: 'Minimum payout amount is ৳500.' },
        { status: 400 }
      );
    }

    const validMethods = ['BKASH', 'NAGAD', 'BANK_TRANSFER'];
    if (!paymentMethod || !validMethods.includes(paymentMethod.toUpperCase())) {
      return NextResponse.json(
        { error: 'Please select a valid payment method (bKash, Nagad, or Bank Transfer).' },
        { status: 400 }
      );
    }

    if (!accountDetails || typeof accountDetails !== 'string' || accountDetails.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please enter valid mobile wallet account number or bank transfer details.' },
        { status: 400 }
      );
    }

    // Atomic transaction: verify sufficient balance and submit payout request
    const result = await prisma.$transaction(async (tx: any) => {
      const technician = await tx.technicianProfile.findUnique({
        where: { userId: payload.id },
      });

      if (!technician) {
        throw new Error('Technician profile not found.');
      }

      if (technician.verificationStatus !== 'VERIFIED') {
        throw new Error('Technician account must be verified by NEED ELECTRO to request payouts.');
      }

      if (technician.walletBalance < payoutAmount) {
        throw new Error(`Insufficient wallet balance. Available: ৳${technician.walletBalance}, Requested: ৳${payoutAmount}`);
      }

      // Check if there is already a pending payout request
      const pendingRequest = await tx.payoutRequest.findFirst({
        where: {
          technicianId: technician.id,
          status: 'PENDING',
        },
      });

      if (pendingRequest) {
        throw new Error('You already have a pending payout request under review. Please wait until it is processed.');
      }

      // Deduct balance atomically
      const updatedTech = await tx.technicianProfile.update({
        where: { id: technician.id },
        data: {
          walletBalance: { decrement: payoutAmount },
        },
      });

      // Create Payout Request
      const payout = await tx.payoutRequest.create({
        data: {
          technicianId: technician.id,
          amount: payoutAmount,
          paymentMethod: paymentMethod.toUpperCase(),
          accountDetails: accountDetails.trim(),
          status: 'PENDING',
        },
      });

      // Create Ledger Transaction
      await tx.walletTransaction.create({
        data: {
          technicianId: technician.id,
          type: 'WITHDRAWAL',
          amount: payoutAmount,
          balanceAfter: updatedTech.walletBalance,
          description: `Payout request #${payout.id.slice(-6)} via ${paymentMethod.toUpperCase()} (${accountDetails.trim()})`,
          referenceId: payout.id,
          status: 'PENDING',
        },
      });

      // Notify technician
      await tx.notification.create({
        data: {
          userId: payload.id,
          title: 'Payout Request Submitted',
          message: `Your payout request for ৳${payoutAmount} via ${paymentMethod.toUpperCase()} has been submitted and is under operational review.`,
          type: 'WALLET',
          link: '/technician/earnings',
        },
      });

      return { payout, newBalance: updatedTech.walletBalance };
    });

    return NextResponse.json({
      success: true,
      message: `Payout request for ৳${payoutAmount} submitted successfully.`,
      payout: result.payout,
      walletBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error('Payout request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payout request.' },
      { status: 400 }
    );
  }
}
