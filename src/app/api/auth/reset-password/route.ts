import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  getUserByEmail,
  verifyAndConsumeResetToken,
  updateUserPassword,
} from '@/lib/services/db-service';
import { hashToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { clearCustomerAuthCookies } from '@/lib/auth-session';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anon';
    const body = await req.json();
    const token = body.token;
    const password = body.password || body.newPassword;
    const confirmPassword = body.confirmPassword;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { success: false, error: 'Password reset token is required' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Rate limit: 10 attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(`reset_${ip}`, 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many password reset attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    // 1. Hash received raw token
    const tokenHash = hashToken(token.trim());

    // 2. Verify token existence, expiration, and consume single use
    const consumption = await verifyAndConsumeResetToken(tokenHash);

    if (!consumption.valid || !consumption.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'This password reset link has expired or has already been used. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // 3. Find user account
    const user = await getUserByEmail(consumption.email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    // 4. Hash new password securely with bcrypt
    const newPasswordHash = await bcrypt.hash(password, 10);
    await updateUserPassword(user.id, newPasswordHash);

    // 5. Build response and invalidate existing sessions/cookies
    const response = NextResponse.json({
      success: true,
      message: 'Your password has been updated successfully.',
    });

    clearCustomerAuthCookies(response);

    return response;
  } catch (error: any) {
    console.error('Reset password exception:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
