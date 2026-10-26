// ============================================
// paint_n_meraki — CURRENT USER SESSION API
// Returns authenticated customer data or null
// ============================================

import { NextResponse } from 'next/server';
import { getCurrentCustomerSession } from '@/lib/auth-session';

export async function GET() {
  try {
    const user = await getCurrentCustomerSession();
    if (!user) {
      return NextResponse.json({ success: true, user: null });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role || 'CUSTOMER',
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, user: null, error: err.message });
  }
}
