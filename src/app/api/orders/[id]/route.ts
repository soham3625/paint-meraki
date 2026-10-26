import { NextResponse } from 'next/server';
import { getOrderByIdOrNumber } from '@/lib/services/db-service';
import { getCurrentCustomerSession } from '@/lib/auth-session';
import { getAdminSession } from '@/lib/auth/admin-auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const order = await getOrderByIdOrNumber(id.trim());
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Authorization Guard: Check if requester is Admin
    const adminSession = await getAdminSession();
    const isAdmin = Boolean(adminSession && adminSession.role !== 'CUSTOMER');

    if (!isAdmin) {
      // Requester must be the authenticated customer who owns this order
      const customer = await getCurrentCustomerSession();
      if (!customer) {
        return NextResponse.json(
          { success: false, error: 'Authentication required to view order details' },
          { status: 401 }
        );
      }

      const customerMobile = (customer.mobile || '').replace(/\D/g, '').slice(-10);
      const orderMobile = (order.customer?.mobile || '').replace(/\D/g, '').slice(-10);

      const ownsOrder =
        (order.userId && order.userId === customer.id) ||
        (customerMobile && orderMobile && customerMobile === orderMobile) ||
        (customer.email && order.customer?.email && customer.email.toLowerCase() === order.customer.email.toLowerCase());

      if (!ownsOrder) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
