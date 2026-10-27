'use client';

// ============================================
// paint_n_meraki — REVIEWS & TESTIMONIALS PAGE
// Live API Synchronization & Customer Submission
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { demoReviews } from '@/lib/data/products';
import Rating from '@/components/ui/Rating';
import { Star, Sparkles, CheckCircle, MessageSquare, Plus, X, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Review } from '@/types';

const ratingLabels: Record<number, string> = {
  1: 'Disappointing',
  2: 'Fair',
  3: 'Good, meets expectations',
  4: 'Very Good, loved the quality',
  5: 'Masterpiece! Absolutely Loved It ✦',
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | '5' | '4' | '3' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [productName, setProductName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLiveReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReviews(data);
        }
      }
    } catch (e) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveReviews();
  }, []);

  // Compute rating metrics
  const totalCount = reviews.length;
  const averageRating = totalCount > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount : 5;

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rounded as keyof typeof counts] = (counts[rounded as keyof typeof counts] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (activeFilter === '5') result = result.filter((r) => Math.round(r.rating) === 5);
    else if (activeFilter === '4') result = result.filter((r) => Math.round(r.rating) === 4);
    else if (activeFilter === '3') result = result.filter((r) => Math.round(r.rating) === 3);
    else if (activeFilter === 'verified') result = result.filter((r) => r.verified);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.review.toLowerCase().includes(q) ||
          (r.productName && r.productName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [reviews, activeFilter, searchQuery]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || reviewerName.trim().length < 2) {
      toast.error('Please enter your name');
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length < 5) {
      toast.error('Please write a brief review (minimum 5 characters)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: reviewerName.trim(),
          rating,
          review: reviewText.trim(),
          productName: productName.trim() || undefined,
          verified: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Thank you! Your review has been submitted.');
        if (data.review) {
          setReviews((prev) => [data.review, ...prev]);
        }
        setModalOpen(false);
        setReviewText('');
        setProductName('');
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-20 sm:pb-12">
      {/* Header Banner */}
      <div className="bg-white border-b border-beige/30">
        <div className="container-custom py-10 sm:py-14 text-center max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-dusty-rose font-medium mb-2">♡ Customer Testimonials</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal mb-3">
            What Our Customers Say
          </h1>
          <p className="text-sm text-taupe leading-relaxed">
            Real feedback from collectors and art enthusiasts across India who cherish Paint n Meraki handcrafted resin pieces.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal hover:bg-black text-white text-xs font-semibold shadow-xs transition-all transform hover:scale-102"
            >
              <Plus size={14} className="text-[#D4AF37]" />
              Write a Review
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 max-w-4xl mx-auto space-y-8">
        {loading ? (
          <div className="py-20 text-center text-taupe text-sm">
            <div className="w-7 h-7 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading customer reviews...
          </div>
        ) : totalCount === 0 ? (
          /* Empty / Fresh Store State */
          <div className="bg-white rounded-3xl border border-beige/30 p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF6EE] text-[#9B7B1B] border border-[#D4AF37]/30 flex items-center justify-center mx-auto">
              <Sparkles size={28} />
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">Be the First to Review</h3>
            <p className="text-xs sm:text-sm text-taupe leading-relaxed">
              We take immense pride in every handcrafted resin piece. If you own a Paint n Meraki artwork, share your thoughts and photos with our community!
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-charcoal hover:bg-black text-white text-xs font-semibold shadow-xs transition-all transform hover:scale-102"
            >
              <Plus size={14} className="text-[#D4AF37]" />
              Write the First Review
            </button>
          </div>
        ) : (
          <>
            {/* Rating Breakdown & Stats */}
            <div className="bg-white rounded-3xl border border-beige/30 p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Overall Score */}
              <div className="text-center md:border-r md:border-beige/30 md:pr-6">
                <p className="font-heading text-5xl font-bold text-charcoal">{averageRating.toFixed(1)}</p>
                <div className="flex justify-center my-2">
                  <Rating value={averageRating} size="md" />
                </div>
                <p className="text-xs text-taupe">Based on {totalCount} verified reviews</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                  <CheckCircle size={13} /> 100% Authentic Feedback
                </div>
              </div>

              {/* Star Distribution Bars */}
              <div className="space-y-2 md:col-span-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = starCounts[star as keyof typeof starCounts] || 0;
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="w-12 text-taupe font-medium flex items-center gap-1">
                        {star} <Star size={12} className="fill-[#D4AF37] text-[#D4AF37]" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B89628] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-taupe font-mono text-[11px]">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-beige/30 shadow-2xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Reviews' },
                  { id: '5', label: '5 Stars ★' },
                  { id: '4', label: '4 Stars ★' },
                  { id: '3', label: '3 Stars ★' },
                  { id: 'verified', label: 'Verified Only' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      activeFilter === tab.id
                        ? 'bg-dusty-rose text-white shadow-2xs'
                        : 'bg-cream/40 text-taupe hover:bg-cream hover:text-charcoal'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reviews..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF6EE] border border-beige/40 rounded-xl text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="bg-white rounded-3xl border border-beige/30 p-12 text-center space-y-3">
                  <MessageSquare className="w-8 h-8 text-taupe mx-auto opacity-50" />
                  <p className="font-heading text-lg font-semibold text-charcoal">No reviews match your filter</p>
                  <p className="text-xs text-taupe">Try selecting &quot;All Reviews&quot; or clear your search term.</p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl border border-beige/30 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FAF6EE] to-[#F3EBDD] border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                          <span className="font-serif font-bold text-[#9B7B1B] text-sm">
                            {review.customerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-charcoal">{review.customerName}</p>
                            {review.verified && (
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                                ✓ Verified Purchase
                              </span>
                            )}
                            {review.isFeatured && (
                              <span className="text-[10px] text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-taupe">{review.date || 'Recent Customer'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[#D4AF37]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.round(review.rating) ? 'fill-[#D4AF37]' : 'text-stone-300'}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-charcoal/85 leading-relaxed italic pt-1">
                      &quot;{review.review}&quot;
                    </p>

                    {review.productName && (
                      <div className="pt-2 border-t border-beige/20 flex items-center gap-1.5 text-xs text-[#9B7B1B]">
                        <Sparkles size={12} />
                        <span className="font-medium">Product: {review.productName}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Customer Write Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE3D6] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EAE3D6] flex items-center justify-between bg-[#FDFBF7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#9B7B1B]">
                  <Star size={16} className="fill-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-charcoal">Share Your Review</h3>
                  <p className="text-[11px] text-taupe">Paint n Meraki Community Feedback</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-200/60 text-taupe transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                  Star Rating <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D6] bg-[#FAF6EE]/50 text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Product / Art Piece (Optional)
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Geode Wall Clock or Resin Pooja Thali"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D6] bg-[#FAF6EE]/50 text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Your Review & Experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us what you liked about the finish, colors, packaging, and your overall experience..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE3D6] bg-[#FAF6EE]/50 text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37] focus:bg-white transition-all leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-taupe hover:text-charcoal transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal hover:bg-black text-white text-xs font-semibold shadow-xs disabled:opacity-60 transition-all"
                >
                  {submitting ? (
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
