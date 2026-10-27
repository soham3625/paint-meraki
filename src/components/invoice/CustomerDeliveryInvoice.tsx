'use client';

// ============================================
// paint_n_meraki — CUSTOMER DELIVERY INVOICE COMPONENT
// Elegant, Customer-Facing, A4-Print Optimized
// ============================================

import React from 'react';
import Link from 'next/link';
import { Printer, ArrowLeft, Heart, Package, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/data/products';
import type { CustomerInvoiceData } from '@/lib/services/invoice-service';

interface CustomerDeliveryInvoiceProps {
  invoice: CustomerInvoiceData;
  backUrl?: string;
  showAdminControls?: boolean;
}

export default function CustomerDeliveryInvoice({
  invoice,
  backUrl = '/account/orders',
  showAdminControls = false,
}: CustomerDeliveryInvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(invoice.orderDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const brandName =
    invoice.store.name &&
    ['paint_n_meraki', 'paint meraki', 'paintnmeraki', 'paintmeraki'].includes(
      invoice.store.name.toLowerCase().replace(/[\s_]+/g, '')
    )
      ? 'Paint_n_Meraki'
      : invoice.store.name || 'Paint_n_Meraki';

  return (
    <div className="min-h-screen bg-[#F8F5EE] py-6 sm:py-10 print:py-0 print:bg-white text-[#181616]">
      {/* On-Screen Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto px-4 mb-6 print:hidden">
        <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={backUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8A7770] hover:text-[#181616] hover:bg-[#F5EDE4] transition-colors"
            >
              <ArrowLeft size={16} /> Back to Order
            </Link>
            <span className="text-xs text-[#8A7770] hidden sm:inline">&bull;</span>
            <span className="text-xs font-medium text-[#8A7770] hidden sm:inline">
              Customer Delivery Invoice ({invoice.invoiceNumber})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white text-xs font-bold shadow-sm transition-all"
            >
              <Printer size={15} /> Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Invoice Document (A4 Container) */}
      <div className="max-w-4xl mx-auto px-4 print:p-0 print:max-w-none">
        <div
          id="customer-invoice-sheet"
          className="bg-white rounded-2xl sm:border sm:border-[#EAE3D6] sm:shadow-lg p-6 sm:p-10 md:p-12 print:p-8 print:shadow-none print:border-none print:rounded-none"
        >
          {/* Header */}
          <div className="border-b border-[#EFE5DB] pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3.5 sm:gap-4">
                {(invoice.store.logo || '/logo.jpg') && (
                  <img
                    src={invoice.store.logo || '/logo.jpg'}
                    alt={brandName}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-contain border border-[#EAE3D6] bg-white p-0.5 shrink-0 shadow-xs"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = 'true';
                        target.src = '/logo.jpg';
                      }
                    }}
                  />
                )}
                <div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-wide text-[#181616]">
                    {brandName}
                  </h1>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-[#C5A572] font-semibold mt-0.5">
                    {invoice.store.tagline || 'Handcrafted Art • Made with Love'}
                  </p>
                  <div className="text-[11px] text-[#8A7770] mt-2 space-y-0.5">
                    <p>{invoice.store.address}</p>
                    <p>
                      WhatsApp / Phone: <span className="font-medium text-[#181616]">{invoice.store.whatsapp}</span>
                    </p>
                    <p>
                      Email: <span className="font-medium text-[#181616]">{invoice.store.email}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right bg-[#FAF7F2] sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto border sm:border-0 border-[#EFE5DB]">
                <span className="inline-block uppercase text-[10px] tracking-widest font-bold text-[#9B7B1B] bg-[#D4AF37]/15 px-2.5 py-1 rounded-md mb-2">
                  Tax / Retail Invoice
                </span>
                <p className="font-heading font-bold text-base text-[#181616]">{invoice.invoiceNumber}</p>
                <p className="text-xs text-[#8A7770] mt-0.5">
                  Order Ref: <span className="font-semibold text-[#181616]">#{invoice.orderNumber}</span>
                </p>
                <p className="text-xs text-[#8A7770] mt-0.5">
                  Order Date: <span className="font-medium text-[#181616]">{formattedDate}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Order Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAF7F2] rounded-xl p-5 border border-[#EFE5DB] mb-6">
            {/* Bill To / Customer */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7770] mb-1.5">
                Billed & Shipped To
              </p>
              <p className="font-bold text-sm text-[#181616]">{invoice.customer.fullName}</p>
              <div className="text-xs text-[#8A7770] mt-1 space-y-0.5 leading-relaxed">
                <p>{invoice.shippingAddress.address}</p>
                {invoice.shippingAddress.landmark && <p>Landmark: {invoice.shippingAddress.landmark}</p>}
                <p>
                  {invoice.shippingAddress.city}, {invoice.shippingAddress.state} — {invoice.shippingAddress.pincode}
                </p>
                <p className="font-medium text-[#181616] pt-1">
                  📞 {invoice.shippingAddress.mobile}
                  {invoice.customer.email ? ` • ✉️ ${invoice.customer.email}` : ''}
                </p>
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="sm:border-l sm:border-[#EFE5DB] sm:pl-6 space-y-2 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7770] mb-1.5">
                Delivery & Payment Mode
              </p>
              <div className="flex justify-between py-1 border-b border-[#EFE5DB]/60">
                <span className="text-[#8A7770]">Payment Mode:</span>
                <span className="font-bold text-[#181616] bg-[#D4AF37]/15 px-2 py-0.5 rounded text-[11px]">
                  {invoice.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFE5DB]/60">
                <span className="text-[#8A7770]">Payment Status:</span>
                <span className="font-semibold text-[#181616]">{invoice.paymentStatus}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8A7770]">Order Status:</span>
                <span className="font-semibold text-[#5B8C5A]">{invoice.orderStatus}</span>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="mb-6 overflow-hidden rounded-xl border border-[#EFE5DB]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] text-[#8A7770] border-b border-[#EFE5DB] uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4 font-bold">#</th>
                  <th className="py-3 px-4 font-bold">Item Description</th>
                  <th className="py-3 px-4 font-bold text-center">Qty</th>
                  <th className="py-3 px-4 font-bold text-right">Unit Price</th>
                  <th className="py-3 px-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE5DB]">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-[#FAF7F2]/40 transition-colors">
                    <td className="py-3.5 px-4 text-[#8A7770] align-top">{index + 1}</td>
                    <td className="py-3.5 px-4 align-top">
                      <p className="font-bold text-xs text-[#181616]">{item.name}</p>
                      <p className="text-[11px] text-[#8A7770] mt-0.5">Size: {item.size}</p>
                      {item.customizationDescription && (
                        <p className="text-[10px] text-[#9B7B1B] bg-[#D4AF37]/10 px-2 py-0.5 rounded inline-block mt-1">
                          ✦ {item.customizationDescription}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#181616] font-medium align-top">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#8A7770] align-top">
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#181616] align-top">
                      {formatPrice(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
            {/* Customer Special Notes / Terms */}
            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              {invoice.customerInstructions && (
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE5DB]">
                  <p className="text-[10px] uppercase font-bold text-[#8A7770]">Special Instructions</p>
                  <p className="text-[#181616] mt-0.5 italic">{invoice.customerInstructions}</p>
                </div>
              )}
              <div className="p-3.5 bg-[#FAF7F2]/60 rounded-xl border border-[#EFE5DB] text-[11px] text-[#8A7770] space-y-1">
                <p className="font-semibold text-[#181616] flex items-center gap-1">
                  <Heart size={12} className="text-[#CFA99D] fill-[#CFA99D]" /> Care Instructions:
                </p>
                <p>Keep away from direct sunlight & extreme heat. Clean with a soft, dry micro-fiber cloth.</p>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="w-full sm:w-2/5 bg-[#FAF7F2] rounded-xl p-4 border border-[#EFE5DB] text-xs space-y-2">
              <div className="flex justify-between text-[#8A7770]">
                <span>Subtotal</span>
                <span className="font-medium text-[#181616]">{formatPrice(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#8A7770]">
                <span>Shipping Charge</span>
                <span className="font-medium text-[#181616]">
                  {invoice.shippingCharge === 0 ? 'FREE' : formatPrice(invoice.shippingCharge)}
                </span>
              </div>
              {invoice.codFee > 0 && (
                <div className="flex justify-between text-[#8A7770]">
                  <span>COD Handling Fee</span>
                  <span className="font-medium text-[#181616]">{formatPrice(invoice.codFee)}</span>
                </div>
              )}
              {invoice.discountAmount && invoice.discountAmount > 0 ? (
                <div className="flex justify-between text-[#5B8C5A] font-medium">
                  <span>Discount ({invoice.couponCode || 'PROMO'})</span>
                  <span>-{formatPrice(invoice.discountAmount)}</span>
                </div>
              ) : null}

              <div className="border-t border-[#EFE5DB] pt-2 mt-2 flex justify-between items-baseline font-heading font-bold text-sm text-[#181616]">
                <span>Grand Total</span>
                <span className="text-base text-[#9B7B1B]">{formatPrice(invoice.total)}</span>
              </div>

              <div className="pt-2 border-t border-[#EFE5DB]/60 text-[10px] text-[#8A7770] text-center">
                Amount payable on delivery via Cash / UPI to courier partner
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#EFE5DB] pt-6 text-center text-xs text-[#8A7770] space-y-2">
            <p className="font-heading italic text-[#181616] text-sm">
              &quot;Thank you for choosing {invoice.store.name || 'Paint_n_Meraki'} ♡ Every piece is handcrafted with love.&quot;
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] pt-1">
              <span>🌐 {invoice.store.website}</span>
              {invoice.store.instagramUrl ? (
                <a
                  href={invoice.store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-[#181616] font-medium"
                >
                  📸 Instagram: {invoice.store.instagram}
                </a>
              ) : (
                <span>📸 Instagram: {invoice.store.instagram}</span>
              )}
              <span>💬 WhatsApp: {invoice.store.whatsapp}</span>
            </div>
            <p className="text-[10px] text-[#8A7770]/70 pt-2">
              This is a computer-generated delivery invoice for your handcrafted order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
