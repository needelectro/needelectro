import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Collect order payments
    const orders = await prisma.order.findMany({
      include: {
        customer: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Collect service bookings payments
    const bookings = await prisma.booking.findMany({
      include: {
        customer: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
        service: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const transactions = [
      ...orders.map((o: any) => ({
        id: `ORD-${o.id}`,
        type: "PRODUCT_ORDER",
        referenceNumber: o.orderNumber,
        customerName: o.customer?.user?.name || "Customer",
        customerPhone: o.customer?.user?.phone || "N/A",
        amount: o.totalAmount,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        transactionRef: o.paymentTrxId,
        date: o.createdAt,
      })),
      ...bookings.map((b: any) => ({
        id: `BKG-${b.id}`,
        type: "SERVICE_BOOKING",
        referenceNumber: b.bookingNumber,
        customerName: b.customer?.user?.name || "Customer",
        customerPhone: b.customer?.user?.phone || "N/A",
        amount: b.totalAmount,
        paymentMethod: b.paymentMethod,
        paymentStatus: b.paymentStatus,
        transactionRef: null,
        date: b.createdAt,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
