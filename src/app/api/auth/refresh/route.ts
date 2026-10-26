import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyRefreshToken } from '@/lib/jwt';
import { getUserById } from '@/lib/services/db-service';
import {
  REFRESH_TOKEN_COOKIE,
  setCustomerAuthCookies,
  clearCustomerAuthCookies,
  sanitizeUser,
} from '@/lib/auth-session';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload || !payload.sub) {
      const response = NextResponse.json(
        { success: false, error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
      clearCustomerAuthCookies(response);
      return response;
    }

    const user = await getUserById(payload.sub);
    if (!user || user.status === 'DISABLED') {
      const response = NextResponse.json(
        { success: false, error: 'User not found or disabled' },
        { status: 403 }
      );
      clearCustomerAuthCookies(response);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      user: sanitizeUser(user),
    });

    // Rotate tokens
    await setCustomerAuthCookies(response, user);

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Token refresh failed' },
      { status: 500 }
    );
  }
}
