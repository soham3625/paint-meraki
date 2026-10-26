'use client';

// ============================================
// paint_n_meraki — ADMIN ORDER DETAILS
// UPI Verification, Fulfillment & Invoicing
// ============================================

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
  Printer,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Package,
  MapPin,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '@/lib/data/products';
import toast from 'react-hot-toast';
import type { Order, OrderStatus, PaymentStatus } from '@/types';

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form updates
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('PROCESSING');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('CONFIRMED');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [notes, setNotes] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (res.ok) {
        const data: Order = await res.json();
        setOrder(data);
        setOrderStatus(data.orderStatus);
        setPaymentStatus(data.paymentStatus);
        setTrackingNumber(data.trackingNumber || '');
        setCourierName(data.courierName || '');
        setNotes(data.notes || '');
      } else {
        toast.error('Order not found');
      }
    } catch (e) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdate = async (newOrderStatus?: OrderStatus, newPaymentStatus?: PaymentStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newOrderStatus || orderStatus,
          paymentStatus: newPaymentStatus || paymentStatus,
          trackingNumber,
          courierName,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Order updated successfully');
        setOrder(data.order);
        if (newOrderStatus) setOrderStatus(newOrderStatus);
        if (newPaymentStatus) setPaymentStatus(newPaymentStatus);
      } else {
        toast.error(data.error || 'Failed to update order');
      }
    } catch (err) {
      toast.error('Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  // Verify UPI Payment
  const handleVerifyPayment = async () => {
    await handleUpdate('CONFIRMED', 'CONFIRMED');
    toast.success('Payment verified & order confirmed!');
  };

  if (loading) {
    return <div className="py-20 text-center text-taupe text-sm">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="font-serif text-lg font-bold text-charcoal">Order Not Found</p>
        <Link href="/admin/orders" className="btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  const cleanPhone = order.customer.mobile.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    `Hello ${order.customer.fullName}! Thank you for your order #${order.orderNumber} with paint_n_meraki. We are currently processing your handcrafted resin art pieces.`
  )}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D6] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-[#EAE3D6] text-charcoal hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal font-mono">
                Order #{order.orderNumber}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37]/15 text-[#9B7B1B] border border-[#D4AF37]/30">
                {order.paymentMethod}
              </span>
            </div>
            <p className="text-xs text-taupe mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/orders/${id}/invoice?type=admin`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#EAE3D6] bg-white hover:bg-stone-50 text-xs font-bold text-charcoal shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-taupe" />
            Print Admin Invoice
          </Link>
          <Link
            href={`/admin/orders/${id}/invoice?type=customer`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white text-xs font-bold shadow-2xs transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Customer Invoice
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp Customer
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items & Payment Verification */}
        <div className="lg:col-span-2 space-y-6">
          {/* UPI Payment Verification Box (if UPI) */}
          {order.paymentMethod === 'UPI' && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  UPI Payment Verification
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    order.paymentStatus === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {order.paymentStatus === 'CONFIRMED' ? 'Verified & Paid' : 'Verification Required'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <span className="text-taupe block text-[10px] uppercase font-bold">UTR / Reference No:</span>
                  <span className="font-mono font-bold text-charcoal text-sm">
                    {order.utrNumber || 'No UTR entered yet'}
                  </span>
                </div>
                <div>
                  <span className="text-taupe block text-[10px] uppercase font-bold">Total Amount to Verify:</span>
                  <span className="font-bold text-charcoal text-sm">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              {order.paymentStatus !== 'CONFIRMED' && (
                <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                  <button
                    onClick={handleVerifyPayment}
                    disabled={updating}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm Payment & Approve Order
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Ordered Products Table */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3">
              Items in Order ({order.items.length})
            </h3>

            <div className="divide-y divide-[#F0ECE1]">
              {order.items.map((item, idx) => {
                const unitPrice =
                  typeof item.price === 'number' && !isNaN(item.price)
                    ? item.price
                    : typeof (item.selectedSize as any)?.price === 'number'
                    ? (item.selectedSize as any).price
                    : typeof item.product?.price === 'number'
                    ? item.product.price
                    : 0;

                const sizeLabel =
                  typeof item.selectedSize === 'object' && item.selectedSize
                    ? (item.selectedSize as any).label
                    : item.selectedSize || 'Standard';

                const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;

                return (
                  <div key={item.id || idx} className="py-3.5 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-[#EAE3D6] shrink-0">
                      <Image
                        src={item.product?.thumbnail || item.product?.images?.[0] || '/images/categories/clock-2.jpg'}
                        alt={item.product?.name || 'Product'}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-charcoal truncate">
                        {item.product?.name || 'Handcrafted Resin Art'}
                      </h4>
                      <p className="text-[11px] text-taupe mt-0.5">
                        Size: <span className="font-semibold text-charcoal">{sizeLabel}</span> &bull; Qty: {qty}
                      </p>
                      {item.customization?.text && (
                        <p className="text-[10px] text-[#9B7B1B] bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1 font-medium">
                          Custom Text: &quot;{item.customization.text}&quot;
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-xs text-charcoal block">
                        {formatPrice(unitPrice * qty)}
                      </span>
                      <span className="text-[10px] text-taupe">
                        {formatPrice(unitPrice)} each
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-[#EAE3D6] space-y-2 text-xs">
              <div className="flex justify-between text-taupe">
                <span>Subtotal:</span>
                <span className="text-charcoal font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-taupe">
                <span>Shipping Charge:</span>
                <span className="text-charcoal font-medium">
                  {order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}
                </span>
              </div>
              {order.codFee > 0 && (
                <div className="flex justify-between text-taupe">
                  <span>COD Handling Fee:</span>
                  <span className="text-charcoal font-medium">{formatPrice(order.codFee)}</span>
                </div>
              )}
              {order.discountAmount ? (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({order.couponCode || 'PROMO'}):</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-serif font-bold text-charcoal pt-2 border-t border-[#EAE3D6]">
                <span>Total Amount:</span>
                <span className="text-[#9B7B1B] text-base">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Status Updater, Shipping Details & Customer Info */}
        <div className="space-y-6">
          {/* Status Progression Card */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3">
              Fulfillment Status
            </h3>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Order Status
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-bold text-charcoal"
              >
                <option value="PENDING_PAYMENT">Pending Payment</option>
                <option value="PAYMENT_VERIFICATION">Payment Verification</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing / Handcrafting</option>
                <option value="READY_TO_SHIP">Ready to Ship</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-bold text-charcoal"
              >
                <option value="PENDING">Pending</option>
                <option value="VERIFICATION">Verification</option>
                <option value="CONFIRMED">Confirmed / Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            {/* Courier & Tracking */}
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Courier Partner
              </label>
              <input
                type="text"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="e.g. DTDC, Blue Dart, Delhivery"
                className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Tracking Number (AWB)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DTDC98472918"
                className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-mono text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Internal Admin Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes on customized resin color requests..."
                className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
              />
            </div>

            <button
              onClick={() => handleUpdate()}
              disabled={updating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Save Order Updates'}
            </button>
          </div>

          {/* Customer & Address Card */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4 text-xs">
            <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#D4AF37]" />
              Customer Details
            </h3>

            <div>
              <p className="font-bold text-sm text-charcoal">{order.customer.fullName}</p>
              <p className="text-taupe">{order.customer.email}</p>
              <p className="text-charcoal font-mono mt-1 font-semibold">{order.customer.mobile}</p>
            </div>

            <div className="pt-3 border-t border-[#EAE3D6]">
              <span className="text-[10px] uppercase font-bold text-taupe block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Shipping Address:
              </span>
              <p className="text-charcoal leading-relaxed font-medium">
                {order.shippingAddress.address}
                <br />
                {order.shippingAddress.landmark && `${order.shippingAddress.landmark}, `}
                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
