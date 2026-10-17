import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, comparePassword, hashPassword } from '@/lib/auth';
import prisma from '@/lib/db';

async function resolveSessionUser(req: NextRequest) {
  let token: string | undefined;

  // 1. Try Cookie
  try {
    const cookieStore = await cookies();
    token = cookieStore.get('need_electro_token')?.value;
  } catch {
    // Ignore error if cookies cannot be accessed
  }

  // 2. Try Bearer header
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    include: {
      customerProfile: {
        include: {
          addresses: {
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
          },
        },
      },
      technicianProfile: true,
    },
  });

  if (!user || user.status === 'SUSPENDED') return null;

  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await resolveSessionUser(req);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        customerProfileId: user.customerProfile?.id ?? null,
        technicianProfileId: user.technicianProfile?.id ?? null,
        customerProfile: user.customerProfile
          ? {
              id: user.customerProfile.id,
              alternativePhone: user.customerProfile.alternativePhone,
              addresses: user.customerProfile.addresses,
              createdAt: user.customerProfile.createdAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await resolveSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      phone,
      alternativePhone,
      avatarUrl,
      currentPassword,
      newPassword,
    } = body;

    const userUpdates: Record<string, any> = {};

    // 1. Validate & update Name
    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (cleanName.length < 2) {
        return NextResponse.json(
          { success: false, error: 'Name must be at least 2 characters long.' },
          { status: 400 }
        );
      }
      userUpdates.name = cleanName;
    }

    // 2. Validate & update Phone
    if (phone !== undefined) {
      const cleanPhone = phone ? String(phone).trim() : null;
      if (cleanPhone && cleanPhone !== user.phone) {
        // Check uniqueness across other users
        const existingPhone = await prisma.user.findFirst({
          where: {
            phone: cleanPhone,
            id: { not: user.id },
          },
        });
        if (existingPhone) {
          return NextResponse.json(
            { success: false, error: 'This phone number is already registered to another account.' },
            { status: 400 }
          );
        }
      }
      userUpdates.phone = cleanPhone;
    }

    // 3. Update Avatar URL
    if (avatarUrl !== undefined) {
      userUpdates.avatarUrl = avatarUrl ? String(avatarUrl).trim() : null;
    }

    // 4. Handle Password Change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Please enter your current password to set a new password.' },
          { status: 400 }
        );
      }

      const isCurrentValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect.' },
          { status: 400 }
        );
      }

      if (String(newPassword).length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      userUpdates.passwordHash = await hashPassword(String(newPassword));
    }

    // Execute user table update if any fields changed
    let updatedUser = user;
    if (Object.keys(userUpdates).length > 0) {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: userUpdates,
        include: {
          customerProfile: {
            include: {
              addresses: {
                orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
              },
            },
          },
          technicianProfile: true,
        },
      });
    }

    // 5. Update or Create CustomerProfile for alternativePhone
    if (alternativePhone !== undefined) {
      const cleanAltPhone = alternativePhone ? String(alternativePhone).trim() : null;
      const updatedCp = await prisma.customerProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          alternativePhone: cleanAltPhone,
        },
        update: {
          alternativePhone: cleanAltPhone,
        },
        include: {
          addresses: {
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
          },
        },
      });

      // Attach updated customer profile to result
      (updatedUser as any).customerProfile = updatedCp;
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        status: updatedUser.status,
        avatarUrl: updatedUser.avatarUrl,
        createdAt: updatedUser.createdAt,
        customerProfileId: updatedUser.customerProfile?.id ?? null,
        technicianProfileId: updatedUser.technicianProfile?.id ?? null,
        customerProfile: updatedUser.customerProfile
          ? {
              id: updatedUser.customerProfile.id,
              alternativePhone: updatedUser.customerProfile.alternativePhone,
              addresses: updatedUser.customerProfile.addresses,
              createdAt: updatedUser.customerProfile.createdAt,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
