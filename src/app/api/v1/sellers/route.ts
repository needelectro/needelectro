import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateRequest, requireAdminAuth, recordAuditLog } from '@/lib/apiAuth';

export async function GET(req: NextRequest) {
  try {
    const session = authenticateRequest(req);
    const isStaff = session && session.role !== 'CUSTOMER' && session.role !== 'TECHNICIAN';

    if (isStaff) {
      // Staff view: all sellers with internal admin details
      const sellers = await prisma.sellerProfile.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, sellers });
    }

    // Public view: only verified merchants with public business info
    const sellers = await prisma.sellerProfile.findMany({
      where: { status: 'VERIFIED' },
      select: {
        id: true,
        businessName: true,
        slug: true,
        contactPerson: true,
        address: true,
        productCategories: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, sellers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, tradeLicenseNumber, contactPerson, phone, email, address, productCategories, bankAccountDetails } = body;

    if (!businessName || !tradeLicenseNumber || !contactPerson || !phone || !email) {
      return NextResponse.json({ error: 'Please provide all mandatory business and contact details.' }, { status: 400 });
    }

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);

    const existing = await prisma.sellerProfile.findFirst({
      where: {
        OR: [{ email }, { tradeLicenseNumber }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'A merchant profile with this email or Trade License already exists.' }, { status: 400 });
    }

    const seller = await prisma.sellerProfile.create({
      data: {
        businessName,
        slug,
        tradeLicenseNumber,
        contactPerson,
        phone,
        email,
        address: address || 'Moulvibazar, Bangladesh',
        productCategories: productCategories || 'Laptops, CCTV, Electrical Equipment',
        bankAccountDetails: bankAccountDetails || null,
        commissionRate: 8.0,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Seller application submitted successfully! Our compliance team will review your Trade License and contact you within 24-48 hours.',
      sellerId: seller.id,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register seller application' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireAdminAuth(req, 'products:write');
    if (!auth.authorized) return auth.response!;

    const body = await req.json();
    const { sellerId, status, adminNotes } = body;

    if (!sellerId || !status) {
      return NextResponse.json({ error: 'Seller ID and status required' }, { status: 400 });
    }

    const previousSeller = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
    });

    if (!previousSeller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });
    }

    const updated = await prisma.sellerProfile.update({
      where: { id: sellerId },
      data: {
        status,
        adminNotes: adminNotes !== undefined ? adminNotes : previousSeller.adminNotes,
      },
    });

    await recordAuditLog({
      userId: auth.session?.id,
      userRole: auth.session?.role,
      action: 'UPDATE_SELLER_STATUS',
      entity: 'SellerProfile',
      entityId: sellerId,
      previousData: { status: previousSeller.status, adminNotes: previousSeller.adminNotes },
      newData: { status: updated.status, adminNotes: updated.adminNotes },
    });

    return NextResponse.json({ success: true, seller: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update merchant status' }, { status: 500 });
  }
}
