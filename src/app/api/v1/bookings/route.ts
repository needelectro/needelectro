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

    // Resolve customer profile for authenticated user or auto-provision for guest with phone
    let customerProfileId = session?.customerProfileId;
    let resolvedUserId = session?.id;
    let newSessionToken: string | null = null;

    const targetAddress = address || body.location;

    if (!session) {
      const cleanPhone = (body.customerPhone || targetAddress?.phone || '').trim();
      if (!cleanPhone) {
        return NextResponse.json(
          {
            success: false,
            error: 'Please enter your mobile phone number so we can confirm your technician.',
            requiresPhone: true,
          },
          { status: 400 }
        );
      }

      // Check if user already exists with this phone
      const fallbackEmail = `${cleanPhone.replace(/\D/g, '')}@needelectro.store`;
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: cleanPhone },
            { email: fallbackEmail },
          ],
        },
        include: { customerProfile: true },
      });

      if (!user) {
        const dummyPassword = await hashPassword(Math.random().toString(36).slice(-10) + 'NE@2026');
        user = await prisma.user.create({
          data: {
            name: body.customerName || targetAddress?.recipientName || 'Valued Customer',
            phone: cleanPhone,
            email: body.customerEmail || fallbackEmail,
            passwordHash: dummyPassword,
            role: 'CUSTOMER',
            status: 'ACTIVE',
            customerProfile: {
              create: {},
            },
          },
          include: { customerProfile: true },
        });
      } else if (!user.customerProfile) {
        const cp = await prisma.customerProfile.create({ data: { userId: user.id } });
        user = { ...user, customerProfile: cp };
      }

      resolvedUserId = user.id;
      customerProfileId = user.customerProfile!.id;

      // Generate session token so the customer gets automatically logged in
      newSessionToken = signToken({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        customerProfileId: user.customerProfile!.id,
      });
    } else {
      // Authenticated user
      if (!customerProfileId) {
        let cp = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
        if (!cp) {
          cp = await prisma.customerProfile.create({ data: { userId: session.id } });
        }
        customerProfileId = cp.id;
      }
    }

    if (!customerProfileId) {
      return NextResponse.json(
        { success: false, error: 'Customer profile required. Please try again.' },
        { status: 400 }
      );
    }

    // Handle Address (accept either address or location parameter)
    let addressId = typeof targetAddress === 'string' ? targetAddress : null;
    let resolvedThana = thana;
    if (!addressId && typeof targetAddress === 'object' && targetAddress) {
      const createdAddr = await prisma.address.create({
        data: {
          customerId: customerProfileId,
          recipientName: targetAddress.recipientName || body.customerName || 'Customer',
          phone: targetAddress.phone || body.customerPhone || '01733983752',
          division: targetAddress.division || 'Sylhet',
          district: targetAddress.district || 'Moulvibazar',
          upazila: targetAddress.upazila || targetAddress.thana || 'Moulvibazar Sadar',
          area: targetAddress.area || 'Kusumbag Point',
          addressLine: targetAddress.addressLine || 'Main Road',
          landmark: targetAddress.landmark,
        },
      });
      addressId = createdAddr.id;
      if (!resolvedThana) resolvedThana = createdAddr.upazila;
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
          customerId: customerProfileId!,
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
              actorId: resolvedUserId || 'GUEST_USER',
              note: 'Service booking request created with instant estimate.',
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

    const response = NextResponse.json({ success: true, booking, autoLoggedIn: !!newSessionToken });
    if (newSessionToken) {
      response.cookies.set('need_electro_token', newSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }
    return response;
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
