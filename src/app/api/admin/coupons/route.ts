import { NextResponse } from 'next/server';
import { getAllCoupons, saveCoupon, deleteCoupon, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const coupons = await getAllCoupons();
    return NextResponse.json(coupons);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const data = await req.json();

    if (!data.code || data.discountValue === undefined) {
      return NextResponse.json({ error: 'Coupon code and discount value are required' }, { status: 400 });
    }

    const saved = await saveCoupon(data);

    await logActivity(session.email, session.name, 'COUPON_SAVED', 'Coupon', `Saved coupon: ${saved.code}`, saved.id);

    return NextResponse.json({ success: true, coupon: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save coupon' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    await deleteCoupon(id);

    await logActivity(session.email, session.name, 'COUPON_DELETED', 'Coupon', `Deleted coupon #${id}`, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete coupon' }, { status: 500 });
  }
}
