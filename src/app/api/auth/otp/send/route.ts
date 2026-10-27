import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  hashEmailOtp,
  checkEmailOtpCooldown,
  saveEmailOtpRecord,
  deleteEmailOtpRecord,
  getUserByEmail,
} from '@/lib/services/db-service';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendOtpEmail } from '@/lib/services/email-service';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anon';
    const body = await req.json();
    const { email, action = 'LOGIN', fullName } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Rate Limiting: Max 5 send attempts per 15 minutes per IP + email
    const emailRateLimit = checkRateLimit(`otp_send_${ip}_${cleanEmail}`, 5, 15 * 60 * 1000);
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many verification requests for this email. Please wait ${emailRateLimit.retryAfterSeconds} seconds before requesting another code.`,
          retryAfterSeconds: emailRateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Global IP Rate Limiting: Max 20 requests per 15 minutes to prevent IP spraying
    const ipRateLimit = checkRateLimit(`otp_send_ip_${ip}`, 20, 15 * 60 * 1000);
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many requests from this network. Please wait ${ipRateLimit.retryAfterSeconds} seconds.`,
          retryAfterSeconds: ipRateLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 3. Resend Cooldown Check (60 seconds)
    const cooldown = await checkEmailOtpCooldown(cleanEmail);
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${cooldown.retryAfterSeconds} seconds before requesting a new code.`,
          retryAfterSeconds: cooldown.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 4. Check if account is disabled
    const existingUser = await getUserByEmail(cleanEmail);
    if (existingUser && existingUser.status === 'DISABLED') {
      return NextResponse.json(
        {
          success: false,
          error: 'This account has been deactivated. Please contact Paint Meraki customer support.',
        },
        { status: 403 }
      );
    }

    // 5. Generate cryptographically secure 6-digit OTP (100000 - 999999)
    const otp = crypto.randomInt(100000, 1000000).toString();

    // 6. Compute HMAC-SHA256 hash with server secret
    const otpHash = hashEmailOtp(otp, cleanEmail);
    const expiresInMinutes = 10;
    const cooldownSeconds = 60;

    // 7. Store ONLY the hash on server (never plaintext)
    const record = await saveEmailOtpRecord({
      email: cleanEmail,
      otpHash,
      expiresInMinutes,
      cooldownSeconds,
      action,
      maxAttempts: 5,
    });

    // Determine greeting name
    const greetingName = fullName?.trim() || existingUser?.fullName || 'Valued Customer';

    // 8. Dispatch time-limited OTP email via Resend integration
    const emailResult = await sendOtpEmail({
      to: cleanEmail,
      otp,
      customerName: greetingName,
      expiresInMinutes,
      action: action?.toLowerCase() === 'register' ? 'register' : 'login',
    });

    // 9. Handle delivery failure explicitly - never falsely report success
    if (!emailResult.success) {
      // Invalidate the record so user can retry without being locked out by cooldown
      await deleteEmailOtpRecord(record.id);

      const errorMessage = emailResult.error || 'Failed to deliver verification code. Please check the email address or try again.';
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 502 }
      );
    }

    // 10. Return success response (never expose raw OTP or verification secrets)
    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please enter it below.`,
      cooldownSeconds,
      expiresInMinutes,
    });
  } catch (error: any) {
    console.error('[POST /api/auth/otp/send] Unexpected exception:', error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while sending the verification code. Please try again.',
      },
      { status: 500 }
    );
  }
}
