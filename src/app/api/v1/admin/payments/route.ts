import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'finance:read');
    if (!auth.authorized) return auth.response!;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const type = searchParams.get('type'); // 'PRODUCT_ORDER' | 'SERVICE_BOOKING' | null

    const fetchOrders = !type || type === 'PRODUCT_ORDER';
    const fetchBookings = !type || type === 'SERVICE_BOOKING';

    const [orders, bookings] = await Promise.all([
      fetchOrders
        ? prisma.order.findMany({
            take: limit,
            include: {
              customer: {
                include: {
                  user: { select: { name: true, phone: true } },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
      fetchBookings
        ? prisma.booking.findMany({
            take: limit,
            include: {
              customer: {
                include: {
                  user: { select: { name: true, phone: true } },
                },
              },
              service: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

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
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
