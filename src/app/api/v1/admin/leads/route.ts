import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "digital" | "erp" | null

    let digitalLeads: any[] = [];
    let erpLeads: any[] = [];

    if (!type || type === "digital") {
      digitalLeads = await prisma.digitalSolutionLead.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    if (!type || type === "erp") {
      erpLeads = await prisma.erpLead.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      digitalLeads,
      erpLeads,
    });
  } catch (error: any) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    if (type === "erp") {
      const newLead = await prisma.erpLead.create({
        data: {
          leadNumber: `ERP${Date.now().toString().slice(-6)}`,
          businessName: data.companyName || data.businessName || "Enterprise Client",
          contactPerson: data.contactPerson,
          phone: data.phone,
          email: data.email || "info@client.com",
          industry: data.businessType || data.industry || "RETAIL",
          branchCount: Number(data.numBranches || data.branchCount) || 1,
          userCount: data.numEmployees ? 10 : 5,
          requiredFeatures: Array.isArray(data.modulesInterested)
            ? data.modulesInterested.join(", ")
            : (data.requiredFeatures || "POS, Inventory"),
          status: data.status || "NEW",
          salesNotes: data.notes || data.salesNotes,
        },
      });
      return NextResponse.json({ success: true, lead: newLead });
    } else {
      const newLead = await prisma.digitalSolutionLead.create({
        data: {
          leadNumber: `DSL${Date.now().toString().slice(-6)}`,
          businessName: data.organization || data.businessName || data.clientName || "Corporate Client",
          contactPerson: data.clientName || data.contactPerson,
          phone: data.phone,
          email: data.email || "info@client.com",
          serviceType: data.serviceType || "WEB_DEV",
          projectScope: data.projectScope || "Website & Software Solutions",
          estimatedBudget: data.budget ? Number(data.budget) : (data.estimatedBudget ? Number(data.estimatedBudget) : null),
          preferredTimeline: data.preferredTimeline,
          status: data.status || "NEW",
          assignedTo: data.assignedTo,
          notes: data.notes,
        },
      });
      return NextResponse.json({ success: true, lead: newLead });
    }
  } catch (error: any) {
    console.error("Failed to create lead:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id, status, quotationAmount, notes, demoScheduledAt, demoDate, assignedTo } = body;

    if (!id || !type) {
      return NextResponse.json({ success: false, error: "id and type are required" }, { status: 400 });
    }

    if (type === "erp") {
      const updated = await prisma.erpLead.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(notes !== undefined && { salesNotes: notes }),
          ...((demoScheduledAt !== undefined || demoDate !== undefined) && {
            demoDate: (demoScheduledAt || demoDate) ? new Date(demoScheduledAt || demoDate) : null,
          }),
        },
      });
      return NextResponse.json({ success: true, lead: updated });
    } else {
      const updated = await prisma.digitalSolutionLead.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(quotationAmount !== undefined && { quotationAmount: Number(quotationAmount) }),
          ...(notes !== undefined && { notes }),
          ...(assignedTo !== undefined && { assignedTo }),
        },
      });
      return NextResponse.json({ success: true, lead: updated });
    }
  } catch (error: any) {
    console.error("Failed to update lead:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
