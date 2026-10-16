import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const category = searchParams.get('category');

    const where: any = { isAvailable: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category && category !== 'ALL') {
      where.category = category;
    }

    const parts = await prisma.part.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, parts });
  } catch (error) {
    console.error('Fetch parts error:', error);
    return NextResponse.json({ error: 'Failed to fetch parts' }, { status: 500 });
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
    const { sku, name, category, price, costPrice, stock, unit } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const generatedSku = sku || `PRT-${Date.now().toString().slice(-6)}`;

    const part = await prisma.part.create({
      data: {
        sku: generatedSku,
        name,
        category: category || 'ELECTRICAL_MATERIALS',
        price: Number(price),
        costPrice: Number(costPrice || 0),
        stock: Number(stock || 100),
        unit: unit || 'piece',
        isAvailable: true,
      },
    });

    return NextResponse.json({ success: true, part });
  } catch (error: any) {
    console.error('Create part error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create part' }, { status: 500 });
  }
}
