import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { hasPermission, isStaffOrAdmin, AdminPermission } from '@/lib/permissions';
import { UserSession } from '@/types';
import prisma from '@/lib/db';

export interface AuthResult {
  authorized: boolean;
  session?: UserSession;
  response?: NextResponse;
}

/**
 * Authenticates any request via either HTTP cookie or Bearer header
 */
export function authenticateRequest(req: NextRequest): UserSession | null {
  // 1. Try cookie
  const cookieToken = req.cookies.get('need_electro_token')?.value;
  if (cookieToken) {
    const session = verifyToken(cookieToken);
    if (session && session.status === 'ACTIVE') return session;
  }

  // 2. Try Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    const session = verifyToken(bearerToken);
    if (session && session.status === 'ACTIVE') return session;
  }

  return null;
}

/**
 * Enforces admin / staff role and optional granular permission check.
 * Rejects unauthorized requests immediately with standard 401 or 403 status.
 */
export function requireAdminAuth(
  req: NextRequest,
  permission?: AdminPermission
): AuthResult {
  const session = authenticateRequest(req);

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      ),
    };
  }

  if (!isStaffOrAdmin(session)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden. Administrative credentials required.' },
        { status: 403 }
      ),
    };
  }

  if (permission && !hasPermission(session, permission)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Forbidden. Missing required administrative permission: ${permission}`,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, session };
}

/**
 * Server-side audit log helper for administrative actions
 */
export async function recordAuditLog(params: {
  userId?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  previousData?: any;
  newData?: any;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userRole: params.userRole || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        previousData: params.previousData ? JSON.stringify(params.previousData) : null,
        newData: params.newData ? JSON.stringify(params.newData) : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (err) {
    console.error('Audit log creation failed:', err);
  }
}
