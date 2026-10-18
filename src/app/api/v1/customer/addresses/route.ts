import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

type ResolveResult =
  | { success: true; userId: string; customerProfileId: string }
  | { success: false; status: 401 | 403; error: string };

async function resolveCustomer(req: NextRequest): Promise<ResolveResult> {
  let token: string | undefined;
  try {
    const cookieStore = await cookies();
    token = cookieStore.get('need_electro_token')?.value;
  } catch {}

  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return { success: false, status: 401, error: 'Unauthorized: Authentication required.' };
  }

  const payload = verifyToken(token);
  if (!payload?.id) {
    return { success: false, status: 401, error: 'Unauthorized: Session invalid or expired.' };
  }

  // Strict separation: Technicians cannot manage customer delivery addresses
  if (payload.role === 'TECHNICIAN') {
    return {
      success: false,
      status: 403,
      error: 'Forbidden: Technician accounts cannot manage customer delivery addresses.',
    };
  }

  let cp = await prisma.customerProfile.findUnique({
    where: { userId: payload.id },
  });

  if (!cp) {
    cp = await prisma.customerProfile.create({
      data: { userId: payload.id },
    });
  }

  return { success: true, userId: payload.id, customerProfileId: cp.id };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveCustomer(req);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const addresses = await prisma.address.findMany({
      where: { customerId: auth.customerProfileId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(
      { success: true, addresses },
      {
        headers: {
          'Cache-Control': 'private, max-age=15, stale-while-revalidate=45',
        },
      }
    );
  } catch (error: any) {
    console.error('Fetch addresses error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await resolveCustomer(req);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const {
      label = 'Home',
      recipientName,
      phone,
      division = 'Sylhet',
      district = 'Moulvibazar',
      upazila = 'Moulvibazar Sadar',
      area,
      addressLine,
      landmark,
      isDefault = false,
    } = body;

    if (!recipientName || !phone || !area || !addressLine) {
      return NextResponse.json(
        { success: false, error: 'Recipient name, phone, area, and address line are required.' },
        { status: 400 }
      );
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId: auth.customerProfileId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        customerId: auth.customerProfileId,
        label: label.trim(),
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        division: division.trim(),
        district: district.trim(),
        upazila: upazila.trim(),
        area: area.trim(),
        addressLine: addressLine.trim(),
        landmark: landmark ? landmark.trim() : null,
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ success: true, address: newAddress }, { status: 201 });
  } catch (error: any) {
    console.error('Create address error:', error);
    return NextResponse.json({ success: false, error: 'Failed to add address' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await resolveCustomer(req);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { id, isDefault, ...otherUpdates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Address ID is required' }, { status: 400 });
    }

    // Check ownership
    const existing = await prisma.address.findFirst({
      where: { id, customerId: auth.customerProfileId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Address not found or unauthorized' }, { status: 404 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId: auth.customerProfileId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(isDefault !== undefined ? { isDefault: Boolean(isDefault) } : {}),
        ...(otherUpdates.label ? { label: String(otherUpdates.label).trim() } : {}),
        ...(otherUpdates.recipientName ? { recipientName: String(otherUpdates.recipientName).trim() } : {}),
        ...(otherUpdates.phone ? { phone: String(otherUpdates.phone).trim() } : {}),
        ...(otherUpdates.division ? { division: String(otherUpdates.division).trim() } : {}),
        ...(otherUpdates.district ? { district: String(otherUpdates.district).trim() } : {}),
        ...(otherUpdates.upazila ? { upazila: String(otherUpdates.upazila).trim() } : {}),
        ...(otherUpdates.area ? { area: String(otherUpdates.area).trim() } : {}),
        ...(otherUpdates.addressLine ? { addressLine: String(otherUpdates.addressLine).trim() } : {}),
        ...(otherUpdates.landmark !== undefined ? { landmark: otherUpdates.landmark ? String(otherUpdates.landmark).trim() : null } : {}),
      },
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (error: any) {
    console.error('Update address error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await resolveCustomer(req);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Address ID is required' }, { status: 400 });
    }

    const existing = await prisma.address.findFirst({
      where: { id, customerId: auth.customerProfileId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Address not found' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Address removed successfully' });
  } catch (error: any) {
    console.error('Delete address error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete address' }, { status: 500 });
  }
}
