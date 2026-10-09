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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, division, district, upazila, address, phone, email, managerName, isHeadquarters, coverageAreas, workingHours, emergencyHotline } = body;

    if (!name || !district || !upazila || !address || !phone || !email || !managerName) {
      return NextResponse.json({ error: 'Missing mandatory branch details' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);

    const branch = await prisma.branch.create({
      data: {
        name,
        slug,
        division: division || 'Sylhet',
        district,
        upazila,
        address,
        phone,
        email,
        managerName,
        isHeadquarters: !!isHeadquarters,
        coverageAreas: coverageAreas || `${upazila}, ${district}`,
        workingHours: workingHours || 'Saturday - Thursday: 9:00 AM - 8:00 PM',
        emergencyHotline: emergencyHotline || phone,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, branch });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}
