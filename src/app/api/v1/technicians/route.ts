import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skill = searchParams.get('skill');
    const area = searchParams.get('area');

    const technicians = await prisma.technicianProfile.findMany({
      where: {
        verificationStatus: 'VERIFIED',
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ ratingOverall: 'desc' }, { totalCompletedJobs: 'desc' }],
    });

    const formatted = technicians.map((t: any) => ({
      id: t.id,
      name: t.user.name,
      avatarUrl: t.user.avatarUrl || t.profilePhotoUrl,
      bio: t.bio,
      experienceYears: t.experienceYears,
      skills: t.skills ? JSON.parse(t.skills) : [],
      specializations: t.specializations,
      serviceAreas: t.serviceAreas,
      verificationStatus: t.verificationStatus,
      availableStatus: t.availableStatus,
      ratingOverall: t.ratingOverall,
      totalCompletedJobs: t.totalCompletedJobs,
      totalReviews: t.totalReviews,
    }));

    return NextResponse.json({
      success: true,
      technicians: formatted,
    });
  } catch (error) {
    console.error('Fetch technicians error:', error);
    return NextResponse.json({ error: 'Failed to load technicians' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      bio,
      nidNumber,
      experienceYears,
      skills,
      specializations,
      serviceAreas,
      workingHours,
    } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Name, email, phone, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([skills || 'Electrical']);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        phone,
        passwordHash,
        role: 'TECHNICIAN',
        status: 'PENDING',
        technicianProfile: {
          create: {
            bio,
            nidNumber,
            experienceYears: Number(experienceYears) || 1,
            skills: skillsJson,
            specializations,
            serviceAreas: serviceAreas || 'Moulvibazar Sadar, Kusumbag',
            workingHours: workingHours || '8:00 AM - 8:00 PM',
            verificationStatus: 'PENDING',
          },
        },
      },
      include: { technicianProfile: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Technician application submitted. Your profile will be verified by NEED ELECTRO.',
      technicianId: user.technicianProfile?.id,
    });
  } catch (error) {
    console.error('Technician registration error:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
