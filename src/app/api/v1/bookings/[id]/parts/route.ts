import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingParts = await prisma.bookingPart.findMany({
      where: { bookingId: id },
      include: { part: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, bookingParts });
  } catch (error) {
    console.error('Fetch booking parts error:', error);
    return NextResponse.json({ error: 'Failed to fetch parts' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    if (!session || (session.role !== 'TECHNICIAN' && session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized to add parts' }, { status: 403 });
    }

    const body = await req.json();
    const { partId, partName, quantity = 1, unitPrice = 0, notes } = body;

    if (!partName && !partId) {
      return NextResponse.json({ error: 'Part name or partId is required' }, { status: 400 });
    }

    let resolvedName = partName || 'Replacement Part';
    let resolvedPrice = Number(unitPrice);
    let finalPartId = partId;

    if (finalPartId) {
      const dbPart = await prisma.part.findUnique({ where: { id: finalPartId } });
      if (dbPart) {
        resolvedName = dbPart.name;
        if (!resolvedPrice) resolvedPrice = dbPart.price;
      }
    } else {
      // Find or dynamically register part in catalog
      let partRecord = await prisma.part.findFirst({ where: { name: resolvedName } });
      if (!partRecord) {
        partRecord = await prisma.part.create({
          data: {
            sku: `PRT-${Date.now().toString().slice(-6)}`,
            name: resolvedName,
            category: 'ELECTRICAL_MATERIALS',
            price: resolvedPrice,
            costPrice: Math.round(resolvedPrice * 0.75),
            stock: 100,
            unit: 'piece',
            isAvailable: true,
          },
        });
      }
      finalPartId = partRecord.id;
    }

    const qty = Number(quantity) || 1;
    const totalPrice = resolvedPrice * qty;

    const result = await prisma.$transaction(async (tx) => {
      const bookingPart = await tx.bookingPart.create({
        data: {
          bookingId: id,
          partId: finalPartId,
          quantity: qty,
          unitPrice: resolvedPrice,
          totalPrice,
          addedBy: session.role || 'TECHNICIAN',
        },
        include: {
          part: true,
        },
      });

      // Increment totalAmount of booking
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          totalAmount: { increment: totalPrice },
        },
      });

      // Update invoice if it exists
      const existingInvoice = await tx.serviceInvoice.findUnique({
        where: { bookingId: id },
      });

      if (existingInvoice) {
        await tx.serviceInvoice.update({
          where: { id: existingInvoice.id },
          data: {
            partsAmount: { increment: totalPrice },
            totalAmount: { increment: totalPrice },
          },
        });
      }

      await tx.bookingTimeline.create({
        data: {
          bookingId: id,
          status: updatedBooking.status,
          actorId: session.id,
          actorRole: session.role,
          note: `Added parts: ${resolvedName} x${qty} (৳${totalPrice})${notes ? ` - ${notes}` : ''}`,
        },
      });

      return bookingPart;
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    return NextResponse.json({ success: true, bookingPart: result });
  } catch (error: any) {
    console.error('Add booking part error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add part' }, { status: 500 });
  }
}
