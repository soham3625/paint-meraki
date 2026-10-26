import { NextResponse } from 'next/server';
import { getCurrentCustomerSession } from '@/lib/auth-session';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { getCustomerInvoiceData, getAdminInvoiceData } from '@/lib/services/invoice-service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const invoiceType = (searchParams.get('type') || 'customer').toLowerCase();

    const adminSession = await getAdminSession();
    const isAdmin = Boolean(adminSession && adminSession.role !== 'CUSTOMER');

    // If requesting ADMIN invoice
    if (invoiceType === 'admin') {
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Admin access required for internal invoice.' },
          { status: 403 }
        );
      }

      const result = await getAdminInvoiceData(id, adminSession);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: result.status || 400 });
      }

      return NextResponse.json({ success: true, type: 'admin', invoice: result.data });
    }

    // Default: CUSTOMER DELIVERY INVOICE
    const customerSession = await getCurrentCustomerSession();

    // Verify access
    const result = await getCustomerInvoiceData(id, customerSession, isAdmin);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      type: 'customer',
      invoice: result.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
