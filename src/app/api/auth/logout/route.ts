// ============================================
// paint_n_meraki — CUSTOMER LOGOUT API
// Clears session cookie
// ============================================

import { NextResponse } from 'next/server';
import { clearCustomerAuthCookies } from '@/lib/auth-session';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  clearCustomerAuthCookies(response);
  return response;
}

