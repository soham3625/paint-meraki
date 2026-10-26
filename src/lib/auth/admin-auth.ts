// ============================================
// paint_n_meraki — ADMIN AUTHENTICATION & RBAC
// Secure Password Hashing, Session Verification & Role Authorization
// ============================================

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAllUsers, logActivity } from '@/lib/services/db-service';
import { Role } from '@/types';

export const ADMIN_COOKIE_NAME = 'paint_meraki_admin_session';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: Role | 'SUPERADMIN';
  expiresAt: number;
}

import { signSessionPayload, verifySessionPayload } from '@/lib/auth-secret';

// Cryptographically sign token payload for server session
export async function createToken(session: AdminSession): Promise<string> {
  return signSessionPayload(session);
}

export async function decodeToken(token: string): Promise<AdminSession | null> {
  return verifySessionPayload<AdminSession>(token);
}

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) return false;
  if (plain === hash) return true;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return plain === hash;
  }
}

// Check role helpers
export function isSuperadmin(session: AdminSession | null): boolean {
  if (!session) return false;
  return session.role === 'ADMIN' || (session.role as any) === 'SUPERADMIN';
}

export function isAdmin(session: AdminSession | null): boolean {
  if (!session) return false;
  return session.role === 'ADMIN' || (session.role as any) === 'SUPERADMIN' || session.role === 'STAFF';
}

export function isStaff(session: AdminSession | null): boolean {
  if (!session) return false;
  return session.role === 'STAFF';
}

// Login Admin User
export async function loginAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AdminSession; error?: string; status?: number }> {
  const cleanEmail = email.trim().toLowerCase();
  const users = await getAllUsers();
  const user = users.find((u) => u.email && u.email.toLowerCase() === cleanEmail);

  if (!user || !user.email) {
    return { success: false, error: 'Invalid admin credentials', status: 401 };
  }

  // Reject Customer accounts attempting to sign into Admin Panel
  if (user.role === 'CUSTOMER') {
    return {
      success: false,
      error: 'Access denied. Customer accounts cannot access the admin management console.',
      status: 403,
    };
  }

  if (user.status === 'DISABLED') {
    return {
      success: false,
      error: 'This account has been deactivated. Please contact the system administrator.',
      status: 403,
    };
  }

  const isValid = await verifyPassword(password, user.passwordHash || '');
  if (!isValid) {
    return { success: false, error: 'Invalid email or password', status: 401 };
  }

  const session: AdminSession = {
    id: user.id,
    email: user.email,
    name: user.fullName,
    role: user.role || 'ADMIN',
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days session
  };

  const token = await createToken(session);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  await logActivity(user.email, user.fullName, 'ADMIN_LOGIN', 'Auth', 'Admin logged in successfully', user.id);

  return { success: true, user: session };
}

// Logout Admin
export async function logoutAdmin(): Promise<void> {
  const current = await getAdminSession();
  if (current) {
    await logActivity(current.email, current.name, 'ADMIN_LOGOUT', 'Auth', 'Admin logged out');
  }
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

// Get current Admin Session from server cookies
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;
    return await decodeToken(token);
  } catch {
    return null;
  }
}

// Server-side requirement helpers
export async function requireAdminSession(requiredRole?: 'ADMIN' | 'SUPERADMIN' | 'STAFF'): Promise<AdminSession | null> {
  const session = await getAdminSession();
  if (!session) return null;

  if ((requiredRole === 'ADMIN' || requiredRole === 'SUPERADMIN') && !isSuperadmin(session)) {
    return null;
  }

  if (requiredRole === 'STAFF' && !isAdmin(session)) {
    return null;
  }

  return session;
}

export async function requireSuperadmin(): Promise<AdminSession | null> {
  return requireAdminSession('ADMIN');
}

export async function requireAdmin(): Promise<AdminSession | null> {
  return requireAdminSession('STAFF');
}

// Reusable API authorization guard for Route Handlers
export async function verifyAdminApiAccess(requiredRole: 'SUPERADMIN' | 'ADMIN' | 'STAFF' = 'STAFF'): Promise<
  { session: AdminSession; errorResponse?: never } | { session?: never; errorResponse: NextResponse }
> {
  const session = await getAdminSession();

  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized. Authentication required to access this endpoint.' },
        { status: 401 }
      ),
    };
  }

  if (session.role === 'CUSTOMER') {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden. Customer accounts do not have administrative privileges.' },
        { status: 403 }
      ),
    };
  }

  if ((requiredRole === 'SUPERADMIN' || requiredRole === 'ADMIN') && !isSuperadmin(session)) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden. Superadmin privileges required for this action.' },
        { status: 403 }
      ),
    };
  }

  return { session };
}
