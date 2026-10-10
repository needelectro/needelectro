import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const [archivedProducts, archivedServices, archivedBanners, archivedPromotions] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: false },
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
          orderItems: { take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.service.findMany({
        where: { isActive: false },
        include: {
          category: { select: { name: true } },
          bookings: { take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.banner.findMany({
        where: { isActive: false },
        orderBy: { createdAt: "desc" },
      }),
      prisma.promotion.findMany({
        where: { isActive: false },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const items = [
      ...archivedProducts.map((p: any) => ({
        id: p.id,
        entityType: "Product",
        title: p.name,
        identifier: `SKU: ${p.sku}`,
        details: `৳${p.price.toLocaleString()} • ${p.category?.name || "General"}`,
        hasDependencies: p.orderItems.length > 0,
        dependencyNote: p.orderItems.length > 0 ? "Has connected order history (Protected from permanent wipe)" : null,
        archivedAt: p.updatedAt,
      })),
      ...archivedServices.map((s: any) => ({
        id: s.id,
        entityType: "Service",
        title: s.name,
        identifier: `Slug: ${s.slug}`,
        details: `৳${s.basePrice.toLocaleString()} • ${s.category?.name || "Services"}`,
        hasDependencies: s.bookings.length > 0,
        dependencyNote: s.bookings.length > 0 ? "Has connected bookings (Protected from permanent wipe)" : null,
        archivedAt: s.updatedAt,
      })),
      ...archivedBanners.map((b: any) => ({
        id: b.id,
        entityType: "Banner",
        title: b.title,
        identifier: `Placement: ${b.placement}`,
        details: b.subtitle || "Storefront banner",
        hasDependencies: false,
        dependencyNote: null,
        archivedAt: b.createdAt,
      })),
      ...archivedPromotions.map((pr: any) => ({
        id: pr.id,
        entityType: "Promotion",
        title: `Coupon: ${pr.code}`,
        identifier: `Code: ${pr.code}`,
        details: pr.discountPercent ? `${pr.discountPercent}% OFF` : `৳${pr.discountAmount} OFF`,
        hasDependencies: pr.usageCount > 0,
        dependencyNote: pr.usageCount > 0 ? "Used in past customer orders" : null,
        archivedAt: pr.createdAt,
      })),
    ].sort((a: any, b: any) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("Recycle bin fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, entityType, id } = body;

    if (!action || !entityType || !id) {
      return NextResponse.json({ success: false, error: "action, entityType, and id are required" }, { status: 400 });
    }

    if (action === "RESTORE") {
      if (entityType === "Product") {
        await prisma.product.update({ where: { id }, data: { isActive: true } });
      } else if (entityType === "Service") {
        await prisma.service.update({ where: { id }, data: { isActive: true } });
      } else if (entityType === "Banner") {
        await prisma.banner.update({ where: { id }, data: { isActive: true } });
      } else if (entityType === "Promotion") {
        await prisma.promotion.update({ where: { id }, data: { isActive: true } });
      }

      try {
        await prisma.auditLog.create({
          data: {
            action: `RESTORE_${entityType.toUpperCase()}`,
            entity: entityType,
            entityId: id,
            newData: JSON.stringify({ status: "RESTORED_TO_ACTIVE" }),
          },
        });
      } catch (err) {}

      return NextResponse.json({ success: true, message: `${entityType} restored to live store successfully.` });
    }

    if (action === "PERMANENT_DELETE") {
      if (entityType === "Product") {
        const product = await prisma.product.findUnique({
          where: { id },
          include: { orderItems: { take: 1 }, emiAccounts: { take: 1 } },
        });
        if (product && (product.orderItems.length > 0 || product.emiAccounts.length > 0)) {
          return NextResponse.json({
            success: false,
            error: "Cannot permanently delete product with existing sales/financial history. Keep it archived.",
          }, { status: 400 });
        }
        await prisma.product.delete({ where: { id } });
      } else if (entityType === "Service") {
        const service = await prisma.service.findUnique({
          where: { id },
          include: { bookings: { take: 1 } },
        });
        if (service && service.bookings.length > 0) {
          return NextResponse.json({
            success: false,
            error: "Cannot permanently delete service with historical bookings. Keep it archived.",
          }, { status: 400 });
        }
        await prisma.service.delete({ where: { id } });
      } else if (entityType === "Banner") {
        await prisma.banner.delete({ where: { id } });
      } else if (entityType === "Promotion") {
        await prisma.promotion.delete({ where: { id } });
      }

      try {
        await prisma.auditLog.create({
          data: {
            action: `PERMANENT_DELETE_${entityType.toUpperCase()}`,
            entity: entityType,
            entityId: id,
            previousData: JSON.stringify({ action: "WIPED_FROM_RECYCLE_BIN" }),
          },
        });
      } catch (err) {}

      return NextResponse.json({ success: true, message: `${entityType} permanently wiped.` });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Recycle bin operation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
