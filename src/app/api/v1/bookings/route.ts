import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken, hashPassword, signToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const availableJobs = searchParams.get('available') === 'true';

    let whereClause: any = {};

    if (availableJobs) {
      // Jobs waiting for technician matching/dispatch
      whereClause = {
        status: { in: ['MATCHING', 'REQUESTED', 'CONFIRMED', 'OFFERED', 'AVAILABLE'] },
        technicianId: null,
      };
    } else if (session) {
      if (session.role === 'CUSTOMER') {
        const customer = await prisma.customerProfile.findUnique({
          where: { userId: session.id },
        });
        if (!customer) return NextResponse.json({ bookings: [] });
        whereClause.customerId = customer.id;
      } else if (session.role === 'TECHNICIAN') {
        const tech = await prisma.technicianProfile.findUnique({
          where: { userId: session.id },
        });
        if (!tech) return NextResponse.json({ bookings: [] });
        whereClause.technicianId = tech.id;
      }
      // ADMIN sees all bookings
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (status && status !== 'ALL') {
      if (status === 'AVAILABLE') {
        whereClause.status = { in: ['MATCHING', 'REQUESTED', 'CONFIRMED', 'OFFERED', 'AVAILABLE'] };
        whereClause.technicianId = null;
      } else {
        whereClause.status = status;
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        address: true,
        technician: {
          include: {
            user: { select: { name: true, phone: true, avatarUrl: true } },
          },
        },
        customer: {
          include: {
            user: { select: { name: true, phone: true, email: true } },
          },
        },
        quotes: true,
        invoice: true,
        warranty: true,
        bookingParts: true,
        timeline: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Failed to load bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('need_electro_token')?.value;
    const session = token ? verifyToken(token) : null;

    const body = await req.json();
    const {
      serviceId,
      problemDescription,
      preferredDate,
      preferredTimeSlot,
      urgency = 'NORMAL',
      paymentMethod = 'CASH_ON_DELIVERY',
      customerNotes,
      address, // either addressId or new address object
      thana,
      mediaUrls,
      estimatedBudget,
      advancePaid = 0.0,
      status: requestedStatus,
    } = body;

    if (!serviceId || !problemDescription || !preferredDate || !preferredTimeSlot) {
      return NextResponse.json(
        { error: 'Service, problem description, date, and time slot are required' },
        { status: 400 }
      );
    }

    // MANDATORY AUTHENTICATION: Require verified customer session
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please sign in or create a customer account to book a service.',
          requiresAuth: true,
          redirectUrl: '/customer/login?redirect=/booking',
        },
        { status: 401 }
      );
    }

    // Resolve customer profile for authenticated user
    let customerProfileId = session.customerProfileId;
    if (!customerProfileId) {
      let cp = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
      if (!cp) {
        cp = await prisma.customerProfile.create({ data: { userId: session.id } });
      }
      customerProfileId = cp.id;
    }

    if (!customerProfileId) {
      return NextResponse.json(
        { success: false, error: 'Customer profile required. Please sign in again.' },
        { status: 400 }
      );
    }

    // Flexible Service Location: Handle saved addressId or create independent service location snapshot
    const targetAddress = address || body.location;
    let addressId = typeof targetAddress === 'string' ? targetAddress : null;
    let resolvedThana = thana;

    if (!addressId && typeof targetAddress === 'object' && targetAddress) {
      const isDefaultExplicit = Boolean(body.setAsDefault);
      if (isDefaultExplicit) {
        await prisma.address.updateMany({
          where: { customerId: customerProfileId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const createdAddr = await prisma.address.create({
        data: {
          customerId: customerProfileId,
          label: targetAddress.label || (body.saveToProfile ? 'Saved Service Location' : 'Service Location Snapshot'),
          recipientName: targetAddress.recipientName || body.customerName || session.name || 'Customer',
          phone: targetAddress.phone || body.customerPhone || session.phone || '01733983752',
          division: targetAddress.division || 'Sylhet',
          district: targetAddress.district || 'Moulvibazar',
          upazila: targetAddress.upazila || targetAddress.thana || 'Moulvibazar Sadar',
          area: targetAddress.area || 'Kusumbag Point',
          addressLine: targetAddress.addressLine || 'Main Road',
          landmark: targetAddress.landmark || null,
          isDefault: isDefaultExplicit, // NEVER changes customer's permanent address unless explicitly chosen
        },
      });
      addressId = createdAddr.id;
      if (!resolvedThana) resolvedThana = createdAddr.upazila;
    } else if (addressId) {
      const existingAddr = await prisma.address.findUnique({ where: { id: addressId } });
      if (existingAddr && !resolvedThana) {
        resolvedThana = existingAddr.upazila;
      }
    }

    // Fetch service price
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    const totalAmount = service ? service.basePrice : (estimatedBudget || 500.0);

    // Generate unique booking number: NE + YYYYMMDD + Random 4 digits
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `NE${dateStr}${randomSuffix}`;

    const bookingStatus = requestedStatus || 'REQUESTED';

    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId: customerProfileId,
          serviceId,
          problemDescription,
          preferredDate,
          preferredTimeSlot,
          urgency,
          status: bookingStatus,
          paymentMethod,
          totalAmount,
          customerNotes,
          addressId,
          thana: resolvedThana,
          mediaUrls: Array.isArray(mediaUrls) ? mediaUrls.join(',') : mediaUrls,
          estimatedBudget: estimatedBudget ? Number(estimatedBudget) : totalAmount,
          advancePaid: Number(advancePaid) || 0.0,
          timeline: {
            create: {
              status: 'REQUESTED',
              actorRole: 'CUSTOMER',
              actorId: session.id,
              note: 'Service booking request registered with verified customer profile.',
            },
          },
        },
        include: {
          service: true,
          address: true,
          timeline: true,
        },
      });

      // Auto-generate initial formal Quote
      const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await tx.quote.create({
        data: {
          quoteNumber: `QT${dateStr}${randomSuffix}`,
          bookingId: createdBooking.id,
          laborCost: totalAmount,
          partsCost: 0.0,
          discount: 0.0,
          totalAmount: totalAmount,
          notes: `Official preliminary estimate for ${service?.name || 'Service'}. Parts cost determined on-site if needed.`,
          validUntil,
          status: 'PENDING',
        },
      });

      return createdBooking;
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
