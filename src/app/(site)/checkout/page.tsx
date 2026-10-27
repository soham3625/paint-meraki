'use client';

// ============================================
// paint_n_meraki — CHECKOUT PAGE
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-store';
import { useOrderStore } from '@/lib/store/order-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatPrice } from '@/lib/data/products';
import { ArrowLeft, Lock, Shield, CreditCard, Banknote, Tag, X, CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Order, CustomerInfo, ShippingAddress, BusinessSettings } from '@/types';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getShippingCharge, getTotal, clearCart, appliedCoupon, applyCoupon, removeCoupon } = useCartStore();
  const { addOrder, getNextOrderNumber } = useOrderStore();
  const { user } = useAuthStore();

  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    mobile: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setCustomer({
        fullName: user.fullName || '',
        mobile: user.mobile || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const [address, setAddress] = useState<ShippingAddress>({
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<Partial<BusinessSettings>>({
    upiId: 'paintmeraki@upi',
    upiQrCode: '',
    codEnabled: true,
    codFee: 0,
    shippingCharge: 99,
    freeShippingThreshold: 2000,
  });

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data) setPaymentSettings(data);
      })
      .catch(() => {});
  }, []);

  const subtotal = getSubtotal();
  const freeThreshold = paymentSettings.freeShippingThreshold ?? 2000;
  const shipping = subtotal >= freeThreshold ? 0 : (paymentSettings.shippingCharge ?? 99);
  const codFee = paymentMethod === 'COD' ? (paymentSettings.codFee || 0) : 0;

  // Calculate discount only if applied coupon is valid for current subtotal
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
      discountAmount = 0;
    } else if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shipping + codFee);

  // Auto-remove coupon if cart drops below required spend
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
      toast.error(`Coupon ${appliedCoupon.code} requires min order ₹${appliedCoupon.minOrderAmount}. Removed.`);
      removeCoupon();
    }
  }, [subtotal, appliedCoupon, removeCoupon]);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        const errorMsg = data.message || 'Invalid or inactive coupon code';
        setCouponError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      applyCoupon({
        code: data.coupon.code,
        discountAmount: data.discountAmount,
        discountType: data.coupon.discountType,
        discountValue: data.coupon.discountValue,
        minOrderAmount: data.coupon.minOrderAmount,
        maxDiscount: data.coupon.maxDiscount,
      });

      setCouponSuccess(data.message || `Coupon ${data.coupon.code} applied!`);
      toast.success(data.message || `Coupon ${data.coupon.code} applied!`);
      setCouponCodeInput('');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to validate coupon';
      setCouponError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess(null);
    setCouponError(null);
    toast.success('Coupon removed');
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="font-heading text-2xl text-charcoal mb-2">Your Cart is Empty</h1>
        <p className="text-taupe mb-6">Add some products before checking out.</p>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!customer.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!customer.mobile.trim() || !/^[6-9]\d{9}$/.test(customer.mobile)) newErrors.mobile = 'Valid 10-digit mobile number required';
    if (!customer.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) newErrors.email = 'Valid email required';
    if (!address.address.trim()) newErrors.address = 'Address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state) newErrors.state = 'State is required';
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode)) newErrors.pincode = 'Valid 6-digit pincode required';
    if (paymentMethod === 'UPI' && !utrNumber.trim()) newErrors.utr = 'UTR/Reference number required for UPI payment';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = getNextOrderNumber();
      const orderItems = items.map((item, index) => {
        const itemPrice =
          typeof item.selectedSize?.price === 'number'
            ? item.selectedSize.price
            : (item.product?.price || 0);
        const sizeLabel =
          typeof item.selectedSize === 'object' && item.selectedSize
            ? item.selectedSize.label
            : (typeof item.selectedSize === 'string' ? item.selectedSize : 'Standard');

        return {
          id: `item-${Date.now()}-${index}`,
          product: item.product,
          quantity: item.quantity || 1,
          price: itemPrice,
          selectedSize: sizeLabel,
          customization: item.customization,
        };
      });

      const order: Order = {
        id: 'ord-' + Date.now().toString(36),
        orderNumber,
        userId: user?.id,
        customer,
        items: orderItems,
        shippingAddress: address,
        subtotal,
        shippingCharge: shipping,
        codFee,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        couponCode: discountAmount > 0 && appliedCoupon ? appliedCoupon.code : undefined,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'VERIFICATION',
        orderStatus: paymentMethod === 'COD' ? 'CONFIRMED' : 'PAYMENT_VERIFICATION',
        utrNumber: paymentMethod === 'UPI' ? utrNumber.trim() : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Post order to backend API for authoritative database persistence
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.order) {
        throw new Error(data.error || 'Failed to process and record order. Please try again.');
      }

      // 2. Persist confirmed server order to client state & clear cart
      const confirmedOrder = data.order;
      addOrder(confirmedOrder);
      clearCart();

      // Short delay for UX transition
      await new Promise((resolve) => setTimeout(resolve, 300));

      router.push(`/order-success?order=${encodeURIComponent(confirmedOrder.orderNumber)}`);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-20 sm:pb-0">
      <div className="bg-white border-b border-beige/30">
        <div className="container-custom py-5">
          <div className="flex items-center gap-4">
            <Link href="/cart" className="text-taupe hover:text-charcoal transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-semibold text-charcoal">Checkout</h1>
              <p className="text-xs text-taupe flex items-center gap-1"><Lock size={10} /> Secure checkout</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-beige/30 p-5 sm:p-6">
              <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">Customer Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="input-label">Full Name *</label>
                  <input
                    type="text"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className={`input-field ${errors.fullName ? 'border-error' : ''}`}
                    placeholder="Your full name"
                  />
                  {errors.fullName && <p className="text-xs text-error mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="input-label">Mobile Number *</label>
                  <input
                    type="tel"
                    value={customer.mobile}
                    onChange={(e) => setCustomer({ ...customer, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className={`input-field ${errors.mobile ? 'border-error' : ''}`}
                    placeholder="10-digit mobile number"
                  />
                  {errors.mobile && <p className="text-xs text-error mt-1">{errors.mobile}</p>}
                </div>
                <div>
                  <label className="input-label">Email *</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className={`input-field ${errors.email ? 'border-error' : ''}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-beige/30 p-5 sm:p-6">
              <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="input-label">Address *</label>
                  <textarea
                    value={address.address}
                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                    className={`input-field resize-none h-20 ${errors.address ? 'border-error' : ''}`}
                    placeholder="House/flat number, street, area"
                  />
                  {errors.address && <p className="text-xs text-error mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="input-label">City *</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className={`input-field ${errors.city ? 'border-error' : ''}`}
                    placeholder="City"
                  />
                  {errors.city && <p className="text-xs text-error mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="input-label">State *</label>
                  <select
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className={`input-field ${errors.state ? 'border-error' : ''}`}
                  >
                    <option value="">Select state</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-xs text-error mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="input-label">Pincode *</label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className={`input-field ${errors.pincode ? 'border-error' : ''}`}
                    placeholder="6-digit pincode"
                  />
                  {errors.pincode && <p className="text-xs text-error mt-1">{errors.pincode}</p>}
                </div>
                <div>
                  <label className="input-label">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={address.landmark || ''}
                    onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                    className="input-field"
                    placeholder="Near..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-beige/30 p-5 sm:p-6">
              <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-charcoal bg-charcoal/5' : 'border-beige/50 hover:border-charcoal/30'
                  }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="accent-charcoal"
                  />
                  <CreditCard size={18} className="text-charcoal" />
                  <div>
                    <p className="text-sm font-medium text-charcoal">UPI Payment</p>
                    <p className="text-xs text-taupe">Pay via Google Pay, PhonePe, Paytm, or BHIM UPI</p>
                  </div>
                </label>

                {paymentSettings.codEnabled !== false && (
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-charcoal bg-charcoal/5' : 'border-beige/50 hover:border-charcoal/30'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-charcoal"
                    />
                    <Banknote size={18} className="text-charcoal" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">
                        Cash on Delivery {paymentSettings.codFee ? `(+₹${paymentSettings.codFee} fee)` : ''}
                      </p>
                      <p className="text-xs text-taupe">Pay with cash when your handcrafted order arrives</p>
                    </div>
                  </label>
                )}
              </div>

              {/* UPI Details */}
              {paymentMethod === 'UPI' && (
                <div className="mt-4 p-4 bg-cream/50 rounded-xl space-y-4 animate-fade-in">
                  <div className="text-center">
                    <p className="text-sm font-medium text-charcoal mb-1">Pay to Official Store UPI ID</p>
                    <p className="text-lg font-mono font-semibold text-charcoal bg-white px-4 py-2 rounded-lg inline-block border border-beige/40">
                      {paymentSettings.upiId || 'paintmeraki@upi'}
                    </p>
                    <p className="text-xs text-taupe mt-2">Amount: <span className="font-semibold text-charcoal">{formatPrice(total)}</span></p>
                  </div>
                  {paymentSettings.upiQrCode ? (
                    <div className="w-48 h-48 mx-auto bg-white rounded-xl overflow-hidden p-2 border border-beige/30 flex items-center justify-center">
                      <img
                        src={paymentSettings.upiQrCode}
                        alt="Scan UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 mx-auto bg-white rounded-xl flex items-center justify-center border border-beige/30">
                      <div className="text-center text-xs text-taupe">
                        <p className="font-medium text-charcoal">UPI QR Code</p>
                        <p className="text-[10px] text-taupe mt-1">{paymentSettings.upiId || 'paintmeraki@upi'}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="input-label">UTR / Reference Number *</label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className={`input-field ${errors.utr ? 'border-error' : ''}`}
                      placeholder="Enter 12-digit UPI transaction reference number"
                    />
                    {errors.utr && <p className="text-xs text-error mt-1">{errors.utr}</p>}
                    <p className="text-xs text-taupe mt-1">You can find this in your UPI app under transaction details</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-white rounded-xl border border-beige/30 p-5 sm:p-6 sticky top-24">
              <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize.value}`} className="flex gap-3 text-sm items-center">
                    <div className="w-12 h-12 rounded-lg bg-beige/30 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                      {item.product.thumbnail || (item.product.images && item.product.images[0]) ? (
                        <img
                          src={item.product.thumbnail || item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.fallback-pm')) {
                              const span = document.createElement('span');
                              span.className = 'text-[8px] text-taupe fallback-pm';
                              span.innerText = 'PM';
                              parent.appendChild(span);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-[8px] text-taupe">PM</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-charcoal font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-taupe">{item.selectedSize.label} × {item.quantity}</p>
                    </div>
                    <p className="font-medium text-charcoal">{formatPrice(item.selectedSize.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Discount / Coupon Section */}
              <div className="border-t border-beige/30 pt-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-charcoal flex items-center gap-1.5">
                    <Tag size={13} className="text-[#9B7B1B]" /> Have a Coupon Code?
                  </span>
                  {appliedCoupon && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Applied
                    </span>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Tag size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-emerald-950 tracking-wider">
                            {appliedCoupon.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Saved {formatPrice(discountAmount)} on your order
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 transition-colors"
                      title="Remove coupon"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponCodeInput}
                          onChange={(e) => {
                            setCouponCodeInput(e.target.value.toUpperCase());
                            if (couponError) setCouponError(null);
                          }}
                          placeholder="Enter coupon code (e.g. MERAKI10)"
                          className="w-full px-3 py-2 text-xs font-mono font-medium rounded-xl border border-beige/60 bg-[#FAF7F2] focus:bg-white focus:outline-hidden focus:border-[#9B7B1B] transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:text-taupe"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isValidatingCoupon || !couponCodeInput.trim()}
                        className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
                      >
                        {isValidatingCoupon ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-rose-600 font-medium animate-fade-in pl-1">
                        {couponError}
                      </p>
                    )}
                  </form>
                )}
              </div>

              <div className="border-t border-beige/30 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-taupe">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-700 font-medium bg-emerald-50/70 -mx-2 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <span>🏷️ Coupon Discount</span>
                      <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                        {appliedCoupon.code}
                      </span>
                    </span>
                    <span className="font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-taupe">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-success">Free</span> : formatPrice(shipping)}</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-taupe">
                    <span>COD Fee</span>
                    <span>{formatPrice(codFee)}</span>
                  </div>
                )}
                <div className="border-t border-beige/30 pt-2">
                  <div className="flex justify-between font-heading text-base font-semibold text-charcoal">
                    <span>Total</span>
                    <span className={discountAmount > 0 ? 'text-[#9B7B1B]' : ''}>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="btn-primary w-full justify-center mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <Shield size={16} /> Place Order — {formatPrice(total)}
                  </>
                )}
              </button>

              <p className="text-xs text-taupe text-center mt-3">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
