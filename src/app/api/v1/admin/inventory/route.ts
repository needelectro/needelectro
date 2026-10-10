import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'INVENTORY_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'low', 'out', 'all'
    const search = searchParams.get('search') || '';

    let whereClause: any = {};
    if (filter === 'low') {
      whereClause.stock = { gt: 0, lte: 5 };
    } else if (filter === 'out') {
      whereClause.stock = { lte: 0 };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, movements, totalSkus, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: { category: true, brand: true },
        orderBy: { stock: 'asc' },
      }),
      prisma.stockMovement.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true, sku: true } } },
      }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { stock: { lte: 0 } } }),
    ]);

    const totalValuation = products.reduce((sum: number, p: any) => sum + (p.price * Math.max(0, p.stock)), 0);

    return NextResponse.json({
      success: true,
      products,
      movements,
      stats: {
        totalSkus,
        lowStockCount,
        outOfStockCount,
        totalValuation,
      },
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'INVENTORY_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { productId, changeQty, reason, notes } = body;

    if (!productId || typeof changeQty !== 'number' || changeQty === 0) {
      return NextResponse.json({ error: 'Valid productId and change quantity required' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');

      const previousStock = product.stock;
      const newStock = Math.max(0, previousStock + changeQty);

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          changeQty,
          previousStock,
          newStock,
          reason: reason || 'ADJUSTMENT',
          actorId: session.id,
          actorName: session.name,
          notes: notes || 'Manual administrative stock adjustment',
        },
      });

      return { updatedProduct, movement };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Stock adjustment error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to adjust stock' }, { status: 500 });
  }
}
