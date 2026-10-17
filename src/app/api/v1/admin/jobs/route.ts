import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    const userRole = session?.role as string;
    if (!session || (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN' && userRole !== 'SERVICE_MANAGER' && userRole !== 'OPERATIONS_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const [bookings, verifiedTechnicians] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          service: true,
          customer: { include: { user: { select: { name: true, phone: true, email: true } } } },
          technician: { include: { user: { select: { name: true, phone: true, email: true } } } },
          address: true,
          timeline: { orderBy: { timestamp: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.technicianProfile.findMany({
        where: { verificationStatus: 'VERIFIED' },
        include: { user: { select: { name: true, phone: true } } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      jobs: bookings,
      technicians: verifiedTechnicians,
    });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'SERVICE_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { action, bookingId, technicianId, status, notes } = body;

    if (action === 'ASSIGN_TECHNICIAN') {
      const updated = await prisma.$transaction(async (tx: any) => {
        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            technicianId,
            status: 'ASSIGNED',
          },
          include: { technician: { include: { user: true } } },
        });

        await tx.bookingTimeline.create({
          data: {
            bookingId,
            status: 'ASSIGNED',
            actorId: session.id,
            actorRole: session.role,
            note: `Dispatched to master electrician ${booking.technician?.user?.name || ''}`,
          },
        });

        return booking;
      });

      return NextResponse.json({ success: true, booking: updated });
    }

    if (action === 'UPDATE_STATUS') {
      const updated = await prisma.$transaction(async (tx: any) => {
        const prevBooking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: {
            customer: true,
            technician: true,
          },
        });

        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status,
            completedAt: status === 'COMPLETED' ? new Date() : undefined,
          },
          include: {
            customer: true,
            technician: true,
          },
        });

        const auditNote = notes ? `Admin correction: ${notes}` : `Status manually corrected to ${status} by admin ${session.name}`;

        await tx.bookingTimeline.create({
          data: {
            bookingId,
            status,
            actorId: session.id,
            actorRole: session.role,
            note: auditNote,
          },
        });

        // Mandatory audit log record
        try {
          await tx.auditLog.create({
            data: {
              userId: session.id,
              userRole: session.role,
              action: 'ADMIN_CORRECT_JOB_STATUS',
              entity: 'Booking',
              entityId: bookingId,
              previousData: JSON.stringify({ status: prevBooking?.status }),
              newData: JSON.stringify({ status, notes: auditNote }),
            },
          });
        } catch {
          // ignore non-critical audit log failure
        }

        // Notify technician if assigned
        if (booking.technician?.userId) {
          await tx.notification.create({
            data: {
              userId: booking.technician.userId,
              title: `Admin Updated Job #${booking.bookingNumber}`,
              message: `Job status adjusted to ${status}. Details: ${auditNote}`,
              type: 'BOOKING',
              link: `/technician/jobs/${bookingId}`,
            },
          });
        }

        return booking;
      });

      return NextResponse.json({ success: true, booking: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Job action error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update job' }, { status: 500 });
  }
}
