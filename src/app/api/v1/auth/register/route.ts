import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { UserRole, UserStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, role = 'CUSTOMER' } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userRole = role === 'TECHNICIAN' ? 'TECHNICIAN' : 'CUSTOMER';
    const userStatus = role === 'TECHNICIAN' ? 'PENDING' : 'ACTIVE';

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        phone,
        passwordHash,
        role: userRole,
        status: userStatus,
        customerProfile:
          userRole === 'CUSTOMER'
            ? {
                create: {
                  alternativePhone: phone,
                },
              }
            : undefined,
        technicianProfile:
          userRole === 'TECHNICIAN'
            ? {
                create: {
                  skills: JSON.stringify(['General Electrical']),
                  verificationStatus: 'PENDING',
                },
              }
            : undefined,
      },
      include: {
        customerProfile: true,
        technicianProfile: true,
      },
    });

    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as UserRole,
      status: user.status as UserStatus,
      avatarUrl: user.avatarUrl,
      customerProfileId: user.customerProfile?.id ?? null,
      technicianProfileId: user.technicianProfile?.id ?? null,
    };

    const token = signToken(sessionData);

    const cookieStore = await cookies();
    cookieStore.set('need_electro_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: sessionData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account.' },
      { status: 500 }
    );
  }
}
