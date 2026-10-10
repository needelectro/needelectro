import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface TicketMessage {
  id: string;
  sender: "CUSTOMER" | "ADMIN" | "INTERNAL_NOTE";
  senderName: string;
  message: string;
  createdAt: string;
}

export function parseTicketConversation(raw: string | null): TicketMessage[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [
    {
      id: "legacy-reply",
      sender: "ADMIN",
      senderName: "NEED ELECTRO Support",
      message: raw,
      createdAt: new Date().toISOString(),
    },
  ];
}

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

    const enriched = tickets.map((t: any) => ({
      ...t,
      conversation: parseTicketConversation(t.adminReply),
    }));

    return NextResponse.json({ success: true, tickets: enriched });
  } catch (error: any) {
    console.error("Failed to fetch support tickets:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, status, priority, adminReply, isInternalNote = false, authorName } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "ticketId is required" }, { status: 400 });
    }

    const currentTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });

    if (!currentTicket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    let updatedAdminReply = currentTicket.adminReply;

    if (adminReply && adminReply.trim()) {
      const messages = parseTicketConversation(currentTicket.adminReply);
      const newMsg: TicketMessage = {
        id: `msg-${Date.now()}`,
        sender: isInternalNote ? "INTERNAL_NOTE" : "ADMIN",
        senderName: authorName || "NEED ELECTRO Support Team",
        message: adminReply.trim(),
        createdAt: new Date().toISOString(),
      };
      messages.push(newMsg);
      updatedAdminReply = JSON.stringify(messages);

      // If official customer reply, send customer notification
      if (!isInternalNote && currentTicket.userId) {
        try {
          await prisma.notification.create({
            data: {
              userId: currentTicket.userId,
              title: `Support Response: Ticket #${currentTicket.ticketNumber}`,
              message: `NEED ELECTRO Support replied: "${adminReply.trim().slice(0, 100)}..."`,
              type: "SUPPORT",
              link: "/account/support",
            },
          });
        } catch (notifErr) {
          console.warn("Could not dispatch customer notification:", notifErr);
        }
      }
    }

    const nextStatus = status || (adminReply && !isInternalNote ? "WAITING_CUSTOMER" : currentTicket.status);

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: nextStatus,
        ...(priority && { priority }),
        ...(updatedAdminReply !== undefined && { adminReply: updatedAdminReply }),
      },
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
    });

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: isInternalNote ? "TICKET_INTERNAL_NOTE_ADDED" : "TICKET_RESPONSE_SENT",
          entity: "SupportTicket",
          entityId: ticketId,
          newData: JSON.stringify({
            status: nextStatus,
            priority: priority || currentTicket.priority,
            hasNewMessage: Boolean(adminReply),
            isInternalNote,
            authorName,
          }),
        },
      });
    } catch (auditErr) {}

    return NextResponse.json({
      success: true,
      ticket: {
        ...updated,
        conversation: parseTicketConversation(updated.adminReply),
      },
    });
  } catch (error: any) {
    console.error("Failed to update support ticket:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subject, message, category = "TECHNICAL", priority = "NORMAL" } = body;

    if (!userId || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "userId, subject, and message are required" },
        { status: 400 }
      );
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT${dateStr}${randomSuffix}`;

    const newTicket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        category,
        subject,
        message,
        priority,
        status: "OPEN",
      },
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
    });

    // Notify customer
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: `Support Ticket Created: #${ticketNumber}`,
          message: `Our engineering team has opened ticket #${ticketNumber} regarding "${subject}".`,
          type: "SUPPORT",
          link: "/account/support",
        },
      });
    } catch (e) {}

    return NextResponse.json({ success: true, ticket: newTicket });
  } catch (error: any) {
    console.error("Failed to create ticket on behalf of user:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
