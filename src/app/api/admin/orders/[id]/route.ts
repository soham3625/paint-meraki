import { NextResponse } from 'next/server';
import { getOrderByIdOrNumber, updateOrderStatus, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const order = await getOrderByIdOrNumber(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateOrderStatus(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await logActivity(
      session.email,
      session.name,
      'ORDER_UPDATED',
      'Order',
      `Updated order #${updated.orderNumber} status to ${updated.orderStatus} (Payment: ${updated.paymentStatus})`,
      updated.id
    );

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
