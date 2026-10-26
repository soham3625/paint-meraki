// ============================================
// paint_n_meraki — JWT AUTHENTICATION ENGINE
// Standard HMAC SHA-256 JWT with Access & Refresh Token Rotation
// ============================================

import crypto from 'crypto';

import { getAuthSecret } from '@/lib/auth-secret';

function getAccessSecret(): string {
  return getAuthSecret();
}

function getRefreshSecret(): string {
  const custom = process.env.JWT_REFRESH_SECRET;
  if (custom && custom.trim().length >= 16) {
    return custom.trim();
  }
  return crypto.createHmac('sha256', getAuthSecret()).update('jwt_refresh_token_derivation_salt_2026').digest('hex');
}

export interface JWTPayload {
  sub: string; // User ID
  role?: string; // e.g. CUSTOMER
  email?: string;
  mobile?: string;
  iat?: number;
  exp?: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function sign(header: object, payload: object, secret: string): string {
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

function verify(token: string, secret: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const payload: JWTPayload = JSON.parse(base64UrlDecode(encodedPayload));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Sign Short-Lived Access Token (15 minutes)
 */
export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresInSeconds = 15 * 60): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  return sign({ alg: 'HS256', typ: 'JWT' }, fullPayload, getAccessSecret());
}

/**
 * Verify Access Token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  return verify(token, getAccessSecret());
}

/**
 * Sign Long-Lived Refresh Token (30 days)
 */
export function signRefreshToken(payload: { sub: string }, expiresInSeconds = 30 * 24 * 60 * 60): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  return sign({ alg: 'HS256', typ: 'JWT' }, fullPayload, getRefreshSecret());
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  return verify(token, getRefreshSecret());
}

/**
 * Hash token for secure database storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
