'use client';

// ============================================
// paint_n_meraki — ADMIN CUSTOMERS DIRECTORY
// ============================================

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
} from 'lucide-react';
import { formatPrice } from '@/lib/data/products';
import toast from 'react-hot-toast';
import type { User, Order } from '@/types';

export default function AdminCustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  // Group unique customers from orders
  const customers = useMemo(() => {
    const map = new Map<string, {
      name: string;
      email: string;
      mobile: string;
      ordersCount: number;
      totalSpent: number;
      lastOrderDate: string;
      city: string;
      state: string;
    }>();

    orders.forEach((o) => {
      const key = (o.customer.email || o.customer.mobile).toLowerCase();
      const existing = map.get(key);

      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += o.total;
        if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = o.createdAt;
          existing.city = o.shippingAddress.city;
          existing.state = o.shippingAddress.state;
        }
      } else {
        map.set(key, {
          name: o.customer.fullName,
          email: o.customer.email,
          mobile: o.customer.mobile,
          ordersCount: 1,
          totalSpent: o.total,
          lastOrderDate: o.createdAt,
          city: o.shippingAddress.city,
          state: o.shippingAddress.state,
        });
      }
    });

    let list = Array.from(map.values());

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            Customer Directory
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            View customer purchase history, total lifetime value, and delivery regions.
          </p>
        </div>
        <button
          onClick={fetchCustomerData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#EAE3D6] bg-white hover:bg-stone-50 text-xs font-semibold text-charcoal transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE3D6] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-taupe absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, email, mobile, city..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Customer Table Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-taupe text-sm">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Users className="w-8 h-8 text-taupe mx-auto opacity-50" />
            <p className="font-serif text-base font-bold text-charcoal">No customer records found</p>
            <p className="text-xs text-taupe">Orders placed by customers will automatically populate here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F5EE] border-b border-[#EAE3D6] text-taupe uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Orders Placed</th>
                  <th className="py-3 px-4 font-semibold">Total Spent</th>
                  <th className="py-3 px-4 font-semibold">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {customers.map((c, idx) => (
                  <tr key={idx} className="hover:bg-[#FDFBF7] transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 text-[#9B7B1B] font-bold flex items-center justify-center text-xs">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-charcoal">{c.name}</p>
                          <span className="text-[10px] text-emerald-600 font-medium">Verified Customer</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <p className="text-charcoal font-medium flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-taupe" /> {c.email}
                      </p>
                      <p className="text-taupe font-mono flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-taupe" /> {c.mobile}
                      </p>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-stone-600 font-medium">
                      {c.city}, {c.state}
                    </td>

                    {/* Orders */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 font-bold">
                        {c.ordersCount} order(s)
                      </span>
                    </td>

                    {/* Lifetime Spend */}
                    <td className="py-3.5 px-4 font-bold text-charcoal">
                      {formatPrice(c.totalSpent)}
                    </td>

                    {/* Last Order Date */}
                    <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(c.lastOrderDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
