import { NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth/admin-auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const result = await loginAdmin(email, password);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status || 401 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Authentication error' }, { status: 500 });
  }
}