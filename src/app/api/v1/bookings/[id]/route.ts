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
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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
        quotes: true,
        jobAssignments: {
          include: {
            technician: {
              include: { user: { select: { name: true, phone: true } } },
            },
          },
          orderBy: { offeredAt: 'desc' },
        },
        invoice: {
          include: {
            payments: true,
            warranty: true,
          },
        },
        warranty: true,
        bookingParts: {
          include: { part: true },
        },
        reviews: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Role-based record ownership enforcement
    if (session.role === 'CUSTOMER') {
      const customer = await prisma.customerProfile.findUnique({
        where: { userId: session.id },
      });
      if (!customer || booking.customerId !== customer.id) {
        return NextResponse.json({ error: 'Access denied to this booking' }, { status: 403 });
      }
    } else if (session.role === 'TECHNICIAN') {
      const tech = await prisma.technicianProfile.findUnique({
        where: { userId: session.id },
      });
      if (!tech) {
        return NextResponse.json({ error: 'Technician profile not found' }, { status: 404 });
      }
      
      const isAssigned = booking.technicianId === tech.id;
      const isUnclaimed = !booking.technicianId && ['MATCHING', 'REQUESTED', 'CONFIRMED', 'OFFERED', 'AVAILABLE'].includes(booking.status);

      if (!isAssigned && !isUnclaimed) {
        return NextResponse.json({ error: 'Access denied: You are not assigned to this job' }, { status: 403 });
      }

      // If viewing unclaimed job, sanitize customer private contact details
      if (isUnclaimed) {
        return NextResponse.json({
          success: true,
          booking: {
            ...booking,
            customer: {
              user: {
                name: 'Verified Customer',
                phone: 'Hidden until accepted',
              },
            },
            address: booking.address ? {
              division: booking.address.division,
              district: booking.address.district,
              upazila: booking.address.upazila,
              area: booking.address.area,
              addressLine: 'Full address revealed upon job acceptance',
            } : null,
          },
        });
      }
    } else if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Fetch booking by id error:', error);
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

    const body = await req.json();
    const {
      status,
      note,
      paymentStatus,
      technicianId,
      technicianNotes,
      customerNotes,
      beforePhotos,
      afterPhotos,
    } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        technician: true,
        service: true,
        bookingParts: true,
        invoice: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const VALID_TECHNICIAN_TRANSITIONS: Record<string, string[]> = {
      ASSIGNED: ['ACCEPTED', 'REJECTED'],
      ACCEPTED: ['ON_THE_WAY', 'REJECTED', 'CANCELLED'],
      ON_THE_WAY: ['ARRIVED', 'ON_HOLD'],
      ARRIVED: ['INSPECTION_STARTED', 'IN_PROGRESS', 'WORK_STARTED', 'ON_HOLD'],
      INSPECTION_STARTED: ['AWAITING_APPROVAL', 'IN_PROGRESS', 'WORK_STARTED', 'ON_HOLD'],
      AWAITING_APPROVAL: ['IN_PROGRESS', 'WORK_STARTED', 'ON_HOLD', 'CANCELLED'],
      IN_PROGRESS: ['ON_HOLD', 'AWAITING_APPROVAL', 'COMPLETED', 'WORK_COMPLETED'],
      WORK_STARTED: ['ON_HOLD', 'AWAITING_APPROVAL', 'COMPLETED', 'WORK_COMPLETED'],
      ON_HOLD: ['IN_PROGRESS', 'WORK_STARTED', 'AWAITING_APPROVAL', 'CANCELLED'],
      COMPLETED: ['DISPUTED'],
      WORK_COMPLETED: ['DISPUTED'],
      DISPUTED: [],
      CANCELLED: [],
      REJECTED: [],
    };

    // Role-based authorization & tamper guard
    if (session.role === 'TECHNICIAN') {
      const tech = await prisma.technicianProfile.findUnique({
        where: { userId: session.id },
      });
      if (!tech || booking.technicianId !== tech.id) {
        return NextResponse.json(
          { error: 'Forbidden: You are not the assigned technician for this booking' },
          { status: 403 }
        );
      }
      if (booking.status === 'CANCELLED') {
        return NextResponse.json(
          { error: 'Cannot update a cancelled booking without administrative authorization' },
          { status: 400 }
        );
      }

      // Enforce status transition lifecycle if status is being changed
      if (status && status !== booking.status) {
        const currentNormalized = booking.status === 'WORK_COMPLETED' ? 'COMPLETED' : (booking.status === 'WORK_STARTED' ? 'IN_PROGRESS' : booking.status);
        const targetNormalized = status === 'WORK_COMPLETED' ? 'COMPLETED' : (status === 'WORK_STARTED' ? 'IN_PROGRESS' : status);

        const allowedTransitions = VALID_TECHNICIAN_TRANSITIONS[currentNormalized] || [];
        if (!allowedTransitions.includes(status) && !allowedTransitions.includes(targetNormalized)) {
          return NextResponse.json(
            {
              error: `Invalid status transition: Cannot transition job directly from ${booking.status} to ${status}. Work lifecycle stages must be observed.`,
            },
            { status: 400 }
          );
        }

        // Reasons mandatory for rejection, cancellation, or hold
        if (['REJECTED', 'CANCELLED', 'ON_HOLD'].includes(targetNormalized)) {
          if (!note || note.trim().length < 3) {
            return NextResponse.json(
              { error: `A clear reason/note is required when setting job status to ${status}.` },
              { status: 400 }
            );
          }
        }

        // Completion report requirements
        if (targetNormalized === 'COMPLETED') {
          const hasReport = (technicianNotes && technicianNotes.trim().length >= 5) || (body.workPerformed && body.workPerformed.trim().length >= 5);
          if (!hasReport) {
            return NextResponse.json(
              { error: 'Completion report requires documentation of work performed and final diagnosis/resolution.' },
              { status: 400 }
            );
          }
        }
      }
    } else if (session.role === 'CUSTOMER') {
      const customer = await prisma.customerProfile.findUnique({
        where: { userId: session.id },
      });
      if (!customer || booking.customerId !== customer.id) {
        return NextResponse.json(
          { error: 'Forbidden: You cannot modify this booking' },
          { status: 403 }
        );
      }
    } else if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const updateData: any = {};
      if (status) updateData.status = status;
      
      // Only admins can alter payment status or reassign technician
      if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (technicianId) updateData.technicianId = technicianId;
      }

      if (technicianNotes !== undefined) updateData.technicianNotes = technicianNotes;
      if (customerNotes !== undefined) updateData.customerNotes = customerNotes;
      if (beforePhotos !== undefined) updateData.beforePhotos = beforePhotos;
      if (afterPhotos !== undefined) updateData.afterPhotos = afterPhotos;

      // Handle structured completion payload
      if (body.workPerformed) {
        const fullReport = `[WORK PERFORMED]: ${body.workPerformed}\n[RESOLUTION]: ${body.finalResolution || 'Resolved'}${body.handoverNotes ? `\n[HANDOVER NOTES]: ${body.handoverNotes}` : ''}${technicianNotes ? `\n[NOTES]: ${technicianNotes}` : ''}`;
        updateData.technicianNotes = fullReport;
      }

      const isCompleted = status === 'COMPLETED' || status === 'WORK_COMPLETED';
      if (isCompleted) {
        updateData.completedAt = new Date();
        updateData.status = 'COMPLETED';
      }

      const res = await tx.booking.update({
        where: { id },
        data: updateData,
        include: {
          service: true,
          technician: { include: { user: true } },
          customer: { include: { user: true } },
          bookingParts: true,
          invoice: true,
          warranty: true,
        },
      });

      // Add timeline event
      if (status || note) {
        const defaultNotes: Record<string, string> = {
          ACCEPTED: `Job accepted by technician ${session.name}.`,
          ON_THE_WAY: `Technician ${session.name} is on the way to the service location.`,
          ARRIVED: `Technician arrived at site at ${new Date().toLocaleTimeString('en-US')}.`,
          INSPECTION_STARTED: `Technician started technical inspection and diagnosis.`,
          AWAITING_APPROVAL: `Additional work or spare parts submitted for approval.`,
          IN_PROGRESS: `Work is actively in progress.`,
          WORK_STARTED: `Work is actively in progress.`,
          ON_HOLD: `Job placed on hold: ${note || 'Paused'}`,
          COMPLETED: `Technician completed work and submitted completion report.`,
          REJECTED: `Assignment rejected: ${note || 'Technician unavailable'}`,
          CANCELLED: `Service cancelled: ${note || 'Cancelled'}`,
          DISPUTED: `Dispute flagged: ${note || 'Under review'}`,
        };

        const timelineNote = note || defaultNotes[status] || `Status updated to ${isCompleted ? 'COMPLETED' : status} by ${session.name}.`;

        await tx.bookingTimeline.create({
          data: {
            bookingId: id,
            status: isCompleted ? 'COMPLETED' : status || booking.status,
            actorId: session.id,
            actorRole: session.role,
            note: timelineNote,
          },
        });

        // Customer In-App Notification Trigger
        if (res.customer?.userId && session.role === 'TECHNICIAN') {
          const notifTitles: Record<string, string> = {
            ACCEPTED: 'Technician Assigned & Confirmed',
            ON_THE_WAY: 'Technician Is En Route',
            ARRIVED: 'Technician Has Arrived',
            INSPECTION_STARTED: 'Technical Inspection Started',
            AWAITING_APPROVAL: 'Approval Required: Additional Service/Parts Cost',
            IN_PROGRESS: 'Work In Progress',
            WORK_STARTED: 'Work In Progress',
            ON_HOLD: 'Service Temporarily On Hold',
            COMPLETED: 'Service Call Completed — View Warranty & Receipt',
            CANCELLED: 'Booking Update: Cancelled',
            REJECTED: 'Service Call Update',
          };

          const title = notifTitles[status];
          if (title) {
            await tx.notification.create({
              data: {
                userId: res.customer.userId,
                title,
                message: timelineNote,
                type: 'BOOKING',
                link: `/customer/dashboard`,
              },
            });
          }
        }

        // Admin Audit Log on Admin status changes
        if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
          try {
            await tx.auditLog.create({
              data: {
                userId: session.id,
                userRole: session.role,
                action: 'UPDATE_BOOKING_STATUS',
                entity: 'Booking',
                entityId: id,
                previousData: JSON.stringify({ status: booking.status, paymentStatus: booking.paymentStatus }),
                newData: JSON.stringify({ status: res.status, paymentStatus: res.paymentStatus, reason: note }),
              },
            });
          } catch {
            // ignore non-critical audit log failure
          }
        }
      }

      // If technician is assigned, create/update job assignment
      const assignedTechId = technicianId || booking.technicianId;
      if (assignedTechId && (status === 'ASSIGNED' || technicianId)) {
        const existingAssignment = await tx.jobAssignment.findFirst({
          where: { bookingId: id, technicianId: assignedTechId },
        });

        if (!existingAssignment) {
          await tx.jobAssignment.create({
            data: {
              bookingId: id,
              technicianId: assignedTechId,
              status: 'ACCEPTED',
              respondedAt: new Date(),
              notes: note || 'Dispatched and confirmed',
            },
          });
        }
      }

      // If job is completed, generate ServiceInvoice, ServiceWarranty, and Technician Earnings
      if (isCompleted) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);

        // 1. ServiceInvoice
        let invoice = await tx.serviceInvoice.findUnique({
          where: { bookingId: id },
        });

        const totalPartsCost = res.bookingParts?.reduce((acc: number, p: any) => acc + (p.totalPrice || 0), 0) || 0;
        const laborCost = Math.max(0, res.totalAmount - totalPartsCost);

        if (!invoice) {
          invoice = await tx.serviceInvoice.create({
            data: {
              invoiceNumber: `INV-SRV-${dateStr}${randomSuffix}`,
              bookingId: id,
              laborAmount: laborCost,
              partsAmount: totalPartsCost,
              totalAmount: res.totalAmount,
              paymentStatus: res.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID',
              paymentMethod: res.paymentMethod || 'CASH_ON_DELIVERY',
              paidAt: res.paymentStatus === 'PAID' ? new Date() : null,
            },
          });
        }

        // 2. ServiceWarranty (automatic 30-day workmanship warranty)
        const existingWarranty = await tx.serviceWarranty.findUnique({
          where: { bookingId: id },
        });

        if (!existingWarranty) {
          const startDate = new Date();
          const expiryDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          await tx.serviceWarranty.create({
            data: {
              warrantyNumber: `WR-${dateStr}${randomSuffix}`,
              invoiceId: invoice.id,
              bookingId: id,
              serviceTitle: res.service?.title || 'NEED ELECTRO Technical Service',
              warrantyPeriodDays: 30,
              startDate,
              expiryDate,
              terms: 'Covers workmanship, electrical safety, and technical execution for 30 calendar days across Bangladesh.',
              status: 'ACTIVE',
            },
          });
        }

        // 3. 85/15 Technician Earnings & Wallet Credit
        const activeTechId = assignedTechId || res.technicianId;
        if (activeTechId) {
          const existingEarning = await tx.technicianEarnings.findFirst({
            where: { bookingId: id },
          });

          if (!existingEarning) {
            const serviceAmount = res.totalAmount;
            const commissionRate = 15.0; // 15% platform fee
            const platformFee = Math.round((serviceAmount * commissionRate) / 100);
            const technicianAmount = serviceAmount - platformFee;

            await tx.technicianEarnings.create({
              data: {
                technicianId: activeTechId,
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
              where: { id: activeTechId },
              data: {
                walletBalance: { increment: technicianAmount },
                totalCompletedJobs: { increment: 1 },
              },
            });

            // Record wallet transaction
            await tx.walletTransaction.create({
              data: {
                technicianId: activeTechId,
                type: 'JOB_EARNING',
                amount: technicianAmount,
                balanceAfter: tech.walletBalance,
                description: `Earnings from completed job ${res.bookingNumber}`,
                referenceId: res.bookingNumber,
                status: 'COMPLETED',
              },
            });
          }
        }
      }

      // Handle payment status PAID
      if (paymentStatus === 'PAID') {
        const inv = await tx.serviceInvoice.findUnique({ where: { bookingId: id } });
        if (inv) {
          await tx.serviceInvoice.update({
            where: { id: inv.id },
            data: { paymentStatus: 'PAID', paidAt: new Date() },
          });

          const existingPay = await tx.servicePayment.findFirst({
            where: { bookingId: id, status: 'PAID' },
          });

          if (!existingPay) {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            await tx.servicePayment.create({
              data: {
                paymentNumber: `PAY-${dateStr}${randomSuffix}`,
                invoiceId: inv.id,
                bookingId: id,
                amount: res.totalAmount,
                paymentType: 'FINAL',
                paymentMethod: res.paymentMethod || 'CASH_ON_DELIVERY',
                status: 'PAID',
                paidAt: new Date(),
              },
            });
          }
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
