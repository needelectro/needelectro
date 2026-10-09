import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.trim();
    const serial = searchParams.get('serial')?.trim();
    const invoice = searchParams.get('invoice')?.trim();

    if (!query && !serial && !invoice) {
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
        { error: 'No warranty record found matching this serial number or invoice.' },
        { status: 404 }
      );
    }

    // Check if still within warranty period
    const isExpired = new Date() > new Date(device.warrantyExpiryDate);

    return NextResponse.json({
      success: true,
      warranty: {
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
        { error: 'Serial number and issue description are required' },
        { status: 400 }
      );
    }

    const device = await prisma.deviceRegistration.findUnique({
      where: { serialNumber: serialNumber.trim() },
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const claimNumber = `WCL${dateStr}${randomSuffix}`;

    const claim = await prisma.warrantyClaim.create({
      data: {
        customerId: device.customerId,
        deviceId: device.id,
        claimNumber,
        issueDescription,
        status: 'SUBMITTED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Warranty claim submitted successfully.',
      claim,
    });
  } catch (error) {
    console.error('Submit warranty claim error:', error);
    return NextResponse.json({ error: 'Failed to submit warranty claim' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { claimId, status, adminNotes } = body;

    if (!claimId || !status) {
      return NextResponse.json({ error: 'Claim ID and status required' }, { status: 400 });
    }

    const updated = await prisma.warrantyClaim.update({
      where: { id: claimId },
      data: {
        status,
        adminNotes: adminNotes || null,
        resolvedAt: ['RESOLVED', 'REPLACED', 'APPROVED'].includes(status) ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, claim: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update warranty claim' }, { status: 500 });
  }
}
