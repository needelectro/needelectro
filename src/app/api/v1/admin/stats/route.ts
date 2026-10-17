import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAuth } from '@/lib/apiAuth';

interface CachedStats {
  data: any;
  timestamp: number;
  key: string;
}

let statsCache: Map<string, CachedStats> = new Map();
const STATS_CACHE_TTL_MS = 15000; // 15s cache per range key

export async function GET(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'dashboard:view');
    if (!auth.authorized) return auth.response!;

    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('force') === 'true';
    const range = searchParams.get('range') || 'all'; // 'today' | '7d' | '30d' | 'this_month' | 'all'

    const cacheKey = `stats_${range}`;
    const now = Date.now();
    const cached = statsCache.get(cacheKey);

    if (!forceRefresh && cached && now - cached.timestamp < STATS_CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    // Determine date cutoff based on range
    let dateFilter: Date | null = null;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (range === 'today') {
      dateFilter = todayStart;
    } else if (range === '7d') {
      dateFilter = new Date(now - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      dateFilter = new Date(now - 30 * 24 * 60 * 60 * 1000);
    } else if (range === 'this_month') {
      const firstOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
      dateFilter = firstOfMonth;
    }

    const bookingWhere: any = dateFilter ? { createdAt: { gte: dateFilter } } : {};
    const orderWhere: any = dateFilter ? { createdAt: { gte: dateFilter } } : {};

    const [
      totalCustomers,
      activeCustomers,
      suspendedCustomers,
      totalTechnicians,
      verifiedTechnicians,
      pendingTechnicians,
      availableTechnicians,
      totalBookings,
      requestedBookings,
      assignedBookings,
      inProgressBookings,
      completedBookings,
      cancelledBookings,
      disputedBookings,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts,
      warrantyClaims,
      disputes,
      openTickets,
      bookingAgg,
      orderAgg,
      payoutAgg,
      recentBookings,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', status: { not: 'ACTIVE' } } }),
      prisma.technicianProfile.count(),
      prisma.technicianProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.technicianProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.technicianProfile.count({ where: { verificationStatus: 'VERIFIED', availableStatus: 'AVAILABLE' } }),
      prisma.booking.count({ where: bookingWhere }),
      prisma.booking.count({ where: { ...bookingWhere, status: { in: ['REQUESTED', 'MATCHING', 'PENDING'] } } }),
      prisma.booking.count({ where: { ...bookingWhere, status: 'ASSIGNED' } }),
      prisma.booking.count({ where: { ...bookingWhere, status: { in: ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WORK_STARTED'] } } }),
      prisma.booking.count({ where: { ...bookingWhere, status: { in: ['COMPLETED', 'WORK_COMPLETED'] } } }),
      prisma.booking.count({ where: { ...bookingWhere, status: 'CANCELLED' } }),
      prisma.booking.count({ where: { ...bookingWhere, status: 'DISPUTED' } }),
      prisma.order.count({ where: orderWhere }),
      prisma.order.count({ where: { ...orderWhere, status: { in: ['PENDING', 'PROCESSING', 'CONFIRMED'] } } }),
      prisma.order.count({ where: { ...orderWhere, status: 'DELIVERED' } }),
      prisma.order.count({ where: { ...orderWhere, status: 'CANCELLED' } }),
      prisma.product.count({ where: { stock: { lte: 3 } } }),
      prisma.warrantyClaim.count({ where: { status: 'SUBMITTED' } }),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }).catch(() => 0),
      prisma.booking.aggregate({
        where: { ...bookingWhere, status: { in: ['COMPLETED', 'CLOSED', 'WORK_COMPLETED'] } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { ...orderWhere, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      prisma.payoutRequest.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: 0 } })),
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

    const serviceRevenue = Number(bookingAgg._sum.totalAmount || 0);
    const productRevenue = Number(orderAgg._sum.totalAmount || 0);
    const totalRevenue = serviceRevenue + productRevenue;
    const technicianCommissions = Math.round(serviceRevenue * 0.85);
    const platformCommissions = Math.round(serviceRevenue * 0.15);
    const pendingPayoutLiabilities = Number(payoutAgg?._sum?.amount || 0);

    const payload = {
      success: true,
      range,
      stats: {
        totalCustomers,
        activeCustomers,
        suspendedCustomers,
        totalTechnicians,
        verifiedTechnicians,
        activeTechnicians: availableTechnicians,
        pendingTechnicians,
        availableTechnicians,
        totalBookings,
        requestedBookings,
        activeJobs: inProgressBookings + assignedBookings,
        assignedBookings,
        inProgressBookings,
        completedJobs: completedBookings,
        cancelledBookings,
        disputedBookings,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        lowStockProducts,
        warrantyClaims,
        disputes,
        openTickets,
        serviceRevenue,
        productRevenue,
        totalRevenue,
        technicianCommissions,
        platformCommissions,
        pendingPayoutLiabilities,
      },
      recentBookings,
      recentOrders,
    };

    statsCache.set(cacheKey, { data: payload, timestamp: now, key: cacheKey });
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({
      success: true,
      range: 'all',
      stats: {
        totalCustomers: 0,
        activeCustomers: 0,
        suspendedCustomers: 0,
        totalTechnicians: 0,
        verifiedTechnicians: 0,
        activeTechnicians: 0,
        pendingTechnicians: 0,
        availableTechnicians: 0,
        totalBookings: 0,
        requestedBookings: 0,
        activeJobs: 0,
        assignedBookings: 0,
        inProgressBookings: 0,
        completedJobs: 0,
        cancelledBookings: 0,
        disputedBookings: 0,
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        lowStockProducts: 0,
        warrantyClaims: 0,
        disputes: 0,
        openTickets: 0,
        serviceRevenue: 0,
        productRevenue: 0,
        totalRevenue: 0,
        technicianCommissions: 0,
        platformCommissions: 0,
        pendingPayoutLiabilities: 0,
      },
      recentBookings: [],
      recentOrders: [],
    });
  }
}
