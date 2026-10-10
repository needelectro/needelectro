import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { UserRole, UserStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      role = 'CUSTOMER',
      address,
      area,
      skills,
      experience,
      serviceAreas,
      nidNumber,
      bio,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanPhone = phone ? phone.trim() : null;
    let cleanEmail = email ? email.toLowerCase().trim() : '';

    if (!cleanEmail && cleanPhone) {
      // If user only provided phone, synthesize a unique local auth email
      cleanEmail = `${cleanPhone.replace(/\D/g, '')}@${role.toLowerCase()}.needelectro.com`;
    }

    if (!cleanEmail) {
      return NextResponse.json(
        { error: 'Please provide either a valid email address or phone number.' },
        { status: 400 }
      );
    }

    // Check for existing user by email
    const existingByEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingByEmail) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 400 }
      );
    }

    // Check for existing user by phone if phone is provided
    if (cleanPhone) {
      const existingByPhone = await prisma.user.findFirst({
        where: { phone: cleanPhone },
      });
      if (existingByPhone) {
        return NextResponse.json(
          { error: 'An account with this mobile phone number already exists. Please sign in.' },
          { status: 400 }
        );
      }
    }

    const passwordHash = await hashPassword(password);
    const isTech = role === 'TECHNICIAN';
    const userRole = isTech ? 'TECHNICIAN' : 'CUSTOMER';
    const userStatus = isTech ? 'PENDING' : 'ACTIVE';

    // Parse technician skills
    let formattedSkills = '["General Electrical"]';
    if (Array.isArray(skills) && skills.length > 0) {
      formattedSkills = JSON.stringify(skills);
    } else if (typeof skills === 'string' && skills.trim()) {
      formattedSkills = JSON.stringify(skills.split(',').map((s) => s.trim()).filter(Boolean));
    }

    // Parse technician service areas
    let formattedAreas = 'Moulvibazar Sadar';
    if (Array.isArray(serviceAreas) && serviceAreas.length > 0) {
      formattedAreas = serviceAreas.join(', ');
    } else if (typeof serviceAreas === 'string' && serviceAreas.trim()) {
      formattedAreas = serviceAreas.trim();
    } else if (area) {
      formattedAreas = area;
    }

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: userRole,
        status: userStatus,
        customerProfile:
          userRole === 'CUSTOMER'
            ? {
                create: {
                  alternativePhone: cleanPhone,
                  addresses: address
                    ? {
                        create: {
                          recipientName: cleanName,
                          phone: cleanPhone || '',
                          division: 'Sylhet',
                          district: 'Moulvibazar',
                          upazila: area || 'Moulvibazar Sadar',
                          area: area || 'Moulvibazar Sadar',
                          addressLine: address,
                          isDefault: true,
                        },
                      }
                    : undefined,
                },
              }
            : undefined,
        technicianProfile:
          userRole === 'TECHNICIAN'
            ? {
                create: {
                  bio: bio || `Certified technician specializing in electrical and technical services.`,
                  nidNumber: nidNumber || null,
                  experienceYears: parseInt(String(experience || 1), 10) || 1,
                  skills: formattedSkills,
                  serviceAreas: formattedAreas,
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

    const redirectUrl = isTech ? '/technician/dashboard' : '/customer/dashboard';

    return NextResponse.json({
      success: true,
      user: sessionData,
      redirectUrl,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete registration. Please try again.' },
      { status: 500 }
    );
  }
}
