import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        totalAmount: true,
        paymentStatus: true,
        paymentMethod: true,
        status: true,
        createdAt: true,
      },
    });

    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        bookingNumber: true,
        totalAmount: true,
        paymentStatus: true,
        status: true,
        createdAt: true,
      },
    });

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
      },
    });

    const rawTechnicians = await prisma.technicianProfile.findMany({
      include: {
        user: { select: { name: true } },
      },
    });

    const technicians = rawTechnicians.map((t: any) => ({
      id: t.id,
      fullName: t.user?.name || "Technician",
      rating: t.ratingOverall || 5.0,
      totalJobsCompleted: t.totalCompletedJobs || 0,
      walletBalance: t.walletBalance || 0,
    }));

    const totalProductRevenue = orders
      .filter((o: any) => o.paymentStatus === "PAID")
      .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    const totalServiceRevenue = bookings
      .filter((b: any) => b.paymentStatus === "PAID")
      .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

    const totalOrdersCount = orders.length;
    const totalBookingsCount = bookings.length;

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue: totalProductRevenue + totalServiceRevenue,
        productRevenue: totalProductRevenue,
        serviceRevenue: totalServiceRevenue,
        totalOrders: totalOrdersCount,
        totalBookings: totalBookingsCount,
        totalProducts: products.length,
        totalTechnicians: technicians.length,
      },
      orders,
      bookings,
      technicians,
    });
  } catch (error: any) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
