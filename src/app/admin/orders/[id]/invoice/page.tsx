'use client';

// ============================================
// paint_n_meraki — ADMIN INVOICE VIEWER & PRINT CENTER
// Route: /admin/orders/[id]/invoice
// View and Print both Admin Invoice and Customer Delivery Invoice
// ============================================

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Package, AlertCircle } from 'lucide-react';
import AdminInternalInvoice from '@/components/invoice/AdminInternalInvoice';
import CustomerDeliveryInvoice from '@/components/invoice/CustomerDeliveryInvoice';
import type { AdminInvoiceData, CustomerInvoiceData } from '@/lib/services/invoice-service';

export default function AdminOrderInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') === 'customer' ? 'customer' : 'admin';

  const [activeTab, setActiveTab] = useState<'admin' | 'customer'>(initialType);
  const [adminInvoice, setAdminInvoice] = useState<AdminInvoiceData | null>(null);
  const [customerInvoice, setCustomerInvoice] = useState<CustomerInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      setError(null);
      try {
        // Fetch both invoices so admin can switch seamlessly
        const [adminRes, custRes] = await Promise.all([
          fetch(`/api/orders/${encodeURIComponent(id)}/invoice?type=admin`, { cache: 'no-store' }),
          fetch(`/api/orders/${encodeURIComponent(id)}/invoice?type=customer`, { cache: 'no-store' }),
        ]);

        if (adminRes.ok) {
          const adminData = await adminRes.json();
          if (adminData.success && adminData.invoice) {
            setAdminInvoice(adminData.invoice);
          }
        }

        if (custRes.ok) {
          const custData = await custRes.json();
          if (custData.success && custData.invoice) {
            setCustomerInvoice(custData.invoice);
          }
        }

        if (!adminRes.ok && !custRes.ok) {
          setError('Failed to load order invoice details');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading invoices');
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37] mx-auto" />
        <p className="font-serif text-sm text-charcoal">Loading invoice documents...</p>
      </div>
    );
  }

  if (error || (!adminInvoice && !customerInvoice)) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <AlertCircle size={40} className="text-amber-600 mx-auto" />
        <h2 className="font-serif text-lg font-bold text-charcoal">Invoice Unavailable</h2>
        <p className="text-xs text-taupe">{error || 'Could not find invoice for this order.'}</p>
        <Link href={`/admin/orders/${id}`} className="btn-primary inline-flex items-center gap-2 text-xs">
          <ArrowLeft size={14} /> Back to Order
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Switcher Tab Header for Admin (Hidden on Print) */}
      <div className="max-w-4xl mx-auto px-4 print:hidden">
        <div className="bg-white rounded-2xl border border-[#EAE3D6] p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/orders/${id}`}
              className="p-2 rounded-xl bg-stone-50 border border-[#EAE3D6] text-charcoal hover:bg-stone-100"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-xs font-bold text-charcoal">Order #{adminInvoice?.orderNumber || id}</p>
              <p className="text-[10px] text-taupe">Select document version to preview or print</p>
            </div>
          </div>

          <div className="flex items-center bg-[#F8F5EE] p-1 rounded-xl border border-[#EAE3D6]">
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-taupe hover:text-charcoal'
              }`}
            >
              Admin / Internal Invoice
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'customer'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-white shadow-xs'
                  : 'text-taupe hover:text-charcoal'
              }`}
            >
              Customer Delivery Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Render Selected View */}
      {activeTab === 'admin' && adminInvoice && (
        <AdminInternalInvoice
          invoice={adminInvoice}
          orderId={id}
          onSwitchToCustomerView={() => setActiveTab('customer')}
        />
      )}

      {activeTab === 'customer' && customerInvoice && (
        <CustomerDeliveryInvoice
          invoice={customerInvoice}
          backUrl={`/admin/orders/${id}`}
          showAdminControls={true}
        />
      )}
    </div>
  );
}
