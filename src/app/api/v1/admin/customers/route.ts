import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const customers = await prisma.customerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
        bookings: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
        addresses: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const transformed = customers.map((c: any) => {
      const totalOrderSpent = c.orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      const totalServiceSpent = c.bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
      return {
        id: c.id,
        userId: c.userId,
        name: c.user?.name || "Customer",
        email: c.user?.email,
        phone: c.user?.phone || c.alternativePhone || "N/A",
        status: c.user?.status || "ACTIVE",
        totalOrders: c.orders.length,
        totalBookings: c.bookings.length,
        lifetimeSpend: totalOrderSpent + totalServiceSpent,
        addresses: c.addresses,
        joinedAt: c.user?.createdAt || c.createdAt,
      };
    });

    return NextResponse.json({ success: true, customers: transformed });
  } catch (error: any) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json({ success: false, error: "userId and status are required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Failed to update customer status:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
