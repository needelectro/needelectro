import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get('entity') || 'all';

    let data: any = {};

    if (entity === 'products' || entity === 'all') {
      data.products = await prisma.product.findMany({
        select: {
          id: true,
          sku: true,
          name: true,
          price: true,
          stock: true,
          updatedAt: true,
        },
      });
    }

    if (entity === 'orders' || entity === 'all') {
      data.orders = await prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          paymentStatus: true,
          createdAt: true,
        },
      });
    }

    if (entity === 'bookings' || entity === 'all') {
      data.bookings = await prisma.booking.findMany({
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          totalAmount: true,
          paymentStatus: true,
          completedAt: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      syncTimestamp: new Date().toISOString(),
      erpPlatform: 'NEED ELECTRO ERP V1 Connector',
      data,
    });
  } catch (error) {
    return NextResponse.json({ error: 'ERP Sync failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === 'SYNC_INVENTORY') {
      // Synchronize stock levels from ERP to platform
      for (const item of payload.items || []) {
        if (item.sku) {
          await prisma.product.updateMany({
            where: { sku: item.sku },
            data: { stock: item.stock },
          });
        }
      }
      return NextResponse.json({ success: true, message: 'ERP inventory levels updated successfully.' });
    }

    return NextResponse.json({ success: true, message: 'ERP hook acknowledged.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process ERP hook' }, { status: 500 });
  }
}
