import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { customer: { include: { user: { select: { name: true } } } } },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const formattedProduct = {
      ...product,
      images: product.images ? product.images.split(',') : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
    };

    const res = NextResponse.json({
      success: true,
      product: formattedProduct,
    });
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res;
  } catch (error) {
    console.error('Fetch product detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
