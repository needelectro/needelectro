import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'TECHNICIAN' && payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized technician access' }, { status: 401 });
    }

    let technician = await prisma.technicianProfile.findUnique({
      where: { userId: payload.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            status: true,
            createdAt: true,
          },
        },
        earnings: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        walletTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        payoutRequests: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        skillsList: true,
        serviceAreasList: true,
        availabilitySlots: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!technician) {
      technician = await prisma.technicianProfile.create({
        data: {
          userId: payload.id,
          skills: 'General Electrical, Home Wiring, Installation',
          serviceAreas: 'Moulvibazar Sadar, Kusumbag, Sreemangal',
          verificationStatus: 'VERIFIED',
          availableStatus: 'AVAILABLE',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
              status: true,
              createdAt: true,
            },
          },
          earnings: { orderBy: { createdAt: 'desc' }, take: 30 },
          walletTransactions: { orderBy: { createdAt: 'desc' }, take: 30 },
          payoutRequests: { orderBy: { createdAt: 'desc' }, take: 20 },
          skillsList: true,
          serviceAreasList: true,
          availabilitySlots: { orderBy: { dayOfWeek: 'asc' } },
        },
      });
    }

    // Parse skills safely
    let parsedSkills: string[] = [];
    try {
      if (Array.isArray(technician.skills)) {
        parsedSkills = technician.skills;
      } else if (typeof technician.skills === 'string') {
        parsedSkills = technician.skills.startsWith('[')
          ? JSON.parse(technician.skills)
          : technician.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      parsedSkills = typeof technician.skills === 'string'
        ? technician.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    // Calculate Start of Month date
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const todayDateStr = new Date().toISOString().slice(0, 10);

    // Count statistics from real database records
    const [
      assignedCount,
      awaitingCount,
      acceptedCount,
      inProgressCount,
      completedCount,
      cancelledDisputedCount,
      todayScheduledCount,
      monthlyEarningsAgg,
      unreadNotifCount,
    ] = await Promise.all([
      prisma.booking.count({ where: { technicianId: technician.id } }),
      prisma.booking.count({ where: { technicianId: technician.id, status: 'ASSIGNED' } }),
      prisma.booking.count({ where: { technicianId: technician.id, status: 'ACCEPTED' } }),
      prisma.booking.count({
        where: {
          technicianId: technician.id,
          status: { in: ['ON_THE_WAY', 'ARRIVED', 'INSPECTION_STARTED', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'WORK_STARTED', 'ON_HOLD'] },
        },
      }),
      prisma.booking.count({ where: { technicianId: technician.id, status: { in: ['COMPLETED', 'WORK_COMPLETED'] } } }),
      prisma.booking.count({ where: { technicianId: technician.id, status: { in: ['CANCELLED', 'DISPUTED', 'REJECTED'] } } }),
      prisma.booking.count({
        where: {
          technicianId: technician.id,
          preferredDate: { contains: todayDateStr },
          status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
        },
      }),
      prisma.technicianEarnings.aggregate({
        where: {
          technicianId: technician.id,
          createdAt: { gte: startOfMonth },
        },
        _sum: { technicianAmount: true },
      }),
      prisma.notification.count({
        where: { userId: payload.id, read: false },
      }),
    ]);

    const monthlyEarnings = monthlyEarningsAgg._sum.technicianAmount || 0;

    return NextResponse.json({
      success: true,
      technician: {
        ...technician,
        parsedSkills,
        stats: {
          assignedTotal: assignedCount,
          awaitingAcceptance: awaitingCount,
          acceptedCount,
          activeTotal: inProgressCount,
          inProgressTotal: inProgressCount,
          completedTotal: completedCount,
          cancelledOrDisputedTotal: cancelledDisputedCount,
          todayScheduledTotal: todayScheduledCount,
          monthlyEarnings,
          unreadNotifications: unreadNotifCount,
        },
      },
    });
  } catch (error) {
    console.error('Error in technicians/me GET:', error);
    return NextResponse.json({ error: 'Failed to fetch technician profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'Only authenticated technicians can update their profile' }, { status: 403 });
    }

    const existingTech = await prisma.technicianProfile.findUnique({
      where: { userId: payload.id },
    });

    if (!existingTech) {
      return NextResponse.json({ error: 'Technician profile not found' }, { status: 404 });
    }

    const body = await req.json();

    // Whitelist permitted editable fields (Prevent tampering with verificationStatus, walletBalance, ratingOverall)
    const updateData: any = {};

    if (body.availableStatus !== undefined) {
      const validStatuses = ['AVAILABLE', 'OFFLINE', 'BUSY', 'ON_LEAVE'];
      if (validStatuses.includes(body.availableStatus)) {
        updateData.availableStatus = body.availableStatus;
      }
    }

    if (body.emergencyAvailable !== undefined) {
      updateData.emergencyAvailable = Boolean(body.emergencyAvailable);
    }

    if (body.workingHours !== undefined && typeof body.workingHours === 'string') {
      updateData.workingHours = body.workingHours.trim().slice(0, 100);
    }

    if (body.preferredRadiusKm !== undefined) {
      const radius = parseInt(body.preferredRadiusKm, 10);
      if (!isNaN(radius) && radius >= 1 && radius <= 100) {
        updateData.preferredRadiusKm = radius;
      }
    }

    if (body.bio !== undefined && typeof body.bio === 'string') {
      updateData.bio = body.bio.trim().slice(0, 1000);
    }

    if (body.profilePhotoUrl !== undefined && typeof body.profilePhotoUrl === 'string') {
      updateData.profilePhotoUrl = body.profilePhotoUrl.trim();
    }

    if (body.serviceAreas !== undefined && typeof body.serviceAreas === 'string') {
      updateData.serviceAreas = body.serviceAreas.trim().slice(0, 255);
    }

    if (body.specializations !== undefined && typeof body.specializations === 'string') {
      updateData.specializations = body.specializations.trim().slice(0, 255);
    }

    // If updating name or avatar in User model
    if (body.name && typeof body.name === 'string' && body.name.trim().length >= 2) {
      await prisma.user.update({
        where: { id: payload.id },
        data: {
          name: body.name.trim(),
          avatarUrl: body.profilePhotoUrl || undefined,
        },
      });
    }

    const updated = await prisma.technicianProfile.update({
      where: { id: existingTech.id },
      data: updateData,
    });

    // Record audit log if available
    try {
      await prisma.auditLog.create({
        data: {
          userId: payload.id,
          userRole: 'TECHNICIAN',
          action: 'UPDATE_PROFILE',
          entity: 'TechnicianProfile',
          entityId: existingTech.id,
          newData: JSON.stringify(updateData),
        },
      });
    } catch {
      // Non-critical audit log
    }

    return NextResponse.json({
      success: true,
      message: 'Technician settings updated successfully.',
      technician: updated,
    });
  } catch (error: any) {
    console.error('Error in technicians/me PATCH:', error);
    return NextResponse.json({ error: error.message || 'Failed to update technician profile' }, { status: 500 });
  }
}
