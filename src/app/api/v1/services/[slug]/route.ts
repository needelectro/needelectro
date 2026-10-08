import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        category: true,
        bookings: {
          take: 5,
          where: { status: 'COMPLETED' },
          include: {
            reviews: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Fetch service detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
