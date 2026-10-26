'use client';

// ============================================
// paint_n_meraki — REVIEWS PAGE
// ============================================

import { demoReviews } from '@/lib/data/products';
import Rating from '@/components/ui/Rating';

export default function ReviewsPage() {
  const averageRating = demoReviews.reduce((acc, r) => acc + r.rating, 0) / demoReviews.length;

  return (
    <div className="pb-20 sm:pb-0">
      <div className="bg-white border-b border-beige/30">
        <div className="container-custom py-8 sm:py-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-dusty-rose font-medium mb-2">♡ Testimonials</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal mb-2">What Our Customers Say</h1>
          <p className="text-taupe">Real reviews from people who love handmade art.</p>
        </div>
      </div>

      <div className="container-custom py-8 max-w-4xl mx-auto">
        {/* Rating Summary */}
        <div className="bg-white rounded-xl border border-beige/30 p-6 mb-8 text-center">
          <p className="font-heading text-4xl font-semibold text-charcoal">{averageRating.toFixed(1)}</p>
          <Rating value={averageRating} size="md" />
          <p className="text-sm text-taupe mt-1">Based on {demoReviews.length} reviews</p>
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          {demoReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-beige/30 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-dusty-rose/10 flex items-center justify-center">
                    <span className="font-accent text-dusty-rose text-sm">{review.customerName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{review.customerName}</p>
                    {review.verified && <p className="text-[10px] text-success font-medium">✓ Verified Purchase</p>}
                  </div>
                </div>
                <span className="text-xs text-taupe">{review.date}</span>
              </div>
              <Rating value={review.rating} size="sm" />
              <p className="text-sm text-charcoal/80 mt-3 leading-relaxed">{review.review}</p>
              {review.productName && (
                <p className="text-xs text-dusty-rose mt-2">Product: {review.productName}</p>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-taupe/50 mt-8 italic">* Demo reviews for development purposes</p>
      </div>
    </div>
  );
}
