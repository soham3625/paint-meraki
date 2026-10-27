'use client';

// ============================================
// paint_n_meraki — ADMIN PAYMENTS & SHIPPING
// ============================================

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CreditCard,
  Truck,
  Upload,
  Save,
  ShieldCheck,
  QrCode,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { BusinessSettings } from '@/types';

export default function AdminPaymentsShippingPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [upiId, setUpiId] = useState('');
  const [upiQrCode, setUpiQrCode] = useState('');
  const [codEnabled, setCodEnabled] = useState(true);
  const [codFee, setCodFee] = useState<number>(0);
  const [codMinOrder, setCodMinOrder] = useState<number>(0);
  const [codMaxOrder, setCodMaxOrder] = useState<number>(10000);
  const [shippingCharge, setShippingCharge] = useState<number>(99);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(2000);
  const [processingTime, setProcessingTime] = useState('5-7 business days');
  const [deliveryTime, setDeliveryTime] = useState('3-5 business days');

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: BusinessSettings) => {
        setSettings(data);
        setUpiId(data.upiId || 'paintmeraki@upi');
        setUpiQrCode(data.upiQrCode || '');
        setCodEnabled(data.codEnabled ?? true);
        setCodFee(data.codFee || 0);
        setCodMinOrder(data.codMinOrder || 0);
        setCodMaxOrder(data.codMaxOrder || 10000);
        setShippingCharge(typeof data.shippingCharge === 'number' ? data.shippingCharge : 99);
        setFreeShippingThreshold(typeof data.freeShippingThreshold === 'number' ? data.freeShippingThreshold : 2000);
        setProcessingTime(data.processingTime || '5-7 business days');
        setDeliveryTime(data.deliveryTime || '3-5 business days');
      })
      .catch(() => toast.error('Failed to load payment settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setUpiQrCode(data.url);
        toast.success('UPI QR Code uploaded');
      }
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upiId,
          upiQrCode,
          codEnabled,
          codFee: Number(codFee),
          codMinOrder: Number(codMinOrder),
          codMaxOrder: Number(codMaxOrder),
          shippingCharge: Number(shippingCharge),
          freeShippingThreshold: Number(freeShippingThreshold),
          processingTime,
          deliveryTime,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Payment & Shipping settings updated!');
        if (data.warning) {
          toast(data.warning, { icon: '⚠️' });
        }
      } else {
        toast.error(data?.error || 'Failed to save settings');
      }
    } catch (e: any) {
      toast.error('Error saving settings: ' + (e?.message || 'Network error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-taupe text-sm">Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D6] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#D4AF37]" />
            Payments & Shipping Configuration
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Configure UPI payment handles, QR code, COD limits, and dynamic shipping calculation.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-xs shadow-md shadow-gold/20 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. UPI Payment Settings */}
        <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
            <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#D4AF37]" />
              UPI Payments (Instant QR + UTR)
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Active
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Merchant UPI ID *
            </label>
            <input
              type="text"
              required
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="paintmeraki@upi"
              className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-mono font-bold text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
            />
            <p className="text-[11px] text-taupe mt-1">
              Customers will see this UPI ID and QR code during checkout.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Custom UPI QR Code Image
            </label>
            <div className="flex items-center gap-3">
              {upiQrCode && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-[#EAE3D6] shrink-0">
                  <Image src={upiQrCode} alt="QR Code" fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={upiQrCode}
                  onChange={(e) => setUpiQrCode(e.target.value)}
                  placeholder="Paste QR Code URL or upload..."
                  className="flex-1 px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
                <label className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[#9B7B1B] hover:bg-amber-100 cursor-pointer flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Cash on Delivery (COD) Settings */}
        <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
            <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-[#D4AF37]" />
              Cash on Delivery (COD) Rules
            </h3>
            <label className="flex items-center gap-2 text-xs font-semibold text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span>Enable COD</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                COD Extra Fee (₹)
              </label>
              <input
                type="number"
                value={codFee}
                onChange={(e) => setCodFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-bold text-charcoal"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Min Order (₹)
              </label>
              <input
                type="number"
                value={codMinOrder}
                onChange={(e) => setCodMinOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Max Order (₹)
              </label>
              <input
                type="number"
                value={codMaxOrder}
                onChange={(e) => setCodMaxOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
              />
            </div>
          </div>
        </div>

        {/* 3. Delivery & Shipping Thresholds */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            Shipping Rates & Free Delivery Threshold
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Standard Shipping Charge (₹)
              </label>
              <input
                type="number"
                value={shippingCharge}
                onChange={(e) => setShippingCharge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl font-bold text-charcoal"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Free Shipping Above (₹)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Handcrafting Time
              </label>
              <input
                type="text"
                value={processingTime}
                onChange={(e) => setProcessingTime(e.target.value)}
                placeholder="5-7 business days"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-charcoal"
              />
            </div>

            <div>
              <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Transit Delivery Time
              </label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="3-5 business days"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-charcoal"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
