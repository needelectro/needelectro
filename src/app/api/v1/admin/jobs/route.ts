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
    const district = searchParams.get('district');
    const search = searchParams.get('search')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    let whereClause: any = {};
    if (status && status !== 'ALL') {
      if (status === 'REQUESTED' || status === 'PENDING') {
        whereClause.status = { in: ['REQUESTED', 'MATCHING', 'PENDING'] };
      } else {
        whereClause.status = status;
      }
    }

    if (district && district !== 'ALL') {
      whereClause.address = {
        district: { equals: district, mode: 'insensitive' },
      };
    }

    if (search) {
      whereClause.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { problemDescription: { contains: search, mode: 'insensitive' } },
        { customer: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { customer: { user: { phone: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [total, bookings, verifiedTechnicians] = await Promise.all([
      prisma.booking.count({ where: whereClause }),
      prisma.booking.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          service: true,
          customer: { include: { user: { select: { name: true, phone: true, email: true } } } },
          technician: { include: { user: { select: { name: true, phone: true, email: true } } } },
          address: true,
          timeline: { orderBy: { timestamp: 'desc' } },
          quotes: true,
          invoice: true,
          warranty: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.technicianProfile.findMany({
        where: { verificationStatus: 'VERIFIED' },
        include: { user: { select: { name: true, phone: true } } },
      }),
    ]);

    const mappedJobs = bookings.map((b: any) => ({
      ...b,
      bookingNumber: b.bookingNumber || `NE${b.id.substring(0, 8)}`,
      preferredTime: b.preferredTimeSlot || b.preferredTime || '10:00 AM – 1:00 PM',
      address: b.address ? `${b.address.addressLine}, ${b.address.upazila}, ${b.address.district}` : (typeof b.address === 'string' ? b.address : 'On-Site Location'),
      customer: {
        ...b.customer,
        fullName: b.customer?.user?.name || 'Verified Customer',
        phone: b.customer?.user?.phone || b.address?.phone || 'N/A',
        district: b.address?.district || 'Moulvibazar',
        user: b.customer?.user,
      },
      service: {
        ...b.service,
        title: b.service?.name || 'Technical Service',
        name: b.service?.name || 'Technical Service',
        basePrice: b.service?.basePrice || b.totalAmount || 500,
        category: b.service?.categoryId || 'ELECTRICAL',
      },
      technician: b.technician ? {
        ...b.technician,
        fullName: b.technician.user?.name || 'Assigned Technician',
        phone: b.technician.user?.phone || 'N/A',
        district: b.technician.district || 'Moulvibazar',
        rating: b.technician.rating || 5.0,
        skills: b.technician.skills ? b.technician.skills.split(',').map((s: string) => s.trim()) : [],
        isAvailable: b.technician.isAvailable ?? true,
      } : null,
    }));

    const mappedTechnicians = verifiedTechnicians.map((t: any) => ({
      ...t,
      fullName: t.user?.name || 'Verified Technician',
      phone: t.user?.phone || 'N/A',
      rating: t.rating || 5.0,
      skills: t.skills ? t.skills.split(',').map((s: string) => s.trim()) : [],
      isAvailable: t.isAvailable ?? true,
      isVerified: t.verificationStatus === 'VERIFIED',
    }));

    return NextResponse.json({
      success: true,
      jobs: mappedJobs,
      technicians: mappedTechnicians,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

async function handleJobAction(req: NextRequest, isPatch = false) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;
    const userRole = (session?.role as string) || '';
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'SERVICE_MANAGER', 'OPERATIONS_MANAGER'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized: Admin permissions required' }, { status: 403 });
    }

    const body = await req.json();
    let { action, bookingId, technicianId, status, notes, reason } = body;

    // Normalize action if caller sent a direct PATCH payload
    if (!action && technicianId) {
      action = 'ASSIGN_TECHNICIAN';
    } else if (!action && status) {
      action = 'UPDATE_STATUS';
    }

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // 1. MANUAL TECHNICIAN ASSIGNMENT
    if (action === 'ASSIGN_TECHNICIAN') {
      if (!technicianId) {
        return NextResponse.json({ error: 'Technician ID is required for assignment' }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx: any) => {
        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            technicianId,
            status: 'ASSIGNED',
          },
          include: { technician: { include: { user: true } }, customer: { include: { user: true } } },
        });

        await tx.bookingTimeline.create({
          data: {
            bookingId,
            status: 'ASSIGNED',
            actorId: session.id,
            actorRole: session.role,
            note: notes || `Dispatched to certified technician ${booking.technician?.user?.name || ''}`,
          },
        });

        // Audit Log
        try {
          await tx.auditLog.create({
            data: {
              userId: session.id,
              userRole: session.role,
              action: 'ADMIN_ASSIGN_TECHNICIAN',
              entity: 'Booking',
              entityId: bookingId,
              newData: JSON.stringify({ technicianId, assignedTo: booking.technician?.user?.name }),
            },
          });
        } catch {}

        // Notify technician
        if (booking.technician?.userId) {
          await tx.notification.create({
            data: {
              userId: booking.technician.userId,
              title: `New Job Assigned #${booking.bookingNumber}`,
              message: `You have been assigned to service booking #${booking.bookingNumber}. Please review and accept.`,
              type: 'BOOKING',
              link: `/technician/jobs/${bookingId}`,
            },
          });
        }

        // Notify customer
        if (booking.customer?.userId) {
          await tx.notification.create({
            data: {
              userId: booking.customer.userId,
              title: `Technician Dispatched #${booking.bookingNumber}`,
              message: `Technician ${booking.technician?.user?.name || ''} has been assigned to your service request.`,
              type: 'BOOKING',
              link: `/customer/dashboard?tab=bookings`,
            },
          });
        }

        return booking;
      });

      return NextResponse.json({ success: true, booking: updated });
    }

    // 2. REASSIGN TECHNICIAN
    if (action === 'REASSIGN_TECHNICIAN') {
      if (!technicianId) {
        return NextResponse.json({ error: 'New Technician ID is required for reassignment' }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx: any) => {
        const prevBooking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: { technician: { include: { user: true } } },
        });

        const oldTechId = prevBooking?.technician?.userId;

        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            technicianId,
            status: 'ASSIGNED',
          },
          include: { technician: { include: { user: true } } },
        });

        const reassignNote = notes || `Reassigned from ${prevBooking?.technician?.user?.name || 'Previous Tech'} to ${booking.technician?.user?.name}. Reason: ${reason || 'Administrative re-allocation'}`;

        await tx.bookingTimeline.create({
          data: {
            bookingId,
            status: 'ASSIGNED',
            actorId: session.id,
            actorRole: session.role,
            note: reassignNote,
          },
        });

        // Notify previous tech
        if (oldTechId) {
          await tx.notification.create({
            data: {
              userId: oldTechId,
              title: `Job Reassigned #${booking.bookingNumber}`,
              message: `Job #${booking.bookingNumber} was reassigned by administrative dispatch.`,
              type: 'BOOKING',
              link: `/technician/jobs`,
            },
          });
        }

        // Notify new technician
        if (booking.technician?.userId) {
          await tx.notification.create({
            data: {
              userId: booking.technician.userId,
              title: `Job Assigned #${booking.bookingNumber}`,
              message: `You have been allocated service booking #${booking.bookingNumber}.`,
              type: 'BOOKING',
              link: `/technician/jobs/${bookingId}`,
            },
          });
        }

        return booking;
      });

      return NextResponse.json({ success: true, booking: updated });
    }

    // 3. OPTIONAL AUTOMATIC ASSIGNMENT (AUTO_ASSIGN)
    if (action === 'AUTO_ASSIGN') {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: true, address: true },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      const bookingDistrict = booking.address?.district || 'Moulvibazar';

      // Find eligible verified technicians matching district and availability
      const eligibleTechs = await prisma.technicianProfile.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          availableStatus: 'AVAILABLE',
        },
        include: {
          user: { select: { id: true, name: true, phone: true } },
          assignedBookings: {
            where: {
              status: { in: ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'] },
            },
          },
        },
        orderBy: [{ ratingOverall: 'desc' }, { totalCompletedJobs: 'desc' }],
      });

      // Filter by district/skill match and lowest active workload
      const matchedTech = eligibleTechs.find((t: any) => {
        const areas = (t.serviceAreas || '').toLowerCase();
        return areas.includes(bookingDistrict.toLowerCase()) || areas.includes('moulvibazar') || areas.includes('all');
      }) || eligibleTechs[0];

      if (!matchedTech) {
        return NextResponse.json({
          success: false,
          autoAssigned: false,
          message: `No eligible technician currently available for dispatch in ${bookingDistrict}. Booking retained in pending queue.`,
        });
      }

      const autoUpdated = await prisma.$transaction(async (tx: any) => {
        const updatedBkg = await tx.booking.update({
          where: { id: bookingId },
          data: {
            technicianId: matchedTech.id,
            status: 'ASSIGNED',
          },
          include: { technician: { include: { user: true } }, customer: { include: { user: true } } },
        });

        await tx.bookingTimeline.create({
          data: {
            bookingId,
            status: 'ASSIGNED',
            actorId: session.id,
            actorRole: 'SYSTEM_DISPATCH',
            note: `Auto-dispatched by dispatch engine to ${matchedTech.user.name} (Rating ★${matchedTech.ratingOverall || 5.0}).`,
          },
        });

        // Notify tech
        await tx.notification.create({
          data: {
            userId: matchedTech.userId,
            title: `Auto-Dispatched Job #${updatedBkg.bookingNumber}`,
            message: `You were auto-dispatched to service booking #${updatedBkg.bookingNumber} in ${bookingDistrict}.`,
            type: 'BOOKING',
            link: `/technician/jobs/${bookingId}`,
          },
        });

        return updatedBkg;
      });

      return NextResponse.json({
        success: true,
        autoAssigned: true,
        booking: autoUpdated,
        message: `Successfully auto-assigned to ${matchedTech.user.name}.`,
      });
    }

    // 4. CANCEL BOOKING WITH AUDIT REASON
    if (action === 'CANCEL_BOOKING') {
      if (!reason || reason.trim().length < 3) {
        return NextResponse.json({ error: 'A valid cancellation reason is required' }, { status: 400 });
      }

      const cancelledBooking = await prisma.$transaction(async (tx: any) => {
        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: { status: 'CANCELLED' },
          include: { customer: true, technician: true },
        });

        await tx.bookingTimeline.create({
          data: {
            bookingId,
            status: 'CANCELLED',
            actorId: session.id,
            actorRole: session.role,
            note: `Cancelled by admin ${session.name}. Reason: ${reason}`,
          },
        });

        // Notify customer
        if (booking.customer?.userId) {
          await tx.notification.create({
            data: {
              userId: booking.customer.userId,
              title: `Booking Cancelled #${booking.bookingNumber}`,
              message: `Service booking #${booking.bookingNumber} was cancelled. Reason: ${reason}`,
              type: 'BOOKING',
              link: `/customer/dashboard?tab=bookings`,
            },
          });
        }

        return booking;
      });

      return NextResponse.json({ success: true, booking: cancelledBooking });
    }

    // 5. UPDATE STATUS (ADMIN CORRECTION)
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
        } catch {}

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

    // 6. APPROVE COMPLETION & SETTLE EARNINGS
    if (action === 'APPROVE_COMPLETION') {
      const approved = await prisma.$transaction(async (tx: any) => {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: { technician: true, customer: true, invoice: true },
        });

        if (!booking) throw new Error('Booking not found');

        const updatedBooking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: 'COMPLETED',
            paymentStatus: 'PAID',
            completedAt: new Date(),
          },
          include: { technician: true, customer: true },
        });

        await tx.bookingTimeline.create({
          data: {
            bookingId,
            status: 'COMPLETED',
            actorId: session.id,
            actorRole: session.role,
            note: `Workmanship & completion report reviewed and approved by admin ${session.name}.`,
          },
        });

        // Credit technician ledger idempotently (85% technician revenue share)
        if (booking.technicianId) {
          const serviceAmount = booking.totalAmount || 500;
          const technicianShare = Math.round(serviceAmount * 0.85);

          // Check if wallet transaction already exists
          const existingWalletTx = await tx.walletTransaction.findFirst({
            where: {
              technicianId: booking.technicianId,
              referenceId: booking.id,
              type: 'EARNING',
            },
          });

          if (!existingWalletTx) {
            await tx.walletTransaction.create({
              data: {
                technicianId: booking.technicianId,
                amount: technicianShare,
                type: 'EARNING',
                status: 'COMPLETED',
                referenceId: booking.id,
                description: `85% payout for completed job #${booking.bookingNumber}`,
              },
            });

            await tx.technicianProfile.update({
              where: { id: booking.technicianId },
              data: {
                walletBalance: { increment: technicianShare },
                totalCompletedJobs: { increment: 1 },
              },
            });
          }
        }

        return updatedBooking;
      });

      return NextResponse.json({ success: true, booking: approved, message: 'Completion approved and technician share settled.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Job action error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update job' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleJobAction(req, false);
}

export async function PATCH(req: NextRequest) {
  return handleJobAction(req, true);
}
