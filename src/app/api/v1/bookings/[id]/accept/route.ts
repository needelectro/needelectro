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
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Booking not found');
      }

      if (existing.technicianId || existing.status !== 'MATCHING') {
        throw new Error('This job has already been claimed by another technician.');
      }

      const updated = await tx.booking.update({
        where: { id },
        data: {
          technicianId: technician.id,
          status: 'ASSIGNED',
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
