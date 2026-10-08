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
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        address: true,
        technician: {
          include: {
            user: { select: { name: true, phone: true, avatarUrl: true } },
          },
        },
        customer: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
        timeline: {
          orderBy: { timestamp: 'asc' },
        },
        reviews: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const { status, note, paymentStatus } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { technician: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update status & record timeline
    const updated = await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (status === 'COMPLETED') updateData.completedAt = new Date();

      const res = await tx.booking.update({
        where: { id },
        data: updateData,
      });

      if (status) {
        await tx.bookingTimeline.create({
          data: {
            bookingId: id,
            status,
            actorId: session.id,
            actorRole: session.role,
            note: note || `Status updated to ${status} by ${session.name}.`,
          },
        });
      }

      // If work is completed, automatically calculate and record technician earnings & credit wallet!
      if (status === 'COMPLETED' && booking.technicianId) {
        const existingEarning = await tx.technicianEarnings.findFirst({
          where: { bookingId: id },
        });

        if (!existingEarning) {
          const serviceAmount = booking.totalAmount;
          const commissionRate = 15.0; // 15% platform fee
          const platformFee = Math.round((serviceAmount * commissionRate) / 100);
          const technicianAmount = serviceAmount - platformFee;

          await tx.technicianEarnings.create({
            data: {
              technicianId: booking.technicianId,
              bookingId: id,
              serviceAmount,
              platformFee,
              commissionRate,
              technicianAmount,
              status: 'AVAILABLE',
            },
          });

          // Update technician profile wallet balance & total completed jobs
          const tech = await tx.technicianProfile.update({
            where: { id: booking.technicianId },
            data: {
              walletBalance: { increment: technicianAmount },
              totalCompletedJobs: { increment: 1 },
            },
          });

          // Record wallet transaction
          await tx.walletTransaction.create({
            data: {
              technicianId: booking.technicianId,
              type: 'JOB_EARNING',
              amount: technicianAmount,
              balanceAfter: tech.walletBalance,
              description: `Earnings from completed job ${booking.bookingNumber}`,
              referenceId: booking.bookingNumber,
              status: 'COMPLETED',
            },
          });
        }
      }

      return res;
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update booking' }, { status: 500 });
  }
}
