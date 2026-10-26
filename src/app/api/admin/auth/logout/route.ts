import { NextResponse } from 'next/server';
import { logoutAdmin } from '@/lib/auth/admin-auth';

export async function POST() {
  try {
    await logoutAdmin();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to logout' }, { status: 500 });
  }
}
