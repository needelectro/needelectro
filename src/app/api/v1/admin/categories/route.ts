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

    if (type === 'SERVICE_CATEGORY') {
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
