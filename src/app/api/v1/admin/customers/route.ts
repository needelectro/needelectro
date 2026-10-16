import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth, recordAuditLog } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'customers:read');
    if (!auth.authorized) return auth.response!;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status && status !== 'ALL') {
      where.user = { ...(where.user || {}), status };
    }

    const [total, customers] = await Promise.all([
      prisma.customerProfile.count({ where }),
      prisma.customerProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
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
      }),
    ]);

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

    return NextResponse.json({
      success: true,
      customers: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'customers:write');
    if (!auth.authorized) return auth.response!;

    const body = await req.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json({ success: false, error: "userId and status are required" }, { status: 400 });
    }

    const previousUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!previousUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    await recordAuditLog({
      userId: auth.session?.id,
      userRole: auth.session?.role,
      action: 'UPDATE_CUSTOMER_STATUS',
      entity: 'User',
      entityId: userId,
      previousData: { status: previousUser.status },
      newData: { status: updatedUser.status },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Failed to update customer status:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
