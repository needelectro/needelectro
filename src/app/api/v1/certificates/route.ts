import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const certNumber = searchParams.get('cert')?.trim();

    if (!certNumber) {
      return NextResponse.json({ error: 'Certificate number is required' }, { status: 400 });
    }

    const application = await prisma.trainingApplication.findFirst({
      where: {
        certificateNumber: {
          equals: certNumber,
        },
        status: 'CERTIFIED',
      },
      include: {
        course: {
          select: {
            title: true,
            category: true,
            durationWeeks: true,
            totalHours: true,
            instructorName: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({
        found: false,
        message: 'No official NEED ELECTRO certificate found matching this credential ID.',
      }, { status: 404 });
    }

    return NextResponse.json({
      found: true,
      certificate: {
        certificateNumber: application.certificateNumber,
        studentName: application.fullName,
        issueDate: application.certificateIssueDate,
        courseTitle: application.course.title,
        courseCategory: application.course.category,
        duration: `${application.course.durationWeeks} Weeks (${application.course.totalHours} Practical Hours)`,
        instructor: application.course.instructorName,
        status: 'OFFICIALLY_VERIFIED',
        accreditedBy: 'NEED ELECTRO Academy & Amdads Group Technical Standards Council',
        notes: application.notes,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Certificate lookup failed' }, { status: 500 });
  }
}
