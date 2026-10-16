import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = 'digital', // 'digital' | 'erp'
      businessName,
      contactPerson,
      phone,
      email,
      serviceType = 'WEB_DEV',
      projectScope,
      estimatedBudget,
      preferredTimeline,
      industry,
      branchCount,
      userCount,
      requiredFeatures,
    } = body;

    if (!contactPerson || !phone) {
      return NextResponse.json(
        { success: false, error: 'Contact person and mobile phone number are required.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email ? email.trim() : `${cleanPhone}@inquiry.needelectro.store`;
    const cleanBusiness = businessName?.trim() || contactPerson.trim();

    if (type === 'erp') {
      const leadNumber = `ERP${Date.now().toString().slice(-6)}`;
      const erpLead = await prisma.erpLead.create({
        data: {
          leadNumber,
          businessName: cleanBusiness,
          contactPerson: contactPerson.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          industry: industry || 'RETAIL',
          branchCount: Number(branchCount) || 1,
          userCount: Number(userCount) || 3,
          requiredFeatures: Array.isArray(requiredFeatures)
            ? requiredFeatures.join(', ')
            : (requiredFeatures || projectScope || 'Multi-branch POS, Stock & Accounting'),
          status: 'NEW',
          salesNotes: projectScope ? `Customer notes: ${projectScope}` : null,
        },
      });

      // Notify admin
      const adminUsers = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true },
      });

      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: `New ERP Lead: ${cleanBusiness}`,
            message: `${contactPerson} requested an ERP demo for ${cleanBusiness} (${cleanPhone}).`,
            type: 'SYSTEM',
            link: '/admin/erp-leads',
          },
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        leadNumber: erpLead.leadNumber,
        message: 'Your NEED ELECTRO ERP inquiry has been received. Our solutions team will contact you within 2 business hours.',
      });
    } else {
      const leadNumber = `DSL${Date.now().toString().slice(-6)}`;
      const digitalLead = await prisma.digitalSolutionLead.create({
        data: {
          leadNumber,
          businessName: cleanBusiness,
          contactPerson: contactPerson.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          serviceType: serviceType || 'WEB_DEV',
          projectScope: projectScope?.trim() || 'Software & Digital Solution Inquiry',
          estimatedBudget: estimatedBudget ? Number(estimatedBudget) : null,
          preferredTimeline: preferredTimeline || 'Flexible',
          status: 'NEW',
        },
      });

      // Notify admin
      const adminUsers = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true },
      });

      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: `New Software Lead: ${serviceType}`,
            message: `${contactPerson} (${cleanBusiness}) submitted inquiry ${leadNumber}.`,
            type: 'SYSTEM',
            link: '/admin/digital-solutions',
          },
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        leadNumber: digitalLead.leadNumber,
        message: 'Your software project inquiry has been received. Our architecture team will prepare a quotation and contact you promptly.',
      });
    }
  } catch (error: any) {
    console.error('Public lead creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record your inquiry. Please call our hotline directly at 01733 983752.' },
      { status: 500 }
    );
  }
}
