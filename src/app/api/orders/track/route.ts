import { NextResponse } from 'next/server';
import { getOrderByIdOrNumber } from '@/lib/services/db-service';
import { getCurrentCustomerSession } from '@/lib/auth-session';
import { getAdminSession } from '@/lib/auth/admin-auth';

function maskName(name?: string): string {
  if (!name) return 'Customer';
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => (p.length <= 1 ? p : `${p[0]}${'*'.repeat(Math.min(p.length - 1, 4))}`))
    .join(' ');
}

function maskPhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '******';
  return `******${digits.slice(-4)}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber') || searchParams.get('order') || searchParams.get('id');
    const mobile = searchParams.get('mobile');

    if (!orderNumber || !orderNumber.trim()) {
      return NextResponse.json(
        { success: false, error: 'Order number is required' },
        { status: 400 }
      );
    }

    const cleanOrderNumber = orderNumber.trim();
    const order = await getOrderByIdOrNumber(cleanOrderNumber);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // 1. Check if caller is Admin
    const admin = await getAdminSession();
    if (admin && admin.role !== 'CUSTOMER') {
      return NextResponse.json({ success: true, order });
    }

    // 2. Check if caller is the authenticated Customer who owns this order
    const customer = await getCurrentCustomerSession();
    const customerMobile = (customer?.mobile || '').replace(/\D/g, '').slice(-10);
    const orderMobile = (order.customer?.mobile || '').replace(/\D/g, '').slice(-10);

    const isOrderOwner = Boolean(
      customer &&
      ((order.userId && order.userId === customer.id) ||
       (customerMobile && orderMobile && customerMobile === orderMobile))
    );

    if (isOrderOwner) {
      return NextResponse.json({ success: true, order });
    }

    // 3. Unauthenticated / Guest tracking: MUST provide matching mobile number
    if (!mobile || !mobile.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter your registered 10-digit mobile number to track this order' },
        { status: 400 }
      );
    }

    const inputMobileClean = mobile.replace(/\D/g, '').slice(-10);
    if (!inputMobileClean || inputMobileClean !== orderMobile) {
      return NextResponse.json(
        { success: false, error: 'Order not found or mobile number does not match records' },
        { status: 404 }
      );
    }

    // Sanitize guest order payload to prevent leaking personal PII
    const guestSafeOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      courierName: order.courierName,
      trackingNumber: order.trackingNumber,
      subtotal: order.subtotal,
      shippingCharge: order.shippingCharge,
      total: order.total,
      createdAt: order.createdAt,
      customer: {
        fullName: maskName(order.customer?.fullName),
        mobile: maskPhone(order.customer?.mobile),
      },
      shippingAddress: {
        city: order.shippingAddress?.city,
        state: order.shippingAddress?.state,
        pincode: order.shippingAddress?.pincode,
      },
      items: (order.items || []).map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize,
        product: {
          id: item.product?.id,
          name: item.product?.name,
          thumbnail: item.product?.thumbnail,
          slug: item.product?.slug,
        },
      })),
    };

    return NextResponse.json({
      success: true,
      order: guestSafeOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to track order' },
      { status: 500 }
    );
  }
}
