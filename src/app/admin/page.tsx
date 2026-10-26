'use client';

// ============================================
// paint_n_meraki — ADMIN DASHBOARD
// Overview with Live Metrics & Analytics
// ============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Sparkles,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import { formatPrice } from '@/lib/data/products';
import type { Order, Product, CustomOrderRequest, Category } from '@/types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrderRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, prodsRes, customRes, catRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/products'),
        fetch('/api/admin/custom-orders'),
        fetch('/api/admin/categories'),
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (customRes.ok) setCustomOrders(await customRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (e) {
      console.error('Failed to load dashboard metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Metrics
  const totalRevenue = orders.reduce((sum, o) => (o.orderStatus !== 'CANCELLED' ? sum + o.total : sum), 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'PENDING_PAYMENT' || o.orderStatus === 'PAYMENT_VERIFICATION' || o.orderStatus === 'PROCESSING').length;
  const pendingCustomOrders = customOrders.filter((c) => c.status !== 'COMPLETED' && c.status !== 'CANCELLED').length;
  const lowStockProducts = products.filter((p) => p.stock <= 3);

  // Status Badge Colors
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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#2A241F] to-[#1E1B18] text-white p-6 rounded-2xl shadow-md border border-[#3D3730]">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            paint_n_meraki Studio
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Welcome, Astha! Here&apos;s today&apos;s store pulse.
          </h2>
          <p className="text-xs text-[#C5BDB2] mt-1">
            Real-time sales, order fulfillment, and handcrafted commission updates.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white shadow-md shadow-gold/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE3D6] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-taupe uppercase tracking-wider">Total Sales</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#D4AF37] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-bold text-charcoal">
              {formatPrice(totalRevenue)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {orders.length} total completed transactions
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE3D6] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-taupe uppercase tracking-wider">Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-bold text-charcoal">
              {orders.length}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              {pendingOrders} awaiting fulfillment
            </p>
          </div>
        </div>

        {/* Custom Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE3D6] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-taupe uppercase tracking-wider">Custom Requests</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-bold text-charcoal">
              {customOrders.length}
            </h3>
            <p className="text-[11px] text-purple-600 font-medium flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              {pendingCustomOrders} active bespoke projects
            </p>
          </div>
        </div>

        {/* Catalog Products */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE3D6] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-taupe uppercase tracking-wider">Products</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-bold text-charcoal">
              {products.length}
            </h3>
            <p className="text-[11px] text-stone-500 font-medium flex items-center gap-1 mt-1">
              Across {categories.length} handcrafted categories
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Orders & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal">Recent Customer Orders</h3>
              <p className="text-xs text-taupe">Latest purchases and payment verification queue</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#9B7B1B] hover:text-[#7A6012] flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-taupe text-sm">
              No orders found yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EAE3D6] text-taupe font-semibold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Order</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Items</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Payment</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE1]">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-3.5 font-bold text-charcoal">
                        <Link href={`/admin/orders/${order.orderNumber}`} className="hover:underline text-[#9B7B1B]">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5">
                        <p className="font-semibold text-charcoal">{order.customer.fullName}</p>
                        <p className="text-[10px] text-taupe">{order.customer.mobile}</p>
                      </td>
                      <td className="py-3.5 text-stone-600">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} item(s)
                      </td>
                      <td className="py-3.5 font-semibold text-charcoal">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/10 text-charcoal text-[11px] font-semibold transition-colors"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Management Shortlinks */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-5 sm:p-6">
            <h3 className="font-serif text-base font-bold text-charcoal mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/admin/products/new"
                className="p-3 rounded-xl bg-[#F8F5EE] hover:bg-[#F0ECE1] border border-[#EAE3D6] text-xs font-semibold text-charcoal flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <Package className="w-5 h-5 text-[#D4AF37]" />
                <span>Add Product</span>
              </Link>
              <Link
                href="/admin/categories"
                className="p-3 rounded-xl bg-[#F8F5EE] hover:bg-[#F0ECE1] border border-[#EAE3D6] text-xs font-semibold text-charcoal flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <Plus className="w-5 h-5 text-[#D4AF37]" />
                <span>Categories</span>
              </Link>
              <Link
                href="/admin/coupons"
                className="p-3 rounded-xl bg-[#F8F5EE] hover:bg-[#F0ECE1] border border-[#EAE3D6] text-xs font-semibold text-charcoal flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span>New Coupon</span>
              </Link>
              <Link
                href="/admin/settings"
                className="p-3 rounded-xl bg-[#F8F5EE] hover:bg-[#F0ECE1] border border-[#EAE3D6] text-xs font-semibold text-charcoal flex flex-col items-center justify-center gap-1.5 transition-all text-center"
              >
                <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                <span>UPI & Shipping</span>
              </Link>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Stock Attention
              </h3>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {lowStockProducts.length} low
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-taupe py-2">All product stocks are healthy!</p>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                    <div className="truncate max-w-[150px]">
                      <p className="font-semibold text-charcoal truncate">{p.name}</p>
                      <p className="text-[10px] text-taupe">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                        {p.stock} left
                      </span>
                      <Link href={`/admin/products/${p.id}/edit`} className="block text-[10px] text-[#9B7B1B] font-semibold hover:underline mt-0.5">
                        Restock &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
