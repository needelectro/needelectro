import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth } from '@/lib/apiAuth';

interface CachedStats {
  data: any;
  timestamp: number;
}

let statsCache: CachedStats | null = null;
const STATS_CACHE_TTL_MS = 20000; // 20s server memory cache

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'dashboard:view');
    if (!auth.authorized) return auth.response!;

    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('force') === 'true';

    // 1. Return fresh in-memory cached stats immediately if available
    const now = Date.now();
    if (!forceRefresh && statsCache && now - statsCache.timestamp < STATS_CACHE_TTL_MS) {
      return NextResponse.json(statsCache.data);
    }

    // 2. High-speed database query: single raw SQL round-trip for all 13 counts/aggregations + lean findMany
    const [countsRows, recentBookings, recentOrders] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT
          (SELECT count(*)::int FROM "User" WHERE role = 'CUSTOMER') as total_customers,
          (SELECT count(*)::int FROM "TechnicianProfile") as total_technicians,
          (SELECT count(*)::int FROM "TechnicianProfile" WHERE "verificationStatus" = 'VERIFIED') as verified_technicians,
          (SELECT count(*)::int FROM "TechnicianProfile" WHERE "verificationStatus" = 'PENDING') as pending_technicians,
          (SELECT count(*)::int FROM "Booking" WHERE status IN ('ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS')) as active_jobs,
          (SELECT count(*)::int FROM "Booking" WHERE status = 'COMPLETED') as completed_jobs,
          (SELECT count(*)::int FROM "Booking") as total_bookings,
          (SELECT count(*)::int FROM "Order") as total_orders,
          (SELECT count(*)::int FROM "Product" WHERE stock <= 3) as low_stock_products,
          (SELECT count(*)::int FROM "WarrantyClaim" WHERE status = 'SUBMITTED') as warranty_claims,
          (SELECT count(*)::int FROM "Dispute" WHERE status = 'OPEN') as disputes,
          (SELECT COALESCE(SUM("totalAmount"), 0)::float FROM "Booking" WHERE status IN ('COMPLETED', 'CLOSED')) as service_revenue,
          (SELECT COALESCE(SUM("totalAmount"), 0)::float FROM "Order") as product_revenue
      `.catch(async () => {
        // Fallback in case raw SQL is not permitted on specific connection
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
          prisma.booking.aggregate({ where: { status: { in: ['COMPLETED', 'CLOSED'] } }, _sum: { totalAmount: true } }),
          prisma.order.aggregate({ _sum: { totalAmount: true } }),
        ]);

        return [{
          total_customers: totalCustomers,
          total_technicians: totalTechnicians,
          verified_technicians: verifiedTechnicians,
          pending_technicians: pendingTechnicians,
          active_jobs: activeJobs,
          completed_jobs: completedJobs,
          total_bookings: totalBookings,
          total_orders: totalOrders,
          low_stock_products: lowStockProducts,
          warranty_claims: warrantyClaims,
          disputes: disputes,
          service_revenue: bookingAgg._sum.totalAmount || 0,
          product_revenue: orderAgg._sum.totalAmount || 0,
        }];
      }),

      prisma.booking.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { name: true } },
          customer: { include: { user: { select: { name: true, phone: true } } } },
          technician: { include: { user: { select: { name: true, phone: true } } } },
        },
      }),

      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { include: { user: { select: { name: true, phone: true } } } },
          items: true,
        },
      }),
    ]);

    const c = countsRows[0] || {};
    const totalCustomers = Number(c.total_customers || 0);
    const totalTechnicians = Number(c.total_technicians || 0);
    const verifiedTechnicians = Number(c.verified_technicians || 0);
    const pendingTechnicians = Number(c.pending_technicians || 0);
    const activeJobs = Number(c.active_jobs || 0);
    const completedJobs = Number(c.completed_jobs || 0);
    const totalBookings = Number(c.total_bookings || 0);
    const totalOrders = Number(c.total_orders || 0);
    const lowStockProducts = Number(c.low_stock_products || 0);
    const warrantyClaims = Number(c.warranty_claims || 0);
    const disputes = Number(c.disputes || 0);
    const serviceRevenue = Number(c.service_revenue || 0);
    const productRevenue = Number(c.product_revenue || 0);
    const totalRevenue = serviceRevenue + productRevenue;

    const payload = {
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
    };

    // Store in process memory cache
    statsCache = { data: payload, timestamp: now };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Admin stats error:', error);
    // Return gracefully with default stats rather than blowing up with 500
    if (statsCache) {
      return NextResponse.json(statsCache.data);
    }
    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers: 0,
        totalTechnicians: 0,
        verifiedTechnicians: 0,
        activeTechnicians: 0,
        pendingTechnicians: 0,
        activeJobs: 0,
        completedJobs: 0,
        totalBookings: 0,
        totalOrders: 0,
        lowStockProducts: 0,
        warrantyClaims: 0,
        disputes: 0,
        serviceRevenue: 0,
        productRevenue: 0,
        totalRevenue: 0,
      },
      recentBookings: [],
      recentOrders: [],
    });
  }
}
