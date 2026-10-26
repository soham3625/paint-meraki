'use client';

// ============================================
// paint_n_meraki — ADMIN ORDERS LIST
// ============================================

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { formatPrice } from '@/lib/data/products';
import toast from 'react-hot-toast';
import type { Order } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.mobile.includes(q) ||
          (o.utrNumber && o.utrNumber.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.orderStatus === statusFilter);
    }

    if (paymentFilter !== 'all') {
      result = result.filter((o) => o.paymentStatus === paymentFilter);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PROCESSING':
      case 'READY_TO_SHIP':
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAYMENT_VERIFICATION':
      case 'PENDING_PAYMENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'VERIFICATION':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FAILED':
      case 'REFUNDED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal">
            Order Management & Fulfillment
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Process customer orders, verify UPI payments, and generate shipping waybills.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#EAE3D6] bg-white hover:bg-stone-50 text-xs font-semibold text-charcoal transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE3D6] shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-taupe absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, customer name, mobile, or UTR..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
          />
        </div>

        {/* Status Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium focus:outline-hidden focus:border-[#D4AF37]"
          >
            <option value="all">All Order Statuses</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="PAYMENT_VERIFICATION">Payment Verification (UPI)</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY_TO_SHIP">Ready to Ship</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium focus:outline-hidden focus:border-[#D4AF37]"
          >
            <option value="all">All Payment Statuses</option>
            <option value="VERIFICATION">Awaiting UTR Check</option>
            <option value="CONFIRMED">Confirmed / Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-taupe text-sm">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-taupe mx-auto opacity-50" />
            <p className="font-serif text-base font-bold text-charcoal">No orders found</p>
            <p className="text-xs text-taupe">Try adjusting search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F5EE] border-b border-[#EAE3D6] text-taupe uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4 font-semibold">Order</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Items</th>
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {filteredOrders.map((order) => {
                  const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
                  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors">
                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-bold text-charcoal">
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="hover:underline text-[#9B7B1B] font-mono"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap font-medium">
                        {orderDate}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-charcoal">{order.customer.fullName}</p>
                        <p className="text-[10px] text-taupe flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />
                          {order.customer.mobile}
                        </p>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 text-stone-600">
                        <span className="font-semibold">{itemsCount} item(s)</span>
                        <p className="text-[10px] text-taupe truncate max-w-[140px]">
                          {order.items.map((i) => i.product.name).join(', ')}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-charcoal whitespace-nowrap">
                        {formatPrice(order.total)}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-800 inline-block">
                            {order.paymentMethod}
                          </span>
                          <span
                            className={`block px-1.5 py-0.2 rounded-md text-[9px] font-bold border ${getPaymentBadge(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>
                          {order.utrNumber && (
                            <span className="block text-[9px] font-mono text-taupe truncate max-w-[100px]" title={order.utrNumber}>
                              UTR: {order.utrNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${getStatusBadge(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2A241F] hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors"
                        >
                          Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
