'use client';

// ============================================
// paint_n_meraki — ADMIN CUSTOM ORDERS
// Bespoke Resin Art Project Management
// ============================================

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Search,
  MessageCircle,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit,
  X,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { formatPrice } from '@/lib/data/products';
import toast from 'react-hot-toast';
import type { CustomOrderRequest, CustomOrderStatus } from '@/types';

export default function AdminCustomOrdersPage() {
  const [customOrders, setCustomOrders] = useState<CustomOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal / Drawer state for editing
  const [selectedOrder, setSelectedOrder] = useState<CustomOrderRequest | null>(null);
  const [quotationAmount, setQuotationAmount] = useState<number | ''>('');
  const [newStatus, setNewStatus] = useState<CustomOrderStatus>('NEW');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchCustomOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/custom-orders');
      if (res.ok) setCustomOrders(await res.json());
    } catch (e) {
      toast.error('Failed to load custom orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = [...customOrders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.productType.toLowerCase().includes(q) ||
          c.whatsappNumber.includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [customOrders, searchQuery, statusFilter]);

  const handleOpenEdit = (co: CustomOrderRequest) => {
    setSelectedOrder(co);
    setNewStatus(co.status);
    setQuotationAmount(co.quotationAmount || '');
    setAdminNotes(co.adminNotes || '');
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/custom-orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          quotationAmount: quotationAmount ? Number(quotationAmount) : null,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Custom order updated');
        setSelectedOrder(null);
        fetchCustomOrders();
      } else {
        toast.error(data.error || 'Failed to update custom order');
      }
    } catch (err) {
      toast.error('Error saving custom order');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: CustomOrderStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONTACTED':
      case 'DESIGNING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'QUOTE_SENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'APPROVED':
      case 'IN_PRODUCTION':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            Custom Orders & Commissions
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Manage bespoke resin art requests, customer photo references, quotations, and studio production.
          </p>
        </div>
        <button
          onClick={fetchCustomOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#EAE3D6] bg-white hover:bg-stone-50 text-xs font-semibold text-charcoal transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE3D6] shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-taupe absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search custom orders by customer name, product type, mobile..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium focus:outline-hidden focus:border-[#D4AF37]"
        >
          <option value="all">All Request Statuses</option>
          <option value="NEW">New Requests</option>
          <option value="CONTACTED">Customer Contacted</option>
          <option value="DESIGNING">Designing</option>
          <option value="QUOTE_SENT">Quote Sent</option>
          <option value="APPROVED">Approved by Customer</option>
          <option value="IN_PRODUCTION">In Studio Production</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Custom Orders Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-taupe text-sm">Loading custom orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center space-y-2 bg-white rounded-2xl border border-[#EAE3D6]">
          <Sparkles className="w-8 h-8 text-taupe mx-auto opacity-50" />
          <p className="font-serif text-base font-bold text-charcoal">No custom order requests found</p>
          <p className="text-xs text-taupe">New submissions from /custom-order will automatically appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOrders.map((co) => {
            const cleanPhone = co.whatsappNumber.replace(/\D/g, '');
            const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
              `Hello ${co.customerName}! We have reviewed your custom request for ${co.productType} on paint_n_meraki.`
            )}`;

            return (
              <div
                key={co.id}
                className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-5 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Status & Date */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(co.status)}`}>
                      {co.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-taupe">
                      {new Date(co.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="font-serif text-base font-bold text-charcoal">{co.customerName}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-taupe mt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#D4AF37]" />
                        {co.whatsappNumber}
                      </span>
                      {co.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#D4AF37]" />
                          {co.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Custom Specs */}
                  <div className="bg-[#F8F5EE] p-3 rounded-xl space-y-1.5 text-xs">
                    <p className="font-semibold text-charcoal">
                      Type: <span className="text-[#9B7B1B]">{co.productType}</span>
                    </p>
                    {co.preferredSize && (
                      <p className="text-stone-600">
                        Size: <span className="font-medium text-charcoal">{co.preferredSize}</span>
                      </p>
                    )}
                    {co.preferredColors && (
                      <p className="text-stone-600">
                        Colors: <span className="font-medium text-charcoal">{co.preferredColors}</span>
                      </p>
                    )}
                    {co.budget && (
                      <p className="text-stone-600">
                        Budget: <span className="font-medium text-charcoal">{co.budget}</span>
                      </p>
                    )}
                    {co.quotationAmount && (
                      <p className="text-emerald-700 font-bold">
                        Quoted: {formatPrice(co.quotationAmount)}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {co.description}
                  </p>

                  {/* Reference Image Preview */}
                  {co.referenceImageUrl && (
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-bold text-taupe block mb-1">
                        Attached Reference:
                      </span>
                      <div
                        onClick={() => setLightboxImage(co.referenceImageUrl || null)}
                        className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-[#EAE3D6] cursor-pointer group"
                      >
                        <Image
                          src={co.referenceImageUrl}
                          alt="Reference"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px]">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {co.adminNotes && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <span className="font-bold block text-[10px] uppercase">Internal Note:</span>
                      {co.adminNotes}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#EAE3D6] gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                  <button
                    onClick={() => handleOpenEdit(co)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#2A241F] hover:bg-black text-white text-xs font-semibold transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Manage Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE3D6] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal">
                  Manage Custom Project
                </h3>
                <p className="text-xs text-taupe">{selectedOrder.customerName} &bull; {selectedOrder.productType}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-taupe hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Workflow Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as CustomOrderStatus)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-bold text-charcoal"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Customer Contacted</option>
                  <option value="DESIGNING">Designing Mockups</option>
                  <option value="QUOTE_SENT">Quote Sent</option>
                  <option value="APPROVED">Approved & Advance Received</option>
                  <option value="IN_PRODUCTION">In Studio Production</option>
                  <option value="COMPLETED">Completed & Dispatched</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Quotation Amount (₹)
                </label>
                <input
                  type="number"
                  value={quotationAmount}
                  onChange={(e) => setQuotationAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 4500"
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-bold text-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Admin Internal Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record customer preferences, color mix specifications, advance payment UTR..."
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EAE3D6] font-semibold text-charcoal hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox for reference image */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] w-full h-full rounded-2xl overflow-hidden">
            <Image
              src={lightboxImage}
              alt="Reference"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
