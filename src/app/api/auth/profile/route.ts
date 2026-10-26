// ============================================
// paint_n_meraki — CUSTOMER PROFILE UPDATE API
// Allows logged-in customer to update their name/mobile/email
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomerSession, encodeCustomerSession, CUSTOMER_COOKIE_NAME } from '@/lib/auth-session';
import { updateCustomerProfile } from '@/lib/services/db-service';

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getCurrentCustomerSession();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fullName, email, mobile } = body;

    const updated = await updateCustomerProfile(sessionUser.id, {
      fullName,
      email,
      mobile,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        firebaseUid: updated.firebaseUid,
        fullName: updated.fullName,
        email: updated.email,
        mobile: updated.mobile,
        role: updated.role || 'CUSTOMER',
        createdAt: updated.createdAt,
      },
    });

    // Refresh session cookie with new info
    const sessionToken = await encodeCustomerSession(updated);
    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
