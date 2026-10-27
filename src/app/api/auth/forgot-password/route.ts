import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmail, savePasswordResetToken } from '@/lib/services/db-service';
import { hashToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/services/email-service';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anon';
    const body = await req.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      // Return generic message even on malformed format if desired, but 400 with helpful format message is standard
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
    }

    // Rate limit: 5 requests per 10 minutes per IP/email combo
    const rateLimit = checkRateLimit(`forgot_${ip}_${cleanEmail}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many password reset requests. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const user = await getUserByEmail(cleanEmail);
    let resetToken = '';

    if (user && user.status !== 'DISABLED') {
      // 1. Generate cryptographically secure random token (32 bytes / 64 hex chars)
      resetToken = crypto.randomBytes(32).toString('hex');
      
      // 2. Hash token for database storage
      const tokenHash = hashToken(resetToken);
      const expiresInMinutes = 60;
      const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

      // 3. Save hashed token in database
      await savePasswordResetToken(cleanEmail, tokenHash, expiresAt, user.id);

      // 4. Construct Public Reset Link
      const hostOrigin = req.headers.get('origin') || req.nextUrl.origin || 'https://paintnmeraki.vercel.app';
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || hostOrigin;
      const resetUrl = `${baseUrl.replace(/\/$/, '')}/account/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

      // 5. Send Branded Password Reset Email
      await sendPasswordResetEmail({
        to: cleanEmail,
        customerName: user.fullName || 'Valued Customer',
        resetUrl,
        expiresInMinutes,
      });
    }

    // Generic response to prevent user enumeration
    const responsePayload: { success: boolean; message: string; devResetToken?: string; devResetUrl?: string } = {
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.',
    };

    // Include dev helpers in non-production environments for testing convenience
    if (process.env.NODE_ENV !== 'production' && resetToken) {
      responsePayload.devResetToken = resetToken;
      responsePayload.devResetUrl = `/account/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Forgot password exception:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
