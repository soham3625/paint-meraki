'use client';

// ============================================
// paint_n_meraki — WISHLIST PAGE
// ============================================

import Link from 'next/link';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import ProductCard from '@/components/product/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center pb-24 sm:pb-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-light/50 flex items-center justify-center">
          <Heart size={32} className="text-dusty-rose/40" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-charcoal mb-2">Your Wishlist</h1>
        <p className="text-taupe mb-6">Save the pieces you love.</p>
        <Link href="/shop" className="btn-primary">
          Explore Collection <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 sm:pb-0">
      <div className="bg-white border-b border-beige/30">
        <div className="container-custom py-6 sm:py-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-charcoal">
            Your Wishlist <span className="text-dusty-rose">♡</span>
          </h1>
          <p className="text-taupe text-sm">{items.length} saved item{items.length > 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="container-custom py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <ProductCard key={item.product.id} product={item.product} />
          ))}
        </div>
      </div>
    </div>
  );
}
