import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district');

    const where: any = { isActive: true };
    if (district) {
      where.district = { contains: district };
    }

    const branches = await prisma.branch.findMany({
      where,
      orderBy: [{ isHeadquarters: 'desc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ success: true, branches });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch branch network' }, { status: 500 });
  }
}
