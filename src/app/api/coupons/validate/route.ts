import { NextResponse } from 'next/server';
import { validateCouponCode } from '@/lib/services/db-service';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Please enter a coupon code' }, { status: 400 });
    }

    const result = await validateCouponCode(code, Number(subtotal) || 0);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ valid: false, message: error.message || 'Validation error' }, { status: 500 });
  }
}
