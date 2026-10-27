'use client';

// ============================================
// paint_n_meraki — CUSTOMER ORDER INVOICE PAGE
// Route: /account/orders/[orderNumber]/invoice
// Customer-facing, secure, printable
// ============================================

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, ShieldAlert, Lock } from 'lucide-react';
import CustomerDeliveryInvoice from '@/components/invoice/CustomerDeliveryInvoice';
import type { CustomerInvoiceData } from '@/lib/services/invoice-service';

export default function CustomerOrderInvoicePage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const [invoice, setInvoice] = useState<CustomerInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    async function loadInvoice() {
      setLoading(true);
      setError(null);
      setIsUnauthorized(false);

      try {
        const cleanNum = (orderNumber || '').toUpperCase().replace('#', '').trim();
        const res = await fetch(`/api/orders/${encodeURIComponent(cleanNum)}/invoice?type=customer`, { cache: 'no-store' });

        if (res.status === 401 || res.status === 403) {
          setIsUnauthorized(true);
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'You are not authorized to view this customer invoice.');
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Failed to load order invoice.');
          return;
        }

        const data = await res.json();
        if (data.success && data.invoice) {
          setInvoice(data.invoice);
        } else {
          setError(data.error || 'Invoice not found.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching the invoice.');
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-dusty-rose mx-auto" />
          <p className="font-heading text-sm text-charcoal">Loading your handcrafted invoice...</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-beige/30 p-8 shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Lock size={22} />
          </div>
          <h2 className="font-heading text-xl font-semibold text-charcoal">Authorization Required</h2>
          <p className="text-sm text-taupe">
            {error || 'You do not have permission to view this customer invoice.'}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/account/orders" className="btn-primary w-full justify-center text-xs">
              <ArrowLeft size={14} /> Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-beige/30 p-8 shadow-card text-center space-y-4">
          <Package size={40} className="text-taupe/40 mx-auto" />
          <h2 className="font-heading text-xl font-semibold text-charcoal">Invoice Not Found</h2>
          <p className="text-sm text-taupe">{error || `We could not locate the invoice for order #${orderNumber}.`}</p>
          <Link href="/account/orders" className="btn-primary inline-flex items-center gap-2 text-xs">
            <ArrowLeft size={14} /> Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CustomerDeliveryInvoice
      invoice={invoice}
      backUrl={`/account/orders/${orderNumber}`}
      showAdminControls={false}
    />
  );
}
