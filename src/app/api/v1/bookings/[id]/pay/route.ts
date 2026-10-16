import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      amount,
      paymentMethod = 'CASH_ON_DELIVERY',
      paymentType = 'FINAL', // ADVANCE, FINAL
      trxId,
    } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        invoice: true,
        customer: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const payAmount = Number(amount) || booking.totalAmount;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ensure ServiceInvoice exists
      let invoice = booking.invoice;
      if (!invoice) {
        invoice = await tx.serviceInvoice.create({
          data: {
            invoiceNumber: `INV-SRV-${dateStr}${randomSuffix}`,
            bookingId: id,
            laborAmount: booking.totalAmount,
            partsAmount: 0,
            totalAmount: booking.totalAmount,
            paymentStatus: paymentType === 'FINAL' ? 'PAID' : 'PARTIALLY_PAID',
            paymentMethod,
            paidAt: paymentType === 'FINAL' ? new Date() : null,
          },
        });
      } else if (paymentType === 'FINAL') {
        invoice = await tx.serviceInvoice.update({
          where: { id: invoice.id },
          data: {
            paymentStatus: 'PAID',
            paidAt: new Date(),
            paymentMethod,
          },
        });
      }

      // 2. Record ServicePayment
      const payment = await tx.servicePayment.create({
        data: {
          paymentNumber: `PAY-${dateStr}${randomSuffix}`,
          invoiceId: invoice.id,
          bookingId: id,
          amount: payAmount,
          paymentType,
          paymentMethod,
          trxId: trxId || null,
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // 3. Update Booking
      const updateData: any = {};
      if (paymentType === 'ADVANCE') {
        updateData.advancePaid = { increment: payAmount };
      } else {
        updateData.paymentStatus = 'PAID';
        if (booking.status === 'COMPLETED') {
          updateData.status = 'PAID';
        }
      }

      const updatedBooking = await tx.booking.update({
        where: { id },
        data: updateData,
      });

      // 4. Timeline
      await tx.bookingTimeline.create({
        data: {
          bookingId: id,
          status: updatedBooking.status,
          actorId: session.id,
          actorRole: session.role,
          note: `Payment of ৳${payAmount} received via ${paymentMethod}${trxId ? ` (TrxID: ${trxId})` : ''} (${paymentType}).`,
        },
      });

      return { payment, invoice, booking: updatedBooking };
    });

    return NextResponse.json({
      success: true,
      message: 'Service payment processed successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Service payment error:', error);
    return NextResponse.json({ error: error.message || 'Payment failed' }, { status: 500 });
  }
}
