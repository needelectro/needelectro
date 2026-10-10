import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("type"); // BOOKING, ORDER, WALLET, SUPPORT, SYSTEM, ALL

    let whereClause: any = {};
    if (filter && filter !== "ALL") {
      whereClause.type = filter;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const unreadCount = await prisma.notification.count({
      where: { read: false },
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Notification id required" }, { status: 400 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ success: true, notification: updated });
  } catch (error: any) {
    console.error("Failed to update notification:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, type, link, targetRole } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

    // Find recipient users based on targetRole, or send to all active staff/admins
    let users = [];
    if (targetRole && targetRole !== "ALL") {
      users = await prisma.user.findMany({
        where: { role: targetRole, status: "ACTIVE" },
        select: { id: true },
      });
    } else {
      users = await prisma.user.findMany({
        where: { status: "ACTIVE" },
        take: 200,
        select: { id: true },
      });
    }

    if (users.length === 0) {
      // Find at least admin user
      const admin = await prisma.user.findFirst({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        select: { id: true },
      });
      if (admin) users = [admin];
    }

    const createdNotifications = await Promise.all(
      users.map((u: any) =>
        prisma.notification.create({
          data: {
            userId: u.id,
            title,
            message,
            type: type || "SYSTEM",
            link: link || "/admin",
            read: false,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: createdNotifications.length,
      message: `Broadcasted to ${createdNotifications.length} user(s)`,
    });
  } catch (error: any) {
    console.error("Failed to send notification:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Notification deleted" });
  } catch (error: any) {
    console.error("Failed to delete notification:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
