import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const status = body.status || 'VERIFIED';
    const notes = body.notes;

    const updateData: any = {
      verificationStatus: status,
      verificationNotes: notes,
    };

    if (status === 'VERIFIED') {
      updateData.verifiedAt = new Date();
    }

    const updated = await prisma.technicianProfile.update({
      where: { id },
      data: updateData,
      include: { user: true },
    });

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

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        userRole: session.role,
        action: `TECHNICIAN_${status}`,
        entity: 'TechnicianProfile',
        entityId: id,
        newData: JSON.stringify({ status, notes }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Technician status updated to ${status}`,
      technician: updated,
    });
  } catch (error) {
    console.error('Verify technician error:', error);
    return NextResponse.json({ error: 'Failed to update technician verification' }, { status: 500 });
  }
}
