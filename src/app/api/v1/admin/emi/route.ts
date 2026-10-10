import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'ACCOUNTANT' && session.role !== 'SALES_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const [accounts, totalAccounts, activeAccounts] = await Promise.all([
      prisma.emiAccount.findMany({
        where: whereClause,
        include: {
          customer: { include: { user: { select: { name: true, phone: true, email: true } } } },
          product: { select: { name: true, sku: true, price: true } },
          installments: { orderBy: { installmentNo: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.emiAccount.count(),
      prisma.emiAccount.count({ where: { status: 'ACTIVE' } }),
    ]);

    const totalFinanced = accounts.reduce((sum: number, a: any) => sum + (a.financedAmount || 0), 0);
    const totalCollected = accounts.reduce((sum: number, a: any) => {
      const paid = a.installments.filter((i: any) => i.status === 'PAID').reduce((iSum: number, i: any) => iSum + (i.amount || 0), 0);
      return sum + (a.downPayment || 0) + paid;
    }, 0);

    return NextResponse.json({
      success: true,
      accounts,
      stats: {
        totalAccounts,
        activeAccounts,
        totalFinanced,
        totalCollected,
        outstandingBalance: Math.max(0, totalFinanced - totalCollected),
      },
    });
  } catch (error) {
    console.error('EMI fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch EMI accounts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'ACCOUNTANT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // Record an installment payment
    if (action === 'PAY_INSTALLMENT') {
      const { installmentId, transactionId, paymentMethod = 'BKASH', notes } = body;

      const updated = await prisma.emiInstallment.update({
        where: { id: installmentId },
        data: {
          status: 'PAID',
          paidDate: new Date(),
          paidAmount: body.amount,
          transactionId,
          paymentMethod,
          notes,
        },
      });

      return NextResponse.json({ success: true, installment: updated });
    }

    // Create a new EMI agreement
    const {
      customerId,
      productId,
      serialNumber,
      totalPrice,
      downPayment,
      tenureMonths = 6,
    } = body;

    const financedAmount = totalPrice - downPayment;
    const monthlyPayment = Math.round(financedAmount / tenureMonths);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const accountNumber = `EMI${dateStr}${randomSuffix}`;

    const installmentsData = Array.from({ length: tenureMonths }).map((_, idx) => {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + (idx + 1));
      return {
        installmentNo: idx + 1,
        dueDate,
        amount: monthlyPayment,
        status: 'PENDING',
      };
    });

    const emiAccount = await prisma.emiAccount.create({
      data: {
        accountNumber,
        customerId,
        productId,
        serialNumber,
        totalPrice,
        downPayment,
        financedAmount,
        tenureMonths,
        monthlyPayment,
        status: 'ACTIVE',
        installments: {
          create: installmentsData,
        },
      },
      include: { installments: true },
    });

    return NextResponse.json({ success: true, emiAccount });
  } catch (error: any) {
    console.error('EMI action error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process EMI request' }, { status: 500 });
  }
}
