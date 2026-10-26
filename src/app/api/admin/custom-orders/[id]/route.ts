import { NextResponse } from 'next/server';
import { updateCustomOrderStatus, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const { id } = await params;
    const data = await req.json();

    const updated = await updateCustomOrderStatus(id, data);
    if (!updated) {
      return NextResponse.json({ error: 'Custom order not found' }, { status: 404 });
    }

    await logActivity(
      session.email,
      session.name,
      'CUSTOM_ORDER_UPDATED',
      'CustomOrder',
      `Updated custom order #${id} (${updated.customerName}) status to ${updated.status}`,
      id
    );

    return NextResponse.json({ success: true, customOrder: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update custom order' }, { status: 500 });
  }
}
