import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { verifySessionPayload } from '@/lib/auth-secret';

const ADMIN_COOKIE_NAME = 'paint_meraki_admin_session';

interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  expiresAt: number;
}

async function decodeSessionToken(token: string): Promise<AdminSessionPayload | null> {
  return verifySessionPayload<AdminSessionPayload>(token);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPageRoute = pathname.startsWith('/admin');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  // 1. Handle Admin Login Page (/admin/login)
  if (pathname === '/admin/login') {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = token ? await decodeSessionToken(token) : null;

    // If user already has an active valid admin/staff session, redirect directly into /admin
    if (session && (session.role === 'ADMIN' || session.role === 'SUPERADMIN' || session.role === 'STAFF')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 2. Allow public login API endpoint
  if (pathname === '/api/admin/auth/login') {
    return NextResponse.next();
  }

  // 3. Protect Admin Web UI Routes (/admin, /admin/*)
  if (isAdminPageRoute) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = token ? await decodeSessionToken(token) : null;

    // If not authenticated or customer role, redirect immediately to login
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN' && session.role !== 'STAFF')) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based restrictions for Staff role on Superadmin-only modules
    const isSuperadminOnlyPage =
      pathname.startsWith('/admin/settings') ||
      pathname.startsWith('/admin/admin-users') ||
      pathname.startsWith('/admin/activity-logs');

    if (isSuperadminOnlyPage && session.role === 'STAFF') {
      const dashboardUrl = new URL('/admin', request.url);
      dashboardUrl.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  }

  // 4. Protect Admin API Routes (/api/admin/*)
  if (isAdminApiRoute) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = token ? await decodeSessionToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Administrative session required.' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN' && session.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Access restricted to authorized staff and administrators.' },
        { status: 403 }
      );
    }

    // Protect Superadmin-only API routes
    const isSuperadminOnlyApi =
      pathname.startsWith('/api/admin/settings') ||
      pathname.startsWith('/api/admin/users') ||
      pathname.startsWith('/api/admin/activity-logs');

    if (isSuperadminOnlyApi && session.role === 'STAFF') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Superadmin privileges required for this action.' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
