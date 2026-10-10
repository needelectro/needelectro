import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error("Failed to fetch support tickets:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, status, priority, adminReply } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "ticketId is required" }, { status: 400 });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(adminReply !== undefined && { adminReply }),
      },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    console.error("Failed to update support ticket:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
