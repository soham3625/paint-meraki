'use client';

// ============================================
// paint_n_meraki — ADMIN ACTIVITY & AUDIT LOGS
// ============================================

import { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Clock,
  Shield,
  User,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { ActivityLog } from '@/types';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/activity-logs');
      if (res.ok) setLogs(await res.json());
    } catch (e) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.adminName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.details && l.details.toLowerCase().includes(q))
      );
    }

    if (entityFilter !== 'all') {
      result = result.filter((l) => l.entity === entityFilter);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [logs, searchQuery, entityFilter]);

  const getActionBadge = (action: string) => {
    if (action.includes('CREATED') || action.includes('INITIALIZED')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (action.includes('UPDATED') || action.includes('SAVED')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (action.includes('DELETED')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    return 'bg-stone-100 text-stone-800 border-stone-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            <History className="w-5 h-5 text-[#D4AF37]" />
            Activity & Audit Logs
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Real-time audit trail of product edits, order updates, price changes, and admin logins.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#EAE3D6] bg-white hover:bg-stone-50 text-xs font-semibold text-charcoal transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Logs
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE3D6] shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-taupe absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by admin, action, or details..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
          />
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium focus:outline-hidden focus:border-[#D4AF37]"
        >
          <option value="all">All Modules</option>
          <option value="Product">Products</option>
          <option value="Category">Categories</option>
          <option value="Order">Orders</option>
          <option value="CustomOrder">Custom Orders</option>
          <option value="Coupon">Coupons</option>
          <option value="Banner">Banners</option>
          <option value="Settings">Settings</option>
          <option value="Auth">Authentication</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-taupe text-sm">Loading activity logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <History className="w-8 h-8 text-taupe mx-auto opacity-50" />
            <p className="font-serif text-base font-bold text-charcoal">No logs match your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F5EE] border-b border-[#EAE3D6] text-taupe uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Admin</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Module</th>
                  <th className="py-3 px-4 font-semibold">Activity Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FDFBF7] transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Admin */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-charcoal">{log.adminName}</p>
                      <p className="text-[10px] text-taupe">{log.adminEmail}</p>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Module */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md text-[11px]">
                        {log.entity}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-4 text-stone-700 font-medium">
                      {log.details || '—'}
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
