// ============================================
// paint_n_meraki — CUSTOMER SESSION API ROUTE
// Verifies Firebase ID token & sets HTTP-only session cookie
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/lib/firebase-admin';
import { findOrCreateCustomerByFirebase } from '@/lib/services/db-service';
import { setCustomerAuthCookies, sanitizeUser } from '@/lib/auth-session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Firebase ID Token is required' },
        { status: 400 }
      );
    }

    // 1. Verify token securely server-side
    const verifiedUser = await verifyFirebaseIdToken(idToken);
    if (!verifiedUser || !verifiedUser.uid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired Firebase authentication token' },
        { status: 401 }
      );
    }

    // 2. Find or create customer in database
    const customer = await findOrCreateCustomerByFirebase({
      firebaseUid: verifiedUser.uid,
      phoneNumber: verifiedUser.phoneNumber,
      fullName: verifiedUser.name,
      email: verifiedUser.email,
    });

    if (customer.status === 'DISABLED') {
      return NextResponse.json(
        { success: false, error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // 3. Issue secure HTTP-Only JWT cookies
    const safeUser = sanitizeUser(customer);
    const response = NextResponse.json({
      success: true,
      user: safeUser,
    });

    await setCustomerAuthCookies(response, customer);

    return response;
  } catch (error: any) {
    console.error('Authentication session error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
