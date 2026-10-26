import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/lib/services/db-service';
import { setCustomerAuthCookies, sanitizeUser } from '@/lib/auth-session';
import { checkRateLimit, clearRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anon';
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const rateLimitKey = `login_${ip}_${cleanEmail}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 5 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds and try again.`,
        },
        { status: 429 }
      );
    }

    // Find customer by email
    const user = await getUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email or password is incorrect.' },
        { status: 401 }
      );
    }

    // If user registered with phone only and has not set a password yet
    if (!user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error: 'This account was created with Phone OTP. Please log in using your Mobile Number, or use Forgot Password to set a password.',
        },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === 'DISABLED') {
      return NextResponse.json(
        { success: false, error: 'This account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify bcrypt password hash
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Email or password is incorrect.' },
        { status: 401 }
      );
    }

    // Clear rate limit on successful authentication
    clearRateLimit(rateLimitKey);

    const safeUser = sanitizeUser(user);

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Logged in successfully',
    });

    // Set secure HttpOnly JWT cookies
    await setCustomerAuthCookies(response, user);

    return response;
  } catch (error: any) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
