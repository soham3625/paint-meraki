// ============================================
// paint_n_meraki — UNIFIED CUSTOMER SESSION MANAGER
// Secure HTTP-Only Cookie Session with JWT & Firebase Integration
// ============================================

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { User } from '@/types';
import { getUserById, getUserByEmail } from '@/lib/services/db-service';
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  JWTPayload,
} from '@/lib/jwt';

export const CUSTOMER_COOKIE_NAME = 'paint_meraki_customer_session';
export const ACCESS_TOKEN_COOKIE = 'paint_meraki_access_token';
export const REFRESH_TOKEN_COOKIE = 'paint_meraki_refresh_token';

export interface CustomerSessionPayload {
  id: string;
  firebaseUid?: string;
  mobile?: string;
  fullName: string;
  email?: string;
  role: string;
  expiresAt: number;
}

import { signSessionPayload, verifySessionPayload } from '@/lib/auth-secret';

/**
 * Cryptographically signed customer session encoding
 */
export async function encodeCustomerSession(user: User, daysValid = 30): Promise<string> {
  const expiresAt = Date.now() + daysValid * 24 * 60 * 60 * 1000;
  const payload: CustomerSessionPayload = {
    id: user.id,
    firebaseUid: user.firebaseUid,
    mobile: user.mobile,
    fullName: user.fullName,
    email: user.email,
    role: user.role || 'CUSTOMER',
    expiresAt,
  };

  return signSessionPayload(payload);
}

/**
 * Cryptographically verified customer session decoding
 */
export async function decodeCustomerSession(token: string): Promise<CustomerSessionPayload | null> {
  return verifySessionPayload<CustomerSessionPayload>(token);
}

/**
 * Sets secure HTTP-Only JWT cookies on a NextResponse
 */
export async function setCustomerAuthCookies(response: NextResponse, user: User): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Short-lived Access Token (15 minutes)
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role || 'CUSTOMER',
    email: user.email,
    mobile: user.mobile,
  }, 15 * 60);

  // 2. Long-lived Refresh Token (30 days)
  const refreshToken = signRefreshToken({
    sub: user.id,
  }, 30 * 24 * 60 * 60);

  // 3. Fallback compatibility session
  const legacySession = await encodeCustomerSession(user, 30);

  // Set Access Token Cookie
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 mins
  });

  // Set Refresh Token Cookie
  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: refreshToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  // Set unified session cookie
  response.cookies.set({
    name: CUSTOMER_COOKIE_NAME,
    value: legacySession,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}

/**
 * Clears all customer session cookies
 */
export function clearCustomerAuthCookies(response: NextResponse): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set({ name: ACCESS_TOKEN_COOKIE, ...cookieOptions });
  response.cookies.set({ name: REFRESH_TOKEN_COOKIE, ...cookieOptions });
  response.cookies.set({ name: CUSTOMER_COOKIE_NAME, ...cookieOptions });
}

/**
 * Retrieves the currently authenticated customer from Server Cookies
 * Validates JWT access token, refresh token, or legacy session.
 */
export async function getCurrentCustomerSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();

    // 1. Try JWT Access Token
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      if (payload && payload.sub) {
        const user = await getUserById(payload.sub);
        if (user && user.status !== 'DISABLED') {
          return sanitizeUser(user);
        }
      }
    }

    // 2. Try JWT Refresh Token if access token expired
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
    if (refreshToken) {
      const refreshPayload = verifyRefreshToken(refreshToken);
      if (refreshPayload && refreshPayload.sub) {
        const user = await getUserById(refreshPayload.sub);
        if (user && user.status !== 'DISABLED') {
          return sanitizeUser(user);
        }
      }
    }

    // 3. Fallback to unified session cookie
    const legacyToken = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
    if (legacyToken) {
      const payload = await decodeCustomerSession(legacyToken);
      if (payload && payload.id) {
        const user = await getUserById(payload.id);
        if (user && user.status !== 'DISABLED') {
          return sanitizeUser(user);
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Strip passwordHash and sensitive credentials from User object
 */
export function sanitizeUser(user: User): User {
  const { passwordHash, ...safeUser } = user;
  return safeUser as User;
}
