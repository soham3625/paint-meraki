import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAndConsumeEmailOtpRecord,
  findOrCreateCustomerByEmail,
  getUserByEmail,
} from '@/lib/services/db-service';
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit';
import { setCustomerAuthCookies, sanitizeUser } from '@/lib/auth-session';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anon';
    const body = await req.json();
    const { email, otp, fullName, mobile, action } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter the complete 6-digit verification code.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // 1. Rate limiting on verify attempts: Max 10 attempts per 15 minutes per IP + email
    const verifyLimitKey = `otp_verify_${ip}_${cleanEmail}`;
    const rateLimit = checkRateLimit(verifyLimitKey, 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many verification attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Cryptographic Server-side Verification & Consumption
    const verifyResult = await verifyAndConsumeEmailOtpRecord(cleanEmail, cleanOtp, action);

    if (!verifyResult.success) {
      let statusCode = 400;
      if (verifyResult.code === 'INVALID_CODE') {
        statusCode = 401;
      } else if (verifyResult.code === 'MAX_ATTEMPTS') {
        statusCode = 429;
      } else if (verifyResult.code === 'NOT_FOUND') {
        statusCode = 404;
      }

      return NextResponse.json(
        {
          success: false,
          error: verifyResult.error || 'Verification failed. Please check the code and try again.',
          code: verifyResult.code,
          remainingAttempts: verifyResult.remainingAttempts,
        },
        { status: statusCode }
      );
    }

    // 3. Clear rate limit counters on success
    clearRateLimit(verifyLimitKey);
    clearRateLimit(`otp_send_${ip}_${cleanEmail}`);

    // 4. Find or Create Customer
    const user = await findOrCreateCustomerByEmail({
      email: cleanEmail,
      fullName,
      mobile,
    });

    if (user.status === 'DISABLED') {
      return NextResponse.json(
        {
          success: false,
          error: 'This account has been deactivated. Please contact Paint Meraki customer support.',
        },
        { status: 403 }
      );
    }

    // 5. Sanitize user data (exclude passwordHash/secrets)
    const safeUser = sanitizeUser(user);

    // 6. Establish verified HTTP-Only JWT session cookies
    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Logged in successfully! Welcome to Paint Meraki ♡',
    });

    await setCustomerAuthCookies(response, user);

    return response;
  } catch (error: any) {
    console.error('[POST /api/auth/otp/verify] Unexpected exception:', error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during verification. Please try again.',
      },
      { status: 500 }
    );
  }
}
