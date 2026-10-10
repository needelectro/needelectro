import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const technicians = await prisma.technicianProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
        assignedBookings: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            actualCost: true,
            estimatedCost: true,
            createdAt: true,
          },
        },
        payoutRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, technicians });
  } catch (error: any) {
    console.error("Failed to fetch technicians:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { technicianId, isVerified, isAvailable, rating } = body;

    if (!technicianId) {
      return NextResponse.json({ success: false, error: "technicianId is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof isVerified === "boolean") updateData.isVerified = isVerified;
    if (typeof isAvailable === "boolean") updateData.isAvailable = isAvailable;
    if (typeof rating === "number") updateData.rating = rating;

    const updated = await prisma.technicianProfile.update({
      where: { id: technicianId },
      data: updateData,
    });

    return NextResponse.json({ success: true, technician: updated });
  } catch (error: any) {
    console.error("Failed to update technician:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
