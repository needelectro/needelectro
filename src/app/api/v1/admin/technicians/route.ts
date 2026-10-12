import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const technicians = await prisma.technicianProfile.findMany({
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
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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

    return NextResponse.json({ success: true, technicians: formatted });
  } catch (error: any) {
    console.error("Failed to fetch technicians:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { technicianId, isVerified, verificationStatus, isAvailable, availableStatus, rating, ratingOverall } = body;

    if (!technicianId) {
      return NextResponse.json({ success: false, error: "technicianId is required" }, { status: 400 });
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
      include: {
        user: true,
      },
    });

    return NextResponse.json({ success: true, technician: updated });
  } catch (error: any) {
    console.error("Failed to update technician:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
