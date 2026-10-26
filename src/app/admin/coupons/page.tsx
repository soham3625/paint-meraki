'use client';

// ============================================
// paint_n_meraki — ADMIN DISCOUNTS & COUPONS
// ============================================

import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Percent,
  X,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice } from '@/lib/data/products';
import toast from 'react-hot-toast';
import type { Coupon, DiscountType } from '@/types';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number | ''>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>(999);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) setCoupons(await res.json());
    } catch (e) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(10);
    setMinOrderAmount(999);
    setMaxDiscount('');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDescription(c.description || '');
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrderAmount(c.minOrderAmount);
    setMaxDiscount(c.maxDiscount || '');
    setIsActive(c.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return toast.error('Coupon code is required');
    if (!discountValue) return toast.error('Discount value is required');

    setSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCoupon?.id,
          code: code.trim().toUpperCase(),
          description,
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          isActive,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created');
        setModalOpen(false);
        fetchCoupons();
      } else {
        toast.error(data.error || 'Failed to save coupon');
      }
    } catch (err) {
      toast.error('Error saving coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Coupon deleted');
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#D4AF37]" />
            Discounts & Coupons
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Create promotional coupon codes for cart checkout discounts.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-xs shadow-md shadow-gold/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-taupe text-sm">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Tag className="w-8 h-8 text-taupe mx-auto opacity-50" />
            <p className="font-serif text-base font-bold text-charcoal">No discount coupons found</p>
            <p className="text-xs text-taupe">Create promo codes to offer seasonal offers to your customers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F5EE] border-b border-[#EAE3D6] text-taupe uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4 font-semibold">Code</th>
                  <th className="py-3 px-4 font-semibold">Discount</th>
                  <th className="py-3 px-4 font-semibold">Min Order</th>
                  <th className="py-3 px-4 font-semibold">Max Cap</th>
                  <th className="py-3 px-4 font-semibold">Times Used</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FDFBF7] transition-colors">
                    {/* Code & Description */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-sm text-[#9B7B1B] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block">
                        {c.code}
                      </span>
                      {c.description && (
                        <p className="text-[11px] text-taupe mt-1 max-w-xs">{c.description}</p>
                      )}
                    </td>

                    {/* Discount Value */}
                    <td className="py-3.5 px-4 font-bold text-charcoal">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% Off`
                        : `Flat ${formatPrice(c.discountValue)} Off`}
                    </td>

                    {/* Min Order */}
                    <td className="py-3.5 px-4 text-stone-600">
                      {c.minOrderAmount > 0 ? formatPrice(c.minOrderAmount) : 'None'}
                    </td>

                    {/* Max Cap */}
                    <td className="py-3.5 px-4 text-stone-600">
                      {c.maxDiscount ? formatPrice(c.maxDiscount) : 'No Cap'}
                    </td>

                    {/* Times Used */}
                    <td className="py-3.5 px-4 font-semibold text-charcoal">
                      {c.usedCount || 0} times
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE3D6] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
              <h3 className="font-serif text-lg font-bold text-charcoal">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon Code'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-taupe hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MERAKI10"
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-mono font-bold text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 10% off on first resin order"
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-medium text-charcoal"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value ? Number(e.target.value) : '')}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-bold text-charcoal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-charcoal">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span>Active & Ready for Checkout</span>
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EAE3D6] font-semibold text-charcoal hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
