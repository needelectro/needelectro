import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        customer: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        product: { select: { id: true, name: true, sku: true } },
        technician: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId, isApproved } = body;

    if (!reviewId || typeof isApproved !== "boolean") {
      return NextResponse.json({ success: false, error: "reviewId and isApproved required" }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    console.error("Failed to update review:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ success: false, error: "reviewId required" }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error: any) {
    console.error("Failed to delete review:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
