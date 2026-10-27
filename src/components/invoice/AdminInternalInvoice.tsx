'use client';

// ============================================
// paint_n_meraki — ADMIN INTERNAL & DISPATCH INVOICE
// Full operational, fulfillment & accounting details
// ============================================

import React from 'react';
import Link from 'next/link';
import { Printer, ArrowLeft, Shield, Truck, Package, User, Clock, FileText } from 'lucide-react';
import { formatPrice } from '@/lib/data/products';
import type { AdminInvoiceData } from '@/lib/services/invoice-service';

interface AdminInternalInvoiceProps {
  invoice: AdminInvoiceData;
  orderId: string;
  onSwitchToCustomerView?: () => void;
}

export default function AdminInternalInvoice({
  invoice,
  orderId,
  onSwitchToCustomerView,
}: AdminInternalInvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedOrderDate = new Date(invoice.orderDate).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="min-h-screen bg-[#F8F5EE] py-6 sm:py-10 print:py-0 print:bg-white text-[#181616]">
      {/* On-Screen Action Bar */}
      <div className="max-w-4xl mx-auto px-4 mb-6 print:hidden">
        <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/orders/${orderId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8A7770] hover:text-[#181616] hover:bg-[#F5EDE4] transition-colors"
            >
              <ArrowLeft size={16} /> Back to Order Admin
            </Link>
            <span className="text-xs text-[#8A7770] hidden sm:inline">&bull;</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
              INTERNAL ADMIN INVOICE
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {onSwitchToCustomerView && (
              <button
                onClick={onSwitchToCustomerView}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#EAE3D6] bg-white hover:bg-stone-50 text-xs font-bold text-charcoal transition-all shadow-xs"
              >
                <FileText size={14} className="text-dusty-rose" /> Switch to Customer Invoice
              </button>
            )}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white text-xs font-bold shadow-sm transition-all"
            >
              <Printer size={15} /> Print Admin Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Main Internal Document Sheet */}
      <div className="max-w-4xl mx-auto px-4 print:p-0 print:max-w-none">
        <div className="bg-white rounded-2xl sm:border sm:border-[#EAE3D6] sm:shadow-lg p-6 sm:p-10 md:p-12 print:p-8 print:shadow-none print:border-none print:rounded-none">
          {/* Internal Header */}
          <div className="border-b-2 border-charcoal pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-start gap-3.5">
                {(invoice.store?.logo || '/logo.jpg') && (
                  <img
                    src={invoice.store?.logo || '/logo.jpg'}
                    alt={invoice.store?.businessName || 'Paint_n_Meraki'}
                    className="w-12 h-12 rounded-xl object-contain border border-[#EAE3D6] bg-white p-0.5 shrink-0 shadow-xs"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-charcoal">
                      {invoice.store?.businessName || 'Paint_n_Meraki'}
                    </h1>
                    <span className="bg-stone-900 text-gold-light text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold">
                      INTERNAL OPS
                    </span>
                  </div>
                  <p className="text-xs text-taupe mt-1">
                    Master Fulfillment & Dispatch Record &bull; Internal Copy
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1">
                <p className="font-mono font-bold text-sm text-charcoal">
                  Order: #{invoice.orderNumber}
                </p>
                <p className="text-taupe font-mono text-[11px]">
                  Internal ID: {invoice.internalOrderId}
                </p>
                <p className="text-taupe">Created: {formattedOrderDate}</p>
                <p className="text-taupe">
                  User Account ID:{' '}
                  <span className="font-mono font-medium text-charcoal">
                    {invoice.userId || 'Guest / Direct'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Fulfillment & Courier Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-taupe">Fulfillment Status</p>
              <p className="font-bold text-sm text-charcoal mt-0.5">{invoice.orderStatus}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-taupe">Payment Status & Method</p>
              <p className="font-bold text-sm text-charcoal mt-0.5">
                {invoice.paymentMethod} ({invoice.paymentStatus})
              </p>
              {invoice.utrNumber && (
                <p className="font-mono text-[10px] text-taupe mt-0.5">UTR: {invoice.utrNumber}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-taupe">Courier / AWB Tracking</p>
              <p className="font-semibold text-charcoal mt-0.5">
                {invoice.courierName || 'Not Assigned'}
              </p>
              <p className="font-mono text-[11px] text-amber-800 font-bold">
                {invoice.trackingNumber || 'No AWB Number'}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAF7F2] rounded-xl p-5 border border-[#EFE5DB] mb-6 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-taupe mb-1 flex items-center gap-1">
                <User size={12} /> Customer Information
              </p>
              <p className="font-bold text-sm text-charcoal">{invoice.customer.fullName}</p>
              <p className="font-mono font-semibold text-charcoal mt-1">📞 {invoice.customer.mobile}</p>
              <p className="text-taupe mt-0.5">✉️ {invoice.customer.email}</p>
            </div>

            <div className="sm:border-l sm:border-[#EFE5DB] sm:pl-6">
              <p className="text-[10px] uppercase font-bold text-taupe mb-1 flex items-center gap-1">
                <Truck size={12} /> Shipping Address
              </p>
              <div className="text-charcoal leading-relaxed space-y-0.5">
                <p>{invoice.shippingAddress.address}</p>
                {invoice.shippingAddress.landmark && <p>Landmark: {invoice.shippingAddress.landmark}</p>}
                <p>
                  {invoice.shippingAddress.city}, {invoice.shippingAddress.state} —{' '}
                  <span className="font-bold">{invoice.shippingAddress.pincode}</span>
                </p>
                <p className="font-medium pt-1">Recipient Mobile: {invoice.shippingAddress.mobile}</p>
              </div>
            </div>
          </div>

          {/* Internal Notes Box */}
          {invoice.internalNotes && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 mb-6 text-xs">
              <p className="text-[10px] uppercase font-bold text-amber-800 mb-1">
                ⚠️ Internal Admin Notes & Special Instructions
              </p>
              <p className="text-charcoal font-medium whitespace-pre-wrap">{invoice.internalNotes}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-6 overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-taupe border-b border-stone-200 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-3">SKU / Item</th>
                  <th className="py-3 px-3">Size & Customization</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-3 align-top">
                      <span className="font-mono text-[10px] text-taupe block font-bold">
                        {item.sku || 'PM-ART'}
                      </span>
                      <span className="font-bold text-charcoal text-xs">{item.name}</span>
                    </td>
                    <td className="py-3 px-3 align-top">
                      <span className="font-medium text-charcoal block">Size: {item.size}</span>
                      {item.customization && (
                        <div className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded mt-1 space-y-0.5">
                          {item.customization.color && <p>Color: {item.customization.color}</p>}
                          {item.customization.text && <p>Custom Text: {item.customization.text}</p>}
                          {item.customization.personalMessage && (
                            <p>Message: {item.customization.personalMessage}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-charcoal align-top">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-taupe align-top">
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-charcoal align-top">
                      {formatPrice(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing & Dispatch Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs">
            {/* Dispatch Quality Checklist */}
            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
              <p className="text-[10px] uppercase font-bold text-charcoal">Fulfillment & QC Checklist</p>
              <div className="space-y-1.5 text-[11px] text-taupe">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" /> Resin Cure Quality Checked (No Bubbles/Dust)
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" /> Customization & Color Scheme Verified
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" /> Multi-Layer Bubble Wrap & Fragile Seal
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" /> Customer Delivery Invoice Included
                </label>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#EFE5DB] space-y-2">
              <div className="flex justify-between text-taupe">
                <span>Subtotal:</span>
                <span className="font-semibold text-charcoal">{formatPrice(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-taupe">
                <span>Shipping:</span>
                <span className="font-semibold text-charcoal">{formatPrice(invoice.shippingCharge)}</span>
              </div>
              {invoice.codFee > 0 && (
                <div className="flex justify-between text-taupe">
                  <span>COD Handling Fee:</span>
                  <span className="font-semibold text-charcoal">{formatPrice(invoice.codFee)}</span>
                </div>
              )}
              {invoice.discountAmount ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({invoice.couponCode || 'COUPON'}):</span>
                  <span>-{formatPrice(invoice.discountAmount)}</span>
                </div>
              ) : null}
              <div className="border-t border-[#EFE5DB] pt-2 flex justify-between font-bold text-sm text-charcoal">
                <span>Total Collected / Payable:</span>
                <span className="text-[#9B7B1B] text-base">{formatPrice(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Internal Footer */}
          <div className="border-t border-stone-200 pt-4 flex flex-wrap justify-between items-center text-[10px] text-taupe">
            <span>paint_n_meraki Admin Operations System</span>
            <span>Generated on {new Date().toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
