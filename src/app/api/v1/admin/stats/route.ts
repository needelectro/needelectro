import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [
      totalCustomers,
      totalTechnicians,
      verifiedTechnicians,
      pendingTechnicians,
      activeJobs,
      completedJobs,
      totalBookings,
      totalOrders,
      lowStockProducts,
      warrantyClaims,
      disputes,
      recentBookings,
      recentOrders,
      bookingAgg,
      orderAgg,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.technicianProfile.count(),
      prisma.technicianProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.technicianProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.booking.count({ where: { status: { in: ['ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'] } } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count(),
      prisma.order.count(),
      prisma.product.count({ where: { stock: { lte: 3 } } }),
      prisma.warrantyClaim.count({ where: { status: 'SUBMITTED' } }),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      prisma.booking.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { name: true } },
          customer: { include: { user: { select: { name: true } } } },
          technician: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { include: { user: { select: { name: true } } } },
          items: true,
        },
      }),
      prisma.booking.aggregate({
        where: { status: { in: ['COMPLETED', 'CLOSED'] } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
    ]);

    const serviceRevenue = bookingAgg._sum.totalAmount || 0;
    const productRevenue = orderAgg._sum.totalAmount || 0;
    const totalRevenue = serviceRevenue + productRevenue;

    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers,
        totalTechnicians,
        verifiedTechnicians,
        activeTechnicians: verifiedTechnicians,
        pendingTechnicians,
        activeJobs,
        completedJobs,
        totalBookings,
        totalOrders,
        lowStockProducts,
        warrantyClaims,
        disputes,
        serviceRevenue,
        productRevenue,
        totalRevenue,
      },
      recentBookings,
      recentOrders,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load admin stats' }, { status: 500 });
  }
}
