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
    const status = searchParams.get('status');
    const availableJobs = searchParams.get('available') === 'true';

    let whereClause: any = {};

    if (availableJobs) {
      // Jobs waiting for technician matching
      whereClause = {
        status: 'MATCHING',
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

    if (status) {
      whereClause.status = status;
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
            user: { select: { name: true, phone: true } },
          },
        },
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
    } = body;

    if (!serviceId || !problemDescription || !preferredDate || !preferredTimeSlot) {
      return NextResponse.json(
        { error: 'Service, problem description, date, and time slot are required' },
        { status: 400 }
      );
    }

    // Resolve customer profile
    let customerProfileId = session?.customerProfileId;
    if (!customerProfileId) {
      if (session) {
        let cp = await prisma.customerProfile.findUnique({ where: { userId: session.id } });
        if (!cp) {
          cp = await prisma.customerProfile.create({ data: { userId: session.id } });
        }
        customerProfileId = cp.id;
      } else {
        // Guest user booking: create a customer account or use demo customer
        const guestCust = await prisma.user.findFirst({
          where: { role: 'CUSTOMER' },
          include: { customerProfile: true },
        });
        customerProfileId = guestCust?.customerProfile?.id;
      }
    }

    if (!customerProfileId) {
      return NextResponse.json({ error: 'Customer profile required' }, { status: 400 });
    }

    // Handle Address
    let addressId = typeof address === 'string' ? address : null;
    if (!addressId && typeof address === 'object') {
      const createdAddr = await prisma.address.create({
        data: {
          customerId: customerProfileId,
          recipientName: address.recipientName || 'Customer',
          phone: address.phone || '01733983752',
          division: address.division || 'Sylhet',
          district: address.district || 'Moulvibazar',
          upazila: address.upazila || 'Moulvibazar Sadar',
          area: address.area || 'Kusumbag',
          addressLine: address.addressLine || 'Main Road',
          landmark: address.landmark,
        },
      });
      addressId = createdAddr.id;
    }

    // Fetch service price
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    const totalAmount = service ? service.basePrice : 500.0;

    // Generate unique booking number: NE + YYYYMMDD + Random 4 digits
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `NE${dateStr}${randomSuffix}`;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId: customerProfileId,
        serviceId,
        problemDescription,
        preferredDate,
        preferredTimeSlot,
        urgency,
        status: 'MATCHING',
        paymentMethod,
        totalAmount,
        customerNotes,
        addressId,
        timeline: {
          create: {
            status: 'RECEIVED',
            actorRole: 'CUSTOMER',
            note: 'Service booking request created and verified.',
          },
        },
      },
      include: {
        service: true,
        address: true,
        timeline: true,
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
