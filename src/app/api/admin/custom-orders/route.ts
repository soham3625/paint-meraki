import { NextResponse } from 'next/server';
import { getAllCustomOrders } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';

export async function GET() {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const customOrders = await getAllCustomOrders();
    return NextResponse.json(customOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch custom orders' }, { status: 500 });
  }
}
