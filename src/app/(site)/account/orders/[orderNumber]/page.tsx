'use client';

// ============================================
// paint_n_meraki — ORDER DETAIL PAGE
// ============================================

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrderStore } from '@/lib/store/order-store';
import { formatPrice } from '@/lib/data/products';
import {
  ArrowLeft,
  Package,
  CheckCircle,
  Truck,
  Clock,
  CreditCard,
  Box,
  MapPin,
  Star,
  Sparkles,
  X,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Order, OrderItem, OrderStatus } from '@/types';

const statusSteps: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'PENDING_PAYMENT', label: 'Order Placed', icon: Package },
  { status: 'PAYMENT_VERIFICATION', label: 'Payment Verification', icon: CreditCard },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { status: 'PROCESSING', label: 'Processing', icon: Clock },
  { status: 'READY_TO_SHIP', label: 'Ready to Ship', icon: Box },
  { status: 'SHIPPED', label: 'Shipped', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

function getStatusIndex(status: OrderStatus): number {
  const idx = statusSteps.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

const ratingLabels: Record<number, string> = {
  1: 'Disappointing',
  2: 'Fair',
  3: 'Good, meets expectations',
  4: 'Very Good, loved the quality',
  5: 'Masterpiece! Absolutely Loved It ✦',
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const { getOrderByNumber, syncOrder } = useOrderStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedItemIds, setReviewedItemIds] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const cleanNum = (orderNumber || '').toUpperCase().replace('#', '').trim();
    const localFound = getOrderByNumber(cleanNum);
    if (localFound) {
      setOrder(localFound);
      setReviewerName(localFound.customer?.fullName || '');
      setLoading(false);
    }

    // Always fetch live status from API
    fetch(`/api/orders/track?orderNumber=${encodeURIComponent(cleanNum)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success && data.order) {
          setOrder(data.order);
          setReviewerName(data.order.customer?.fullName || '');
          syncOrder(data.order);
        }
      })
      .catch((e) => console.error('Error fetching live order:', e))
      .finally(() => setLoading(false));

    // Load any previously reviewed item keys for this order
    try {
      const stored = localStorage.getItem(`reviewed_order_${cleanNum}`);
      if (stored) {
        setReviewedItemIds(JSON.parse(stored));
      }
    } catch { }
  }, [orderNumber, getOrderByNumber, syncOrder]);

  const openReviewModal = (item?: OrderItem) => {
    setSelectedItemForReview(item || null);
    setRating(5);
    setHoverRating(0);
    setReviewText('');
    setReviewerName(order?.customer?.fullName || '');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || reviewText.trim().length < 5) {
      toast.error('Please write at least a few words about your experience (minimum 5 characters)');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: reviewerName.trim() || order?.customer?.fullName || 'Valued Customer',
          rating,
          review: reviewText.trim(),
          productId: selectedItemForReview?.product?.id,
          productName: selectedItemForReview?.product?.name || 'Paint n Meraki Handcrafted Art',
          productSlug: selectedItemForReview?.product?.slug,
          orderNumber: order?.orderNumber,
          verified: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Thank you! Your review has been submitted.');
        const itemKey = selectedItemForReview?.product?.id || selectedItemForReview?.id || 'general';
        const updatedReviewed = [...reviewedItemIds, itemKey];
        setReviewedItemIds(updatedReviewed);
        try {
          const cleanNum = (order?.orderNumber || '').toUpperCase().replace('#', '').trim();
          localStorage.setItem(`reviewed_order_${cleanNum}`, JSON.stringify(updatedReviewed));
        } catch { }
        setReviewModalOpen(false);
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (err: any) {
      toast.error('Failed to submit review. Please check your connection.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dusty-rose mx-auto mb-3" />
        <p className="text-sm text-taupe">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-10 text-center">
        <Package size={48} className="text-beige mx-auto mb-4" />
        <h2 className="font-heading text-xl text-charcoal mb-2">Order Not Found</h2>
        <p className="text-sm text-taupe mb-4">We couldn&apos;t find order #{orderNumber}</p>
        <Link href="/account/orders" className="btn-primary inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.orderStatus);
  const isCancelled = order.orderStatus === 'CANCELLED' || order.orderStatus === 'REFUNDED';
  const isDelivered = order.orderStatus === 'DELIVERED';

  return (
    <div className="space-y-6">
      {/* Back & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/account/orders" className="p-2 rounded-lg hover:bg-cream/50 transition-colors text-taupe hover:text-charcoal">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-heading text-lg font-semibold text-charcoal">Order #{order.orderNumber}</h2>
            <p className="text-xs text-taupe">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {isDelivered && (
            <button
              onClick={() => openReviewModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:opacity-95 text-white font-semibold text-xs shadow-xs transition-all"
            >
              <Star size={14} className="fill-white" />
              Write Order Review
            </button>
          )}

          <Link
            href={`/account/orders/${order.orderNumber}/invoice`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-beige/60 hover:bg-cream/40 text-charcoal font-semibold text-xs shadow-xs hover:border-dusty-rose/40 transition-all"
          >
            <Box size={14} className="text-dusty-rose" />
            View Delivery Invoice
          </Link>
        </div>
      </div>

      {/* Delivered Customer Reviews Callout */}
      {isDelivered && (
        <div className="bg-gradient-to-r from-[#FAF6EE] via-[#FDFBF7] to-[#F5ECE0] rounded-2xl border border-[#D4AF37]/35 p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 text-[#9B7B1B]">
                <Sparkles size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-semibold text-charcoal text-base">Your Order Has Been Delivered!</h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Delivered
                  </span>
                </div>
                <p className="text-xs text-taupe mt-1 leading-relaxed max-w-2xl">
                  We hope you love your handcrafted resin pieces! Please share your feedback and experience to help fellow art lovers and support our handmade artists.
                </p>
              </div>
            </div>

            <button
              onClick={() => openReviewModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-charcoal hover:bg-black text-white text-xs font-semibold shadow-xs transition-all flex-shrink-0"
            >
              <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
              Add Customer Review
            </button>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-6">
        <h3 className="font-heading text-sm font-semibold text-charcoal mb-6">Order Status</h3>

        {isCancelled ? (
          <div className="bg-red-50 rounded-xl px-4 py-3 text-center">
            <p className="text-red-600 font-medium text-sm">{order.orderStatus === 'CANCELLED' ? 'Order Cancelled' : 'Order Refunded'}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-beige/50 z-0" />
            <div
              className="absolute top-5 left-5 h-0.5 bg-dusty-rose z-10 transition-all duration-500"
              style={{ width: `calc(${(currentStatusIndex / (statusSteps.length - 1)) * 100}% - 40px)` }}
            />

            {statusSteps.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = i <= currentStatusIndex;
              const isCurrent = i === currentStatusIndex;

              return (
                <div key={step.status} className="flex flex-col items-center relative z-20" style={{ width: `${100 / statusSteps.length}%` }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                      ? 'bg-dusty-rose border-dusty-rose text-white'
                      : 'bg-white border-beige/50 text-taupe'
                    } ${isCurrent ? 'ring-4 ring-dusty-rose/20' : ''}`}>
                    <Icon size={16} />
                  </div>
                  <p className={`text-[9px] sm:text-[10px] mt-2 text-center leading-tight ${isCompleted ? 'text-charcoal font-medium' : 'text-taupe'
                    }`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {order.trackingNumber && (
          <div className="mt-4 pt-4 border-t border-beige/30">
            <p className="text-xs text-taupe">Tracking Number</p>
            <p className="text-sm font-medium text-charcoal font-mono">{order.trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Order Items with Review Button */}
      <div className="bg-white rounded-2xl shadow-card border border-beige/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-beige/30 flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-charcoal">
            Items ({order.items.length})
          </h3>
          {isDelivered && (
            <span className="text-[11px] text-taupe font-medium">Click review on any product below</span>
          )}
        </div>
        <div>
          {order.items.map((item, index) => {
            const sizeLabel =
              typeof item.selectedSize === 'object' && item.selectedSize
                ? (item.selectedSize as any).label
                : (item.selectedSize || 'Standard');
            const unitPrice =
              typeof item.price === 'number' && !isNaN(item.price)
                ? item.price
                : ((item.selectedSize as any)?.price || item.product?.price || 0);
            const qty = item.quantity || 1;
            const itemKey = item.product?.id || item.id || `item-${index}`;
            const isItemReviewed = reviewedItemIds.includes(itemKey) || reviewedItemIds.includes('general');

            return (
              <div key={item.id || `acc-item-${index}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-beige/20 last:border-b-0 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-cream/50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-beige/30">
                    {item.product?.thumbnail ? (
                      <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-taupe" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{item.product?.name || 'Handcrafted Art'}</p>
                    <p className="text-xs text-taupe">Size: {sizeLabel} • Qty: {qty}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                  <p className="font-heading font-semibold text-sm text-charcoal">{formatPrice(unitPrice * qty)}</p>

                  {/* Review Action */}
                  {isDelivered ? (
                    isItemReviewed ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium border border-emerald-200">
                        <CheckCircle size={13} />
                        Reviewed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openReviewModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6EE] hover:bg-[#F3EBDD] text-[#9B7B1B] border border-[#D4AF37]/40 text-xs font-semibold shadow-2xs transition-all"
                      >
                        <Star size={13} className="fill-[#D4AF37] text-[#D4AF37]" />
                        Review Item
                      </button>
                    )
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary & Shipping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Price Summary */}
        <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-6">
          <h3 className="font-heading text-sm font-semibold text-charcoal mb-4">Price Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-taupe">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-taupe">
              <span>Shipping</span>
              <span>{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span>
            </div>
            {order.codFee > 0 && (
              <div className="flex justify-between text-taupe">
                <span>COD Fee</span>
                <span>{formatPrice(order.codFee)}</span>
              </div>
            )}
            {order.discountAmount ? (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount ({order.couponCode || 'Coupon'})</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-heading font-semibold text-charcoal pt-2 border-t border-beige/30">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-beige/30">
            <p className="text-xs text-taupe">Payment: {order.paymentMethod}</p>
            {order.utrNumber && <p className="text-xs text-taupe mt-0.5">UTR: {order.utrNumber}</p>}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-6">
          <h3 className="font-heading text-sm font-semibold text-charcoal mb-4 flex items-center gap-2">
            <MapPin size={14} className="text-dusty-rose" /> Shipping Address
          </h3>
          <div className="text-sm text-taupe space-y-1">
            <p className="font-medium text-charcoal">{order.customer.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
            {order.shippingAddress.landmark && <p>Landmark: {order.shippingAddress.landmark}</p>}
            <p className="pt-1">📞 {order.customer.mobile}</p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE3D6] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EAE3D6] flex items-center justify-between bg-[#FDFBF7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#9B7B1B]">
                  <Star size={16} className="fill-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-charcoal">Write a Review</h3>
                  <p className="text-[11px] text-taupe">Verified Order #{order.orderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-200/60 text-taupe transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReview} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Product Info Preview */}
              {selectedItemForReview && (
                <div className="flex items-center gap-3 p-3 bg-[#FAF6EE] rounded-2xl border border-[#EAE3D6]/70">
                  <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-beige/40">
                    {selectedItemForReview.product?.thumbnail ? (
                      <img
                        src={selectedItemForReview.product.thumbnail}
                        alt={selectedItemForReview.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={20} className="text-taupe m-auto mt-3" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-charcoal truncate">
                      {selectedItemForReview.product?.name || 'Handcrafted Resin Piece'}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">✓ Verified Purchase</p>
                  </div>
                </div>
              )}

              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const activeVal = hoverRating || rating;
                    const isFilled = starVal <= activeVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-hidden transform hover:scale-115 transition-transform"
                      >
                        <Star
                          size={28}
                          className={isFilled ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-stone-300'}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-semibold text-[#9B7B1B] mt-1.5">
                  {ratingLabels[hoverRating || rating]}
                </p>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Astha Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D6] bg-[#FAF6EE]/50 text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37] focus:bg-white transition-all"
                />
              </div>

              {/* Review Content */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Your Review & Experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details about the craftsmanship, resin shine, colors, packaging, and how much you liked it..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D6] bg-[#FAF6EE]/50 text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37] focus:bg-white transition-all leading-relaxed"
                />
                <p className="text-[10px] text-taupe mt-1">Minimum 5 characters. Your review will be featured with a Verified Buyer badge.</p>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-taupe hover:text-charcoal hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal hover:bg-black text-white text-xs font-semibold shadow-xs disabled:opacity-60 transition-all"
                >
                  {submittingReview ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star size={13} className="fill-white" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

