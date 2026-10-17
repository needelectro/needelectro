import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { comparePassword, hashPassword, signToken } from '@/lib/auth';
import { UserRole, UserStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.identifier || body.email || body.phone || '').trim();
    const password = body.password;
    const expectedRole = body.expectedRole || body.role; // Optional: 'CUSTOMER' | 'TECHNICIAN'

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Please enter your email or phone number, and password.' },
        { status: 400 }
      );
    }

    const cleanLower = identifier.toLowerCase();

    // Support login by either email or phone number
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanLower },
          { phone: identifier },
        ],
      },
      include: {
        customerProfile: true,
        technicianProfile: true,
      },
    });

    const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@needelectro.com').toLowerCase();
    const envAdminPhone = process.env.ADMIN_PHONE || '01733983752';
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const envAdminName = process.env.ADMIN_NAME || 'Super Admin';

    // Auto-create or self-heal admin from .env if not yet in database
    if (!user && (cleanLower === envAdminEmail || identifier === envAdminPhone)) {
      if (password === envAdminPassword) {
        const passwordHash = await hashPassword(envAdminPassword);
        user = await prisma.user.upsert({
          where: { email: envAdminEmail },
          update: {
            name: envAdminName,
            phone: envAdminPhone,
            passwordHash,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
          },
          create: {
            name: envAdminName,
            email: envAdminEmail,
            phone: envAdminPhone,
            passwordHash,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
          },
          include: {
            customerProfile: true,
            technicianProfile: true,
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email or phone number.' },
        { status: 401 }
      );
    }

    let isMatch = await comparePassword(password, user.passwordHash);
    // If password in .env was updated and differs from DB hash, auto-sync and allow login
    if (!isMatch && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && password === envAdminPassword) {
      isMatch = true;
      const newHash = await hashPassword(envAdminPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Incorrect password. Please verify and try again.' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact NEED ELECTRO support at 01733-983752.' },
        { status: 403 }
      );
    }

    // Role verification if specific portal expected
    if (expectedRole === 'TECHNICIAN') {
      if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          {
            error: 'This account is registered as a Customer. Please sign in via the Customer Portal.',
            redirectUrl: '/customer/login',
          },
          { status: 403 }
        );
      }
    }

    if (expectedRole === 'ADMIN') {
      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          {
            error: 'Access denied. Administrator privileges required.',
            redirectUrl: '/admin/login',
          },
          { status: 403 }
        );
      }
    }

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
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Determine validated and role-safe destination
    const requestedRedirect = body.redirect || body.redirectUrl;
    let safeRedirect = '/customer/dashboard';

    if (user.role === 'TECHNICIAN') {
      safeRedirect = '/technician/dashboard';
      if (
        requestedRedirect &&
        typeof requestedRedirect === 'string' &&
        requestedRedirect.startsWith('/technician/') &&
        !requestedRedirect.startsWith('/technician/login') &&
        !requestedRedirect.startsWith('/technician/register') &&
        !requestedRedirect.includes('//')
      ) {
        safeRedirect = requestedRedirect;
      }
    } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      safeRedirect = '/admin/dashboard';
      if (
        requestedRedirect &&
        typeof requestedRedirect === 'string' &&
        requestedRedirect.startsWith('/admin') &&
        !requestedRedirect.includes('//')
      ) {
        safeRedirect = requestedRedirect;
      }
    } else {
      // Customer
      safeRedirect = '/customer/dashboard';
      if (
        requestedRedirect &&
        typeof requestedRedirect === 'string' &&
        !requestedRedirect.startsWith('/technician') &&
        !requestedRedirect.startsWith('/admin') &&
        !requestedRedirect.includes('//') &&
        requestedRedirect.startsWith('/')
      ) {
        safeRedirect = requestedRedirect;
      }
    }

    return NextResponse.json({
      success: true,
      user: sessionData,
      redirectUrl: safeRedirect,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication error. Please try again.' },
      { status: 500 }
    );
  }
}
