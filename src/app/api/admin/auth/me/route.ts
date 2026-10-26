import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';

export async function GET() {
  const session = await getAdminSession();
  
  if (!session) {
    return NextResponse.json(
      { authenticated: false, error: 'Unauthenticated. No active admin session found.' },
      { status: 401 }
    );
  }

  if (session.role === 'CUSTOMER') {
    return NextResponse.json(
      { authenticated: false, error: 'Forbidden. Customer accounts cannot access the admin panel.' },
      { status: 403 }
    );
  }

  return NextResponse.json({ authenticated: true, user: session });
}
