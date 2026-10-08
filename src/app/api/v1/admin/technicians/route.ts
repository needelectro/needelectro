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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (status) {
      whereClause.verificationStatus = status;
    }

    const technicians = await prisma.technicianProfile.findMany({
      where: whereClause,
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, technicians });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch technicians' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { technicianId, status, notes } = await req.json();

    if (!technicianId || !status) {
      return NextResponse.json({ error: 'technicianId and status required' }, { status: 400 });
    }

    const updateData: any = {
      verificationStatus: status,
      verificationNotes: notes,
    };

    if (status === 'VERIFIED') {
      updateData.verifiedAt = new Date();
    }

    const updated = await prisma.technicianProfile.update({
      where: { id: technicianId },
      data: updateData,
      include: { user: true },
    });

    // Also activate or suspend user account
    if (status === 'VERIFIED') {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { status: 'ACTIVE' },
      });
    } else if (status === 'SUSPENDED') {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { status: 'SUSPENDED' },
      });
    }

    // Log administrative action in AuditLog
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userRole: session.role,
        action: `TECHNICIAN_${status}`,
        entity: 'TechnicianProfile',
        entityId: technicianId,
        newData: JSON.stringify({ status, notes }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Technician status updated to ${status}`,
      technician: updated,
    });
  } catch (error) {
    console.error('Update technician error:', error);
    return NextResponse.json({ error: 'Failed to update technician' }, { status: 500 });
  }
}
