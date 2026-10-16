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
    const { technicianId, isVerified, verificationStatus, isAvailable, availableStatus, rating, ratingOverall } = body;

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

    const updated = await prisma.technicianProfile.update({
      where: { id: technicianId },
      data: updateData,
      include: { user: true },
    });

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
