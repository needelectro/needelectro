import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const [categories, brands, serviceCategories] = await Promise.all([
      prisma.productCategory.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.brand.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.serviceCategory.findMany({
        include: { _count: { select: { services: true } } },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      categories,
      brands,
      serviceCategories,
    });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { type, name, slug, description, imageUrl, logoUrl } = body;

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (type === 'BRAND') {
      const brand = await prisma.brand.create({
        data: { name, slug: generatedSlug, logoUrl },
      });
      return NextResponse.json({ success: true, brand });
    }

    if (type === 'SERVICE_CATEGORY' || type === 'SERVICE') {
      const cat = await prisma.serviceCategory.create({
        data: { name, slug: generatedSlug, description, imageUrl },
      });
      return NextResponse.json({ success: true, category: cat });
    }

    // Default: Product Category
    const category = await prisma.productCategory.create({
      data: { name, slug: generatedSlug, description, imageUrl },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create category' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { id, type, name, slug, description, imageUrl, logoUrl } = body;

    if (!id || !type) {
      return NextResponse.json({ error: 'id and type are required' }, { status: 400 });
    }

    let updatedRecord;
    if (type === 'BRAND') {
      updatedRecord = await prisma.brand.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(slug && { slug }),
          ...(logoUrl !== undefined && { logoUrl }),
        },
      });
    } else if (type === 'SERVICE_CATEGORY' || type === 'SERVICE') {
      updatedRecord = await prisma.serviceCategory.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(slug && { slug }),
          ...(description !== undefined && { description }),
          ...(imageUrl !== undefined && { imageUrl }),
        },
      });
    } else {
      updatedRecord = await prisma.productCategory.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(slug && { slug }),
          ...(description !== undefined && { description }),
          ...(imageUrl !== undefined && { imageUrl }),
        },
      });
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: `UPDATE_${type.toUpperCase()}`,
          entity: type,
          entityId: id,
          newData: JSON.stringify({ name, slug }),
        },
      });
    } catch (e) {}

    return NextResponse.json({ success: true, record: updatedRecord });
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || 'PRODUCT';

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    if (type === 'BRAND') {
      const brand = await prisma.brand.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });
      if (brand && brand._count.products > 0) {
        return NextResponse.json(
          { error: `Cannot delete brand '${brand.name}'. It is linked to ${brand._count.products} products.` },
          { status: 400 }
        );
      }
      await prisma.brand.delete({ where: { id } });
    } else if (type === 'SERVICE_CATEGORY' || type === 'SERVICE') {
      const sc = await prisma.serviceCategory.findUnique({
        where: { id },
        include: { _count: { select: { services: true } } },
      });
      if (sc && sc._count.services > 0) {
        return NextResponse.json(
          { error: `Cannot delete category '${sc.name}'. It is linked to ${sc._count.services} electrical services.` },
          { status: 400 }
        );
      }
      await prisma.serviceCategory.delete({ where: { id } });
    } else {
      const pc = await prisma.productCategory.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });
      if (pc && pc._count.products > 0) {
        return NextResponse.json(
          { error: `Cannot delete category '${pc.name}'. It is linked to ${pc._count.products} catalog products.` },
          { status: 400 }
        );
      }
      await prisma.productCategory.delete({ where: { id } });
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: `DELETE_${type.toUpperCase()}`,
          entity: type,
          entityId: id,
          previousData: JSON.stringify({ deleted: true }),
        },
      });
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete category' }, { status: 500 });
  }
}
