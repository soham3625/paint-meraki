import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, getUserByMobile, createCustomerWithEmail } from '@/lib/services/db-service';
import { setCustomerAuthCookies, sanitizeUser } from '@/lib/auth-session';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anon';
    const rateLimit = checkRateLimit(`register_${ip}`, 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many registration attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { fullName, email, password, confirmPassword, mobile } = body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is required' }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, error: 'Email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 });
    }

    // Check if email already exists
    const existingByEmail = await getUserByEmail(cleanEmail);
    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    // Check mobile if provided
    let cleanMobile = '';
    if (mobile && mobile.trim()) {
      cleanMobile = mobile.replace(/\D/g, '').slice(-10);
      if (cleanMobile.length === 10) {
        const existingByMobile = await getUserByMobile(cleanMobile);
        if (existingByMobile) {
          return NextResponse.json(
            { success: false, error: 'An account with this mobile number already exists.' },
            { status: 400 }
          );
        }
      }
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in database
    const newUser = await createCustomerWithEmail({
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash,
      mobile: cleanMobile || undefined,
    });

    const safeUser = sanitizeUser(newUser);

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Account created successfully',
    });

    // Set secure HttpOnly cookies
    await setCustomerAuthCookies(response, newUser);

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
