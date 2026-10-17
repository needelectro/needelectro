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

    if (!session || session.role !== 'TECHNICIAN') {
      return NextResponse.json(
        { error: 'Only technicians can accept available jobs' },
        { status: 403 }
      );
    }

    const technician = await prisma.technicianProfile.findUnique({
      where: { userId: session.id },
    });

    if (!technician) {
      return NextResponse.json(
        { error: 'Technician profile not found' },
        { status: 404 }
      );
    }

    // Must be verified
    if (technician.verificationStatus !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Your technician profile must be verified by NEED ELECTRO to accept jobs.' },
        { status: 403 }
      );
    }

    // Atomic transaction to prevent race conditions
    const updatedBooking = await prisma.$transaction(async (tx: any) => {
      const existing = await tx.booking.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Booking not found');
      }

      const claimableStatuses = ['MATCHING', 'REQUESTED', 'CONFIRMED', 'OFFERED', 'AVAILABLE'];
      if (existing.technicianId || !claimableStatuses.includes(existing.status)) {
        throw new Error('This job has already been claimed or is not available for dispatch.');
      }

      const updated = await tx.booking.update({
        where: { id },
        data: {
          technicianId: technician.id,
          status: 'ASSIGNED',
        },
      });

      await tx.jobAssignment.create({
        data: {
          bookingId: id,
          technicianId: technician.id,
          status: 'ACCEPTED',
          respondedAt: new Date(),
          notes: `Directly claimed by ${session.name}`,
        },
      });

      await tx.bookingTimeline.create({
        data: {
          bookingId: id,
          status: 'ASSIGNED',
          actorId: session.id,
          actorRole: 'TECHNICIAN',
          note: `Job accepted by verified technician ${session.name}.`,
        },
      });

      return updated;
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    return NextResponse.json({
      success: true,
      message: 'Job successfully claimed and assigned to you!',
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error('Accept job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept job' },
      { status: 400 }
    );
  }
}
