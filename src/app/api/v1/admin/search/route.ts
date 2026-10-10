import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const [
      products,
      orders,
      customers,
      technicians,
      bookings,
      digitalLeads,
      erpLeads,
      supportTickets,
      emiAccounts,
    ] = await Promise.all([
      // Products
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, name: true, sku: true, price: true, isActive: true },
      }),

      // Orders
      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { customer: { user: { name: { contains: q, mode: "insensitive" } } } },
            { customer: { user: { phone: { contains: q, mode: "insensitive" } } } },
          ],
        },
        take: 5,
        include: { customer: { include: { user: true } } },
      }),

      // Customers
      prisma.customerProfile.findMany({
        where: {
          OR: [
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { phone: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        },
        take: 5,
        include: { user: true },
      }),

      // Technicians
      prisma.technicianProfile.findMany({
        where: {
          OR: [
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { phone: { contains: q, mode: "insensitive" } } },
            { serviceAreas: { contains: q, mode: "insensitive" } },
            { skills: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        include: { user: true },
      }),

      // Bookings / Service Jobs
      prisma.booking.findMany({
        where: {
          OR: [
            { bookingNumber: { contains: q, mode: "insensitive" } },
            { problemDescription: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        include: { service: true, customer: { include: { user: true } } },
      }),

      // Digital Solution Leads
      prisma.digitalSolutionLead.findMany({
        where: {
          OR: [
            { businessName: { contains: q, mode: "insensitive" } },
            { contactPerson: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: { id: true, businessName: true, contactPerson: true, phone: true, status: true },
      }),

      // ERP Leads
      prisma.erpLead.findMany({
        where: {
          OR: [
            { businessName: { contains: q, mode: "insensitive" } },
            { contactPerson: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: { id: true, businessName: true, contactPerson: true, phone: true, status: true },
      }),

      // Support Tickets
      prisma.supportTicket.findMany({
        where: {
          OR: [
            { ticketNumber: { contains: q, mode: "insensitive" } },
            { subject: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: { id: true, ticketNumber: true, subject: true, status: true, priority: true },
      }),

      // EMI Accounts
      prisma.emiAccount.findMany({
        where: {
          accountNumber: { contains: q, mode: "insensitive" },
        },
        take: 4,
        include: { product: true },
      }),
    ]);

    const results = [
      ...products.map((p: any) => ({
        type: "Product",
        title: p.name,
        subtitle: `SKU: ${p.sku} • ৳${p.price.toLocaleString()} ${!p.isActive ? "(Archived)" : ""}`,
        link: `/admin/products?search=${encodeURIComponent(p.sku)}`,
        badgeColor: "bg-blue-100 text-blue-800",
      })),
      ...orders.map((o: any) => ({
        type: "Order",
        title: `Order #${o.orderNumber}`,
        subtitle: `${o.customer?.user?.name || "Customer"} • ৳${o.totalAmount.toLocaleString()} • ${o.status}`,
        link: `/admin/orders?search=${encodeURIComponent(o.orderNumber)}`,
        badgeColor: "bg-purple-100 text-purple-800",
      })),
      ...customers.map((c: any) => ({
        type: "Customer",
        title: c.user?.name || "Customer Profile",
        subtitle: `${c.user?.phone || c.user?.email} • Status: ${c.user?.status}`,
        link: `/admin/customers?search=${encodeURIComponent(c.user?.phone || c.user?.email || "")}`,
        badgeColor: "bg-emerald-100 text-emerald-800",
      })),
      ...technicians.map((t: any) => ({
        type: "Electrician",
        title: t.user?.name || "Technician",
        subtitle: `${t.user?.phone || ""} • ${t.serviceAreas} • ★ ${(t.ratingOverall || 5.0).toFixed(1)} ${t.verificationStatus === "VERIFIED" ? "• Verified" : ""}`,
        link: `/admin/technicians?search=${encodeURIComponent(t.user?.phone || t.user?.name || "")}`,
        badgeColor: "bg-amber-100 text-amber-800",
      })),
      ...bookings.map((b: any) => ({
        type: "Service Job",
        title: `Job #${b.bookingNumber}`,
        subtitle: `${b.service?.name} • ${b.status} • ৳${b.totalAmount.toLocaleString()}`,
        link: `/admin/jobs?search=${encodeURIComponent(b.bookingNumber)}`,
        badgeColor: "bg-sky-100 text-sky-800",
      })),
      ...digitalLeads.map((dl: any) => ({
        type: "Digital Lead",
        title: dl.businessName,
        subtitle: `${dl.contactPerson} (${dl.phone}) • ${dl.status}`,
        link: `/admin/digital-solutions?search=${encodeURIComponent(dl.phone)}`,
        badgeColor: "bg-indigo-100 text-indigo-800",
      })),
      ...erpLeads.map((el: any) => ({
        type: "ERP Lead",
        title: el.businessName,
        subtitle: `${el.contactPerson} (${el.phone}) • ${el.status}`,
        link: `/admin/erp-leads?search=${encodeURIComponent(el.phone)}`,
        badgeColor: "bg-violet-100 text-violet-800",
      })),
      ...supportTickets.map((st: any) => ({
        type: "Support Ticket",
        title: `Ticket #${st.ticketNumber}: ${st.subject}`,
        subtitle: `Priority: ${st.priority} • Status: ${st.status}`,
        link: `/admin/support?search=${encodeURIComponent(st.ticketNumber)}`,
        badgeColor: "bg-rose-100 text-rose-800",
      })),
      ...emiAccounts.map((ea: any) => ({
        type: "EMI Agreement",
        title: `EMI #${ea.accountNumber}`,
        subtitle: `${ea.product?.name} • Total: ৳${ea.totalPrice.toLocaleString()} • ${ea.status}`,
        link: `/admin/emi?search=${encodeURIComponent(ea.accountNumber)}`,
        badgeColor: "bg-orange-100 text-orange-800",
      })),
    ];

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Global search error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
