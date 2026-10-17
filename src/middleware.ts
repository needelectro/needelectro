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

  // 1. Ignore static assets, media, and Next.js internal files
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
  const isSuspended = user && user.status === 'SUSPENDED';
  const isStaff = user && user.status === 'ACTIVE' && STAFF_ROLES.has(user.role);
  const isTechnician = user && user.status === 'ACTIVE' && user.role === 'TECHNICIAN';
  const isCustomer = user && user.status === 'ACTIVE' && user.role === 'CUSTOMER';

  // 2. Suspended User Gate
  if (isSuspended) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended. Please contact NEED ELECTRO administration.' },
        { status: 403 }
      );
    }
    // Allow logout or redirect to suspended message/login
    if (pathname !== '/customer/login' && pathname !== '/technician/login' && pathname !== '/') {
      const suspendedUrl = new URL('/customer/login', request.url);
      suspendedUrl.searchParams.set('error', 'suspended');
      return NextResponse.redirect(suspendedUrl);
    }
  }

  // 3. API Route Level Security & Role Boundary Enforcement
  if (pathname.startsWith('/api/v1/')) {
    // 3a. Admin APIs
    if (pathname.startsWith('/api/v1/admin')) {
      if (!isStaff) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Administrative credentials required.' },
          { status: user ? 403 : 401 }
        );
      }
      return NextResponse.next();
    }

    // 3b. Technician APIs
    if (pathname.startsWith('/api/v1/technicians')) {
      if (!isTechnician && !isStaff) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Only authorized technician accounts can access technician resources.' },
          { status: user ? 403 : 401 }
        );
      }
      return NextResponse.next();
    }

    // 3c. Job Claim API
    if (pathname.includes('/accept')) {
      if (!isTechnician) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Only verified technician accounts can accept jobs.' },
          { status: 403 }
        );
      }
    }

    // 3d. Customer-Only Purchasing & Account APIs: Orders & Delivery Addresses
    if (
      pathname.startsWith('/api/v1/customer') ||
      pathname === '/api/v1/orders' ||
      pathname.startsWith('/api/v1/orders/')
    ) {
      if (isTechnician) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: Technician accounts cannot access customer account data, cart, or purchasing operations.',
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  }

  // 4. Admin Portal Page Route Protection
  if (pathname === '/admin/login') {
    if (isStaff) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

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

  // 5. Technician Portal Page Route Protection (/technician/*)
  const isTechnicianPublic = pathname === '/technician/login' || pathname === '/technician/register';
  if (pathname.startsWith('/technician')) {
    // If technician is already authenticated and visits login/register, redirect to dashboard
    if (isTechnicianPublic && isTechnician) {
      return NextResponse.redirect(new URL('/technician/dashboard', request.url));
    }

    // If it's a protected technician route (/technician/dashboard, /technician/jobs, etc.)
    if (!isTechnicianPublic) {
      if (isCustomer) {
        // Customer attempting to access technician portal -> redirect to Customer Dashboard
        return NextResponse.redirect(new URL('/customer/dashboard', request.url));
      }
      if (!user) {
        // Unauthenticated visitor -> redirect to technician login
        const loginUrl = new URL('/technician/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  }

  // 6. Strict Customer Portal Protection & Technician Restriction
  // Customer-only pages that technicians MUST NEVER access:
  const isCustomerOnlyPage =
    pathname.startsWith('/customer') ||
    pathname === '/account' ||
    pathname.startsWith('/account/') ||
    pathname === '/cart' ||
    pathname.startsWith('/cart/') ||
    pathname === '/checkout' ||
    pathname.startsWith('/checkout/') ||
    pathname === '/orders' ||
    pathname.startsWith('/orders/');

  // STRICT TECHNICIAN CONFINEMENT:
  // When logged in as a technician, ANY non-technician page (home, shop, services, bookings, customer accounts, etc.)
  // is strictly forbidden — redirect immediately to technician dashboard.
  if (isTechnician) {
    if (!pathname.startsWith('/technician') && !pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/technician/dashboard', request.url));
    }
  }

  if (isCustomerOnlyPage) {
    // A technician visiting ANY customer page is immediately redirected to Technician Dashboard
    if (isTechnician) {
      return NextResponse.redirect(new URL('/technician/dashboard', request.url));
    }

    // Unauthenticated handling for protected customer account & checkout pages
    const isCustomerPublic = pathname === '/customer/login' || pathname === '/customer/register' || pathname === '/cart' || pathname === '/orders';
    if (!isCustomerPublic && !user) {
      const loginUrl = new URL('/customer/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If customer is already authenticated and visits customer login/register
    if (user && (pathname === '/customer/login' || pathname === '/customer/register')) {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
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
