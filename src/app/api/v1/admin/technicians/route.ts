import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth, recordAuditLog } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'technicians:read');
    if (!auth.authorized) return auth.response!;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
        { serviceAreas: { contains: search, mode: 'insensitive' } },
        { skills: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status && status !== 'ALL') {
      where.verificationStatus = status;
    }

    const [total, technicians] = await Promise.all([
      prisma.technicianProfile.count({ where }),
      prisma.technicianProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
            },
          },
          assignedBookings: {
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              bookingNumber: true,
              status: true,
              totalAmount: true,
              createdAt: true,
            },
          },
          payoutRequests: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formatted = technicians.map((t: any) => {
      let parsedSkills: string[] = [];
      try {
        if (Array.isArray(t.skills)) {
          parsedSkills = t.skills;
        } else if (typeof t.skills === "string") {
          parsedSkills = t.skills.startsWith("[") ? JSON.parse(t.skills) : t.skills.split(",").map((s: string) => s.trim());
        }
      } catch {
        parsedSkills = typeof t.skills === "string" ? t.skills.split(",").map((s: string) => s.trim()) : [];
      }

      return {
        id: t.id,
        userId: t.userId,
        fullName: t.user?.name || "Technician",
        name: t.user?.name || "Technician",
        email: t.user?.email || "N/A",
        phone: t.user?.phone || "N/A",
        district: t.serviceAreas || "Moulvibazar",
        serviceAreas: t.serviceAreas || "Moulvibazar",
        nidNumber: t.nidNumber,
        experienceYears: t.experienceYears,
        skills: parsedSkills,
        specializations: t.specializations,
        verificationStatus: t.verificationStatus,
        isVerified: t.verificationStatus === "VERIFIED",
        availableStatus: t.availableStatus,
        isAvailable: t.availableStatus === "AVAILABLE",
        rating: t.ratingOverall ?? 5.0,
        ratingOverall: t.ratingOverall ?? 5.0,
        totalJobsCompleted: t.totalCompletedJobs ?? 0,
        totalCompletedJobs: t.totalCompletedJobs ?? 0,
        walletBalance: t.walletBalance ?? 0,
        createdAt: t.createdAt,
        user: t.user,
        assignedBookings: t.assignedBookings,
        payoutRequests: t.payoutRequests,
      };
    });

    return NextResponse.json({
      success: true,
      technicians: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch technicians:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'technicians:verify');
    if (!auth.authorized) return auth.response!;

    const body = await req.json();
    const {
      technicianId,
      isVerified,
      verificationStatus,
      verificationNotes,
      isAvailable,
      availableStatus,
      rating,
      ratingOverall,
      userStatus,
      payoutRequestId,
      payoutAction,
      payoutTrxId,
      payoutNotes,
    } = body;

    // 1. Payout Processing Workflow
    if (payoutRequestId && payoutAction) {
      const payout = await prisma.payoutRequest.findUnique({
        where: { id: payoutRequestId },
        include: { technician: { include: { user: true } } },
      });

      if (!payout) {
        return NextResponse.json({ success: false, error: 'Payout request not found' }, { status: 404 });
      }

      if (payoutAction === 'APPROVE') {
        const updatedPayout = await prisma.payoutRequest.update({
          where: { id: payoutRequestId },
          data: {
            status: 'APPROVED',
            approvedBy: auth.session?.id,
            adminNotes: payoutNotes || 'Approved by administrator',
          },
        });
        return NextResponse.json({ success: true, payout: updatedPayout });
      }

      if (payoutAction === 'PAID') {
        const updatedPayout = await prisma.$transaction(async (tx: any) => {
          const res = await tx.payoutRequest.update({
            where: { id: payoutRequestId },
            data: {
              status: 'PAID',
              paidAt: new Date(),
              trxId: payoutTrxId || `TRX-MANUAL-${Date.now().toString().slice(-6)}`,
              adminNotes: payoutNotes || 'Settled and disbursed',
            },
          });

          await tx.technicianProfile.update({
            where: { id: payout.technicianId },
            data: {
              totalWithdrawn: { increment: payout.amount },
            },
          });

          await tx.walletTransaction.updateMany({
            where: { referenceId: payoutRequestId },
            data: { status: 'COMPLETED' },
          });

          await tx.notification.create({
            data: {
              userId: payout.technician.userId,
              title: 'Payout Disbursed Successfully',
              message: `Your payout of ৳${payout.amount} has been paid via ${payout.paymentMethod} (TrxID: ${res.trxId}).`,
              type: 'WALLET',
              link: '/technician/earnings',
            },
          });

          return res;
        });

        return NextResponse.json({ success: true, payout: updatedPayout });
      }

      if (payoutAction === 'REJECT') {
        const updatedPayout = await prisma.$transaction(async (tx: any) => {
          const res = await tx.payoutRequest.update({
            where: { id: payoutRequestId },
            data: {
              status: 'REJECTED',
              adminNotes: payoutNotes || 'Rejected by administrator',
            },
          });

          // Refund balance back to technician
          await tx.technicianProfile.update({
            where: { id: payout.technicianId },
            data: {
              walletBalance: { increment: payout.amount },
            },
          });

          await tx.walletTransaction.updateMany({
            where: { referenceId: payoutRequestId },
            data: { status: 'REJECTED' },
          });

          await tx.notification.create({
            data: {
              userId: payout.technician.userId,
              title: 'Payout Request Declined',
              message: `Your payout request of ৳${payout.amount} was rejected. Reason: ${payoutNotes || 'Information verification failed'}. Balance has been refunded to your wallet.`,
              type: 'WALLET',
              link: '/technician/earnings',
            },
          });

          return res;
        });

        return NextResponse.json({ success: true, payout: updatedPayout });
      }
    }

    if (!technicianId) {
      return NextResponse.json({ success: false, error: "technicianId is required" }, { status: 400 });
    }

    const previousProfile = await prisma.technicianProfile.findUnique({
      where: { id: technicianId },
      include: { user: true },
    });

    if (!previousProfile) {
      return NextResponse.json({ success: false, error: "Technician profile not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (typeof isVerified === "boolean") {
      updateData.verificationStatus = isVerified ? "VERIFIED" : "PENDING";
    }
    if (verificationStatus) {
      updateData.verificationStatus = verificationStatus;
      if (verificationStatus === 'VERIFIED') {
        updateData.verifiedAt = new Date();
      }
    }
    if (verificationNotes !== undefined) {
      updateData.verificationNotes = verificationNotes;
    }
    if (typeof isAvailable === "boolean") {
      updateData.availableStatus = isAvailable ? "AVAILABLE" : "BUSY";
    }
    if (availableStatus) {
      updateData.availableStatus = availableStatus;
    }
    if (typeof rating === "number") {
      updateData.ratingOverall = rating;
    }
    if (typeof ratingOverall === "number") {
      updateData.ratingOverall = ratingOverall;
    }

    // Account suspension/reactivation
    if (userStatus && (userStatus === 'ACTIVE' || userStatus === 'SUSPENDED')) {
      await prisma.user.update({
        where: { id: previousProfile.userId },
        data: { status: userStatus },
      });
      if (userStatus === 'SUSPENDED') {
        updateData.verificationStatus = 'SUSPENDED';
        updateData.availableStatus = 'OFFLINE';
      }
    }

    const updated = await prisma.technicianProfile.update({
      where: { id: technicianId },
      data: updateData,
      include: { user: true },
    });

    // Notify technician of verification or account decision
    if (verificationStatus && verificationStatus !== previousProfile.verificationStatus) {
      const decisionTitle = verificationStatus === 'VERIFIED'
        ? 'Account Verified & Activated!'
        : verificationStatus === 'REJECTED'
        ? 'Application Review Decision'
        : 'Application Status Updated';

      const decisionMsg = verificationStatus === 'VERIFIED'
        ? 'Congratulations! Your technician profile has been approved and verified by NEED ELECTRO. You can now accept live job orders across Bangladesh.'
        : `Your application status is now ${verificationStatus}.${verificationNotes ? ` Note: ${verificationNotes}` : ''}`;

      await prisma.notification.create({
        data: {
          userId: previousProfile.userId,
          title: decisionTitle,
          message: decisionMsg,
          type: 'VERIFICATION',
          link: '/technician/dashboard',
        },
      });
    }

    await recordAuditLog({
      userId: auth.session?.id,
      userRole: auth.session?.role,
      action: 'UPDATE_TECHNICIAN_PROFILE',
      entity: 'TechnicianProfile',
      entityId: technicianId,
      previousData: {
        verificationStatus: previousProfile.verificationStatus,
        availableStatus: previousProfile.availableStatus,
      },
      newData: {
        verificationStatus: updated.verificationStatus,
        availableStatus: updated.availableStatus,
      },
    });

    return NextResponse.json({ success: true, technician: updated });
  } catch (error: any) {
    console.error("Failed to update technician:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
