import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const emergencyOnly = searchParams.get('emergency') === 'true';

    const whereClause: any = {
      isActive: true,
    };

    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }

    if (emergencyOnly) {
      whereClause.isEmergencyService = true;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    const [services, categories] = await Promise.all([
      prisma.service.findMany({
        where: whereClause,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      prisma.serviceCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      services,
      categories,
    });
  } catch (error) {
    console.error('Fetch services error:', error);
    return NextResponse.json(
      { error: 'Failed to load services' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      categorySlug,
      basePrice,
      pricingType = 'STARTING_AT',
      estimatedDuration = '1-2 hours',
      isEmergencyService = false,
      shortDescription = '',
    } = body;

    if (!name || !basePrice) {
      return NextResponse.json({ error: 'Name and base price are required' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    let category = await prisma.serviceCategory.findFirst({
      where: categorySlug ? { slug: categorySlug } : undefined,
    });
    if (!category) {
      category = await prisma.serviceCategory.findFirst();
    }
    if (!category) {
      category = await prisma.serviceCategory.create({
        data: { name: 'Electrical Services', slug: 'electrical-services' },
      });
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        categoryId: category.id,
        basePrice: Number(basePrice),
        priceType: pricingType || 'FIXED',
        estimatedDuration: estimatedDuration || '1-2 Hours',
        isEmergencyService: Boolean(isEmergencyService),
        shortDescription,
        fullDescription: shortDescription,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create service' }, { status: 500 });
  }
}

