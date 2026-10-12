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

    const res = NextResponse.json({
      success: true,
      services,
      categories,
    });
    res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    return res;
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const currentService = await prisma.service.findUnique({ where: { id } });
    if (!currentService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (updates.name !== undefined) dataToUpdate.name = updates.name;
    if (updates.basePrice !== undefined) dataToUpdate.basePrice = Number(updates.basePrice);
    if (updates.priceType !== undefined) dataToUpdate.priceType = updates.priceType;
    if (updates.estimatedDuration !== undefined) dataToUpdate.estimatedDuration = updates.estimatedDuration;
    if (updates.isEmergencyService !== undefined) dataToUpdate.isEmergencyService = Boolean(updates.isEmergencyService);
    if (updates.shortDescription !== undefined) dataToUpdate.shortDescription = updates.shortDescription;
    if (updates.fullDescription !== undefined) dataToUpdate.fullDescription = updates.fullDescription;
    if (updates.isActive !== undefined) dataToUpdate.isActive = Boolean(updates.isActive);
    if (updates.sortOrder !== undefined) dataToUpdate.sortOrder = Number(updates.sortOrder);
    if (updates.categoryId !== undefined) dataToUpdate.categoryId = updates.categoryId;

    const updated = await prisma.service.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true },
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_SERVICE',
          entity: 'Service',
          entityId: id,
          previousData: JSON.stringify({ basePrice: currentService.basePrice, isActive: currentService.isActive }),
          newData: JSON.stringify(dataToUpdate),
        },
      });
    } catch (auditErr) {
      console.warn('Audit log write error:', auditErr);
    }

    return NextResponse.json({ success: true, service: updated });
  } catch (error: any) {
    console.error('Update service error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id },
      include: { bookings: { take: 1 } },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const hasBookings = service.bookings.length > 0;

    // Safety rule: Never delete services with historical bookings
    if (hasBookings || !permanent) {
      await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });

      await prisma.auditLog.create({
        data: {
          action: 'ARCHIVE_SERVICE',
          entity: 'Service',
          entityId: id,
          newData: JSON.stringify({
            status: 'ARCHIVED',
            reason: hasBookings ? 'Historical booking records protection' : 'Archived by administrator',
          }),
        },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: hasBookings
          ? 'Service has historical booking records. It was safely archived instead of permanently deleted.'
          : 'Service archived successfully.',
      });
    }

    await prisma.service.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_SERVICE_PERMANENT',
        entity: 'Service',
        entityId: id,
        previousData: JSON.stringify({ name: service.name }),
      },
    });

    return NextResponse.json({ success: true, permanent: true, message: 'Service permanently removed.' });
  } catch (error: any) {
    console.error('Delete service error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete service' }, { status: 500 });
  }
}


