import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const brandSlug = searchParams.get('brand');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';
    const condition = searchParams.get('condition'); // NEW or REFURBISHED

    const whereClause: any = {
      isActive: true,
    };

    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }

    if (brandSlug) {
      whereClause.brand = { slug: brandSlug };
    }

    if (featured) {
      whereClause.isFeatured = true;
    }

    if (condition) {
      whereClause.condition = condition;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    const [products, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.productCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.brand.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    const formattedProducts = products.map((p) => ({
      ...p,
      images: p.images ? p.images.split(',') : [],
      specifications: p.specifications ? JSON.parse(p.specifications) : {},
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      categories,
      brands,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
