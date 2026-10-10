import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });

    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, banners, promotions });
  } catch (error: any) {
    console.error("Failed to fetch CMS content:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    if (type === "banner") {
      const banner = await prisma.banner.create({
        data: {
          title: data.title,
          subtitle: data.subtitle,
          imageUrl: data.imageUrl || "/images/hero-banner.jpg",
          ctaLink: data.linkUrl || data.ctaLink || "/products",
          ctaText: data.buttonText || data.ctaText || "Shop Now",
          placement: data.position || data.placement || "HOMEPAGE_HERO",
          sortOrder: Number(data.sortOrder) || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
      return NextResponse.json({ success: true, banner });
    } else {
      const promotion = await prisma.promotion.create({
        data: {
          code: data.code.toUpperCase(),
          discountPercent: data.discountType === "PERCENTAGE" ? Number(data.discountValue) : null,
          discountAmount: data.discountType !== "PERCENTAGE" ? Number(data.discountValue) : null,
          minOrderAmount: Number(data.minOrderValue || data.minOrderAmount) || 0,
          usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
          startDate: new Date(data.startDate || Date.now()),
          endDate: new Date(data.endDate || Date.now() + 30 * 86400000),
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
      return NextResponse.json({ success: true, promotion });
    }
  } catch (error: any) {
    console.error("Failed to create CMS item:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id || !type) {
      return NextResponse.json({ success: false, error: "id and type required" }, { status: 400 });
    }

    if (type === "banner") {
      await prisma.banner.delete({ where: { id } });
    } else {
      await prisma.promotion.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete CMS item:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
