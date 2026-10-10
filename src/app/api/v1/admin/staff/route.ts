import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { STAFF_ROLES } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const staffMembers = await prisma.user.findMany({
      where: {
        role: {
          in: [
            "SUPER_ADMIN",
            "ADMIN",
            "SERVICE_MANAGER",
            "INVENTORY_MANAGER",
            "ACCOUNTANT",
            "DISPATCHER",
            "SUPPORT_AGENT",
            "BRANCH_OPERATOR",
          ],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, staff: staffMembers, roles: STAFF_ROLES });
  } catch (error: any) {
    console.error("Failed to fetch staff:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, role, password } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role,
        status: "ACTIVE",
        passwordHash,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error("Failed to create staff member:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Failed to update staff:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
