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

    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      banners,
      promotions,
      settings: settingsMap,
    });
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
    } else if (type === "promo") {
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
    } else if (type === "content_bulk") {
      // Bulk update CMS settings (policies, contact, SEO, footer, social links)
      const updates = Object.entries(data.settings || {}).map(([key, val]) =>
        prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(val) },
          create: { key, value: String(val) },
        })
      );
      await Promise.all(updates);

      try {
        await prisma.auditLog.create({
          data: {
            action: "UPDATE_CMS_CONTENT",
            entity: "SystemSetting",
            newData: JSON.stringify(Object.keys(data.settings || {})),
          },
        });
      } catch (err) {}

      return NextResponse.json({ success: true, message: "CMS Content updated successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("Failed to create/update CMS item:", error);
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
    } else if (type === "promo") {
      await prisma.promotion.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete CMS item:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
