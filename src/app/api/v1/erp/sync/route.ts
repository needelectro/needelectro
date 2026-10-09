import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get('entity') || 'all';

    let data: any = {};

    // 1. Products & Inventory Sync
    if (entity === 'products' || entity === 'all') {
      data.products = await prisma.product.findMany({
        select: {
          id: true,
          sku: true,
          name: true,
          price: true,
          discountPrice: true,
          stock: true,
          condition: true,
          warrantyPeriodMonths: true,
          updatedAt: true,
        },
      });
    }

    // 2. Orders & Sales Sync
    if (entity === 'orders' || entity === 'all') {
      data.orders = await prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          paymentStatus: true,
          paymentMethod: true,
          paymentTrxId: true,
          createdAt: true,
          items: {
            select: {
              productId: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              serialNumber: true,
            },
          },
        },
      });
    }

    // 3. Service Bookings Sync
    if (entity === 'bookings' || entity === 'all') {
      data.bookings = await prisma.booking.findMany({
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          totalAmount: true,
          paymentStatus: true,
          paymentMethod: true,
          preferredDate: true,
          completedAt: true,
          technician: {
            select: {
              id: true,
              nidNumber: true,
              user: { select: { name: true, phone: true } },
            },
          },
        },
      });
    }

    // 4. Customers Sync
    if (entity === 'customers' || entity === 'all') {
      data.customers = await prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      });
    }

    // 5. Technicians Sync
    if (entity === 'technicians' || entity === 'all') {
      data.technicians = await prisma.technicianProfile.findMany({
        select: {
          id: true,
          nidNumber: true,
          verificationStatus: true,
          walletBalance: true,
          totalCompletedJobs: true,
          user: {
            select: { name: true, phone: true, email: true },
          },
        },
      });
    }

    // 6. Warranties & Claims Sync
    if (entity === 'warranties' || entity === 'all') {
      data.warranties = await prisma.deviceRegistration.findMany({
        select: {
          id: true,
          serialNumber: true,
          productName: true,
          invoiceNumber: true,
          purchaseDate: true,
          warrantyExpiryDate: true,
          status: true,
          claims: {
            select: {
              claimNumber: true,
              issueDescription: true,
              status: true,
              resolvedAt: true,
            },
          },
        },
      });
    }

    // 7. Financial & Wallet Ledger Reconciliation Sync
    if (entity === 'finance' || entity === 'all') {
      data.walletTransactions = await prisma.walletTransaction.findMany({
        select: {
          id: true,
          technicianId: true,
          type: true,
          amount: true,
          balanceAfter: true,
          status: true,
          referenceId: true,
          createdAt: true,
        },
      });
      data.auditLogs = await prisma.auditLog.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({
      success: true,
      syncTimestamp: new Date().toISOString(),
      erpPlatform: 'NEED ELECTRO Enterprise ERP V1 Bi-Directional Connector',
      version: '1.2.0',
      entitiesSynced: Object.keys(data),
      data,
    });
  } catch (error) {
    return NextResponse.json({ error: 'ERP Sync query failed' }, { status: 500 });
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
            data: { stock: Number(item.stock) },
          });
        }
      }
      return NextResponse.json({ success: true, message: 'ERP inventory levels updated successfully.' });
    }

    if (action === 'SYNC_PRODUCT_PRICE') {
      // Synchronize updated pricing from ERP
      for (const item of payload.items || []) {
        if (item.sku) {
          await prisma.product.updateMany({
            where: { sku: item.sku },
            data: { 
              price: Number(item.price),
              discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
            },
          });
        }
      }
      return NextResponse.json({ success: true, message: 'ERP prices synchronized successfully.' });
    }

    if (action === 'SYNC_ORDER_STATUS') {
      // ERP dispatch update
      const { orderNumber, status } = payload;
      if (orderNumber && status) {
        await prisma.order.update({
          where: { orderNumber },
          data: { status },
        });
        return NextResponse.json({ success: true, message: `Order #${orderNumber} status updated to ${status}.` });
      }
    }

    if (action === 'FINANCIAL_RECONCILIATION') {
      // Record financial reconciliation event in audit log
      await prisma.auditLog.create({
        data: {
          action: 'ERP_FINANCIAL_RECONCILIATION',
          entity: 'LEDGER',
          newData: JSON.stringify(payload),
        },
      });
      return NextResponse.json({ success: true, message: 'Financial reconciliation batch verified and logged.' });
    }

    return NextResponse.json({ success: true, message: 'ERP webhook event acknowledged.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process ERP hook' }, { status: 500 });
  }
}
