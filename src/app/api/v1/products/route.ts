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

    const formattedProducts = products.map((p: any) => ({
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      categorySlug,
      brandName,
      price,
      salePrice,
      sku,
      stockQuantity = 0,
      warrantyMonths = 0,
      shortDescription = '',
      condition = 'NEW',
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    // Slug generator
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    // Find or create category
    let category = await prisma.productCategory.findFirst({
      where: categorySlug ? { slug: categorySlug } : undefined,
    });
    if (!category) {
      category = await prisma.productCategory.findFirst();
    }
    if (!category) {
      category = await prisma.productCategory.create({
        data: { name: 'General', slug: 'general' },
      });
    }

    // Find or create brand
    let brand = await prisma.brand.findFirst({
      where: brandName ? { name: brandName } : undefined,
    });
    if (!brand) {
      brand = await prisma.brand.findFirst();
    }
    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: brandName || 'Generic', slug: (brandName || 'generic').toLowerCase() },
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId: category.id,
        brandId: brand.id,
        price: Number(price),
        discountPrice: salePrice ? Number(salePrice) : null,
        sku: sku || `NE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        stock: Number(stockQuantity || 10),
        warrantyPeriodMonths: Number(warrantyMonths || 12),
        shortDescription,
        description: shortDescription,
        condition,
        images: '/logo.png',
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

