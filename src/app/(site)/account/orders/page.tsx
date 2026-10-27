'use client';

// ============================================
// paint_n_meraki — MY ORDERS PAGE
// ============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOrderStore } from '@/lib/store/order-store';
import { formatPrice } from '@/lib/data/products';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, Search } from 'lucide-react';
import type { OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Package }> = {
  PENDING_PAYMENT: { label: 'Pending Payment', color: 'text-amber-600 bg-amber-50', icon: Clock },
  PAYMENT_VERIFICATION: { label: 'Verifying Payment', color: 'text-blue-600 bg-blue-50', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  PROCESSING: { label: 'Processing', color: 'text-purple-600 bg-purple-50', icon: Package },
  READY_TO_SHIP: { label: 'Ready to Ship', color: 'text-indigo-600 bg-indigo-50', icon: Package },
  SHIPPED: { label: 'Shipped', color: 'text-blue-600 bg-blue-50', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600 bg-red-50', icon: XCircle },
  REFUNDED: { label: 'Refunded', color: 'text-gray-600 bg-gray-50', icon: XCircle },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const { orders, syncOrders } = useOrderStore();
  const [liveOrders, setLiveOrders] = useState<typeof orders>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.orders)) {
          setLiveOrders(data.orders);
          syncOrders(data.orders);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [syncOrders]);

  if (!mounted || !user) return null;

  const activeSource = liveOrders.length > 0 ? liveOrders : orders;
  const userMobile = user.mobile?.replace(/\D/g, '').slice(-10);
  const userOrders = activeSource.filter(
    (o) => o.userId === user.id || (userMobile && (o.customer?.mobile || '').replace(/\D/g, '').slice(-10) === userMobile)
  );

  const filteredOrders = userOrders.filter(order => {
    const matchesFilter = filter === 'all'
      || (filter === 'active' && !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.orderStatus))
      || (filter === 'completed' && ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.orderStatus));

    const matchesSearch = !searchQuery
      || order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-card border border-beige/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-beige/30">
          <h2 className="font-heading text-lg font-semibold text-charcoal">My Orders</h2>
          <p className="text-sm text-taupe mt-0.5">{userOrders.length} order{userOrders.length !== 1 ? 's' : ''} placed</p>
        </div>

        {/* Filters & Search */}
        <div className="px-6 py-3 border-b border-beige/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${filter === f
                  ? 'bg-dusty-rose text-white'
                  : 'bg-cream/50 text-taupe hover:bg-cream'
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
            <input
              type="text"
              placeholder="Search order #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-beige/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-dusty-rose/30"
            />
          </div>
        </div>

        {/* Order List */}
        <div>
          {filteredOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Package size={48} className="text-beige mx-auto mb-4" />
              <p className="font-heading text-lg text-charcoal mb-1">
                {userOrders.length === 0 ? 'No orders yet' : 'No matching orders'}
              </p>
              <p className="text-sm text-taupe mb-4">
                {userOrders.length === 0
                  ? 'Start shopping to see your orders here!'
                  : 'Try adjusting your filters or search query'}
              </p>
              {userOrders.length === 0 && (
                <Link href="/shop" className="btn-primary inline-flex items-center gap-2 text-sm">
                  Shop Now <ChevronRight size={14} />
                </Link>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = statusConfig[order.orderStatus];
              const StatusIcon = status.icon;
              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.orderNumber}`}
                  className="flex items-center gap-4 px-6 py-4 border-b border-beige/20 last:border-b-0 hover:bg-cream/20 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-cream/50 flex items-center justify-center flex-shrink-0 group-hover:bg-dusty-rose/10 transition-colors">
                    <StatusIcon size={20} className="text-taupe group-hover:text-dusty-rose transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-medium text-sm text-charcoal">#{order.orderNumber}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                      {order.orderStatus === 'DELIVERED' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#9B7B1B] border border-[#D4AF37]/30 flex items-center gap-1">
                          ★ Rate & Review
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-taupe">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-heading font-semibold text-charcoal text-sm">{formatPrice(order.total)}</p>
                    <ChevronRight size={14} className="text-taupe ml-auto mt-1 group-hover:text-dusty-rose transition-colors" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
