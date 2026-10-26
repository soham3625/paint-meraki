'use client';

// ============================================
// paint_n_meraki — ADMIN REVIEWS MODERATION
// ============================================

import { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Search,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Review } from '@/types';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) setReviews(await res.json());
    } catch (e) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.review.toLowerCase().includes(q) ||
          (r.productName && r.productName.toLowerCase().includes(q))
      );
    }

    if (ratingFilter !== 'all') {
      result = result.filter((r) => r.rating === Number(ratingFilter));
    }

    return result;
  }, [reviews, searchQuery, ratingFilter]);

  const handleToggleFeatured = async (r: Review) => {
    const newVal = !r.isFeatured;
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id, isFeatured: newVal }),
      });
      if (res.ok) {
        toast.success(newVal ? 'Marked as featured' : 'Removed from featured');
        setReviews((prev) => prev.map((item) => (item.id === r.id ? { ...item, isFeatured: newVal } : item)));
      }
    } catch (e) {
      toast.error('Failed to update review');
    }
  };

  const handleToggleVisibility = async (r: Review) => {
    const newVal = r.isVisible !== false ? false : true;
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id, isVisible: newVal }),
      });
      if (res.ok) {
        toast.success(newVal ? 'Review visible' : 'Review hidden');
        setReviews((prev) => prev.map((item) => (item.id === r.id ? { ...item, isVisible: newVal } : item)));
      }
    } catch (e) {
      toast.error('Failed to update visibility');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Review deleted');
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            <Star className="w-5 h-5 text-[#D4AF37]" />
            Customer Reviews Moderation
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Approve, moderate, feature, or remove customer feedback and testimonials.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#EAE3D6] bg-white hover:bg-stone-50 text-xs font-semibold text-charcoal transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
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
            placeholder="Search reviews by customer name, product, or review text..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
          />
        </div>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium focus:outline-hidden focus:border-[#D4AF37]"
        >
          <option value="all">All Star Ratings</option>
          <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
          <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
          <option value="3">⭐⭐⭐ (3 Stars)</option>
          <option value="2">⭐⭐ (2 Stars)</option>
          <option value="1">⭐ (1 Star)</option>
        </select>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="py-20 text-center text-taupe text-sm">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-20 text-center space-y-2 bg-white rounded-2xl border border-[#EAE3D6]">
          <MessageSquare className="w-8 h-8 text-taupe mx-auto opacity-50" />
          <p className="font-serif text-base font-bold text-charcoal">No reviews found</p>
          <p className="text-xs text-taupe">Customer ratings from the storefront will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReviews.map((r) => {
            const isVisible = r.isVisible !== false;
            return (
              <div
                key={r.id}
                className={`bg-white rounded-2xl border p-5 space-y-3 flex flex-col justify-between transition-all ${
                  isVisible ? 'border-[#EAE3D6] shadow-xs' : 'border-stone-300 bg-stone-50 opacity-70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#D4AF37]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-[#D4AF37]' : 'text-stone-300'}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {r.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                          Featured
                        </span>
                      )}
                      {r.verified && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-charcoal font-medium leading-relaxed italic">
                    &quot;{r.review}&quot;
                  </p>

                  <div className="pt-2">
                    <p className="text-xs font-bold text-charcoal">{r.customerName}</p>
                    {r.productName && (
                      <p className="text-[11px] text-[#9B7B1B] font-medium">
                        On: {r.productName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-[#F0ECE1] text-xs">
                  <button
                    onClick={() => handleToggleFeatured(r)}
                    className={`flex items-center gap-1 font-semibold ${
                      r.isFeatured ? 'text-purple-700' : 'text-taupe hover:text-charcoal'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {r.isFeatured ? 'Featured' : 'Feature on Home'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVisibility(r)}
                      className={`p-1.5 rounded-lg font-semibold ${
                        isVisible
                          ? 'text-stone-600 hover:bg-stone-100'
                          : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                      }`}
                      title={isVisible ? 'Hide from store' : 'Unhide on store'}
                    >
                      {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
