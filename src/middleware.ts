import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, APIs, and Next.js internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/brand') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('need_electro_token')?.value;
  const user = token ? decodeJwtPayload(token) : null;
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

  // 1. If logged in as ADMIN:
  // Admin is strictly restricted to /admin routes.
  // If admin tries to visit any public/customer route, redirect them back to /admin/dashboard
  if (isAdmin) {
    if (!pathname.startsWith('/admin')) {
      const adminUrl = new URL('/admin/dashboard', request.url);
      return NextResponse.redirect(adminUrl);
    }
    return NextResponse.next();
  }

  // 2. If NOT an admin, prevent access to /admin routes
  if (pathname.startsWith('/admin')) {
    const loginUrl = new URL('/customer/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
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
