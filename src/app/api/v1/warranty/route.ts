import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.trim();
    const serial = searchParams.get('serial')?.trim();
    const invoice = searchParams.get('invoice')?.trim();
    const bookingNumber = searchParams.get('bookingNumber')?.trim();

    if (!query && !serial && !invoice && !bookingNumber) {
      if (session?.role === 'CUSTOMER') {
        const customer = await prisma.customerProfile.findUnique({
          where: { userId: session.id },
        });
        if (customer) {
          const [devices, serviceWarranties] = await Promise.all([
            prisma.deviceRegistration.findMany({
              where: { customerId: customer.id },
              include: { product: true, claims: true },
              orderBy: { createdAt: 'desc' },
            }),
            prisma.serviceWarranty.findMany({
              where: { booking: { customerId: customer.id } },
              include: {
                booking: { include: { service: true } },
                invoice: true,
              },
              orderBy: { createdAt: 'desc' },
            }),
          ]);

          return NextResponse.json({
            success: true,
            warranties: [
              ...serviceWarranties.map((sw) => ({
                id: sw.id,
                warrantyNumber: sw.warrantyNumber,
                type: 'SERVICE',
                title: sw.serviceTitle,
                startDate: sw.startDate,
                expiryDate: sw.expiryDate,
                periodDays: sw.warrantyPeriodDays,
                terms: sw.terms,
                status: new Date() > new Date(sw.expiryDate) ? 'EXPIRED' : sw.status,
                bookingNumber: sw.booking?.bookingNumber,
                invoiceNumber: sw.invoice?.invoiceNumber,
              })),
              ...devices.map((d) => ({
                id: d.id,
                warrantyNumber: d.serialNumber,
                type: 'PRODUCT',
                title: d.product?.name || 'Electronic Equipment',
                startDate: d.purchaseDate,
                expiryDate: d.warrantyExpiryDate,
                periodDays: d.warrantyPeriodMonths * 30,
                terms: 'Standard manufacturer parts warranty',
                status: new Date() > new Date(d.warrantyExpiryDate) ? 'EXPIRED' : d.status,
                invoiceNumber: d.invoiceNumber,
              })),
            ],
          });
        }
      }

      // Admin request for all claims
      const claims = await prisma.warrantyClaim.findMany({
        include: {
          device: {
            include: { customer: { include: { user: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, claims });
    }

    // First check ServiceWarranty
    const serviceWarranty = await prisma.serviceWarranty.findFirst({
      where: {
        OR: [
          ...(query ? [{ warrantyNumber: query }] : []),
          ...(query ? [{ booking: { bookingNumber: query } }] : []),
          ...(invoice ? [{ invoice: { invoiceNumber: invoice } }] : []),
          ...(bookingNumber ? [{ booking: { bookingNumber: bookingNumber } }] : []),
        ],
      },
      include: {
        booking: {
          include: {
            service: true,
            address: true,
            customer: { include: { user: true } },
            technician: { include: { user: true } },
          },
        },
        invoice: true,
      },
    });

    if (serviceWarranty) {
      const isExpired = new Date() > new Date(serviceWarranty.expiryDate);
      return NextResponse.json({
        success: true,
        warranty: {
          type: 'SERVICE',
          id: serviceWarranty.id,
          warrantyNumber: serviceWarranty.warrantyNumber,
          title: serviceWarranty.serviceTitle,
          service: serviceWarranty.booking?.service,
          bookingNumber: serviceWarranty.booking?.bookingNumber,
          customerName: serviceWarranty.booking?.customer?.user?.name,
          invoiceNumber: serviceWarranty.invoice?.invoiceNumber,
          startDate: serviceWarranty.startDate,
          expiryDate: serviceWarranty.expiryDate,
          periodDays: serviceWarranty.warrantyPeriodDays,
          terms: serviceWarranty.terms,
          isExpired,
          status: isExpired ? 'EXPIRED' : serviceWarranty.status,
        },
      });
    }

    // Then check device registration warranty
    const whereClause: any = query
      ? { OR: [{ serialNumber: query }, { invoiceNumber: query }] }
      : {
          ...(serial ? { serialNumber: serial } : {}),
          ...(invoice ? { invoiceNumber: invoice } : {}),
        };

    const device = await prisma.deviceRegistration.findFirst({
      where: whereClause,
      include: {
        product: true,
        claims: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: 'No warranty record found matching this warranty number, booking ID, or invoice.' },
        { status: 404 }
      );
    }

    // Check if still within warranty period
    const isExpired = new Date() > new Date(device.warrantyExpiryDate);

    return NextResponse.json({
      success: true,
      warranty: {
        type: 'PRODUCT',
        ...device,
        isExpired,
        status: isExpired ? 'EXPIRED' : device.status,
      },
    });
  } catch (error) {
    console.error('Warranty check error:', error);
    return NextResponse.json({ error: 'Failed to verify warranty' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    const body = await req.json();
    const { serialNumber, issueDescription, customerId } = body;

    if (!serialNumber || !issueDescription) {
      return NextResponse.json(
        { error: 'Serial number/warranty number and issue description are required' },
        { status: 400 }
      );
    }

    // Check if device registration
    const device = await prisma.deviceRegistration.findUnique({
      where: { serialNumber: serialNumber.trim() },
    });

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const claimNumber = `WCL${dateStr}${randomSuffix}`;

    if (device) {
      const claim = await prisma.warrantyClaim.create({
        data: {
          customerId: device.customerId,
          deviceId: device.id,
          claimNumber,
          issueDescription,
          status: 'RECEIVED',
        },
      });
      return NextResponse.json({ success: true, claim });
    }

    // Check if ServiceWarranty
    const sw = await prisma.serviceWarranty.findUnique({
      where: { warrantyNumber: serialNumber.trim() },
      include: { booking: { include: { customer: true } } },
    });

    if (sw) {
      // Create a support ticket for the service warranty claim
      const ticket = await prisma.supportTicket.create({
        data: {
          userId: session?.id || sw.booking.customer.userId,
          ticketNumber: claimNumber,
          subject: `Service Warranty Claim: ${sw.serviceTitle} (${sw.warrantyNumber})`,
          message: issueDescription,
          category: 'WARRANTY',
          priority: 'HIGH',
          status: 'OPEN',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Service warranty claim registered under priority support.',
        ticket,
      });
    }

    return NextResponse.json({ error: 'No matching warranty found' }, { status: 404 });
  } catch (error) {
    console.error('Submit warranty claim error:', error);
    return NextResponse.json({ error: 'Failed to submit warranty claim' }, { status: 500 });
  }
}
