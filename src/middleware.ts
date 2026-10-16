import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const STAFF_ROLES = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'OPERATIONS_MANAGER',
  'INVENTORY_MANAGER',
  'SALES_MANAGER',
  'ACCOUNTANT',
  'SERVICE_MANAGER',
  'TECHNICIAN_MANAGER',
  'SUPPORT_AGENT',
  'CONTENT_MANAGER',
]);

/**
 * Cryptographically verifies HS256 JWT in Edge Runtime using Web Crypto API
 */
async function verifyJwtInEdge(token: string): Promise<any> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;
    const secret = process.env.JWT_SECRET || 'need_electro_default_secret_key_2026';

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // base64url decode signature
    const signatureStr = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const signaturePad = signatureStr.padEnd(signatureStr.length + (4 - (signatureStr.length % 4)) % 4, '=');
    const binarySig = atob(signaturePad);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const data = enc.encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, data);
    if (!isValid) return null;

    // decode payload
    const payloadStr = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const payloadPad = payloadStr.padEnd(payloadStr.length + (4 - (payloadStr.length % 4)) % 4, '=');
    const jsonPayload = decodeURIComponent(
      atob(payloadPad)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);

    // Expiration check
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, icons, brand images, and Next.js internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/brand') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('need_electro_token')?.value;
  const user = token ? await verifyJwtInEdge(token) : null;
  const isStaff = user && user.status === 'ACTIVE' && STAFF_ROLES.has(user.role);

  // 1. Admin login route handling
  if (pathname === '/admin/login') {
    if (isStaff) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    if (!isStaff) {
      const loginUrl = new URL('/admin/login', request.url);
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
