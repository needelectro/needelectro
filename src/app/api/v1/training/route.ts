import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where: any = { isActive: true };
    if (category && category !== 'all') {
      where.category = category.toUpperCase();
    }

    const courses = await prisma.trainingCourse.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, fullName, email, phone, nidNumber, education, address, experienceLevel, motivation } = body;

    if (!courseId || !fullName || !phone || !education) {
      return NextResponse.json({ error: 'Please provide course, name, phone, and educational background.' }, { status: 400 });
    }

    const course = await prisma.trainingCourse.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Selected course not found.' }, { status: 404 });
    }

    const application = await prisma.trainingApplication.create({
      data: {
        courseId,
        fullName,
        email: email || `${phone}@applicant.needelectro.com`,
        phone,
        nidNumber: nidNumber || null,
        education,
        address: address || 'Moulvibazar',
        experienceLevel: experienceLevel || 'BEGINNER',
        motivation: motivation || null,
        status: 'SUBMITTED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application received successfully. NEED ELECTRO Training Academy admissions team will contact you shortly.',
      applicationId: application.id,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 });
  }
}
