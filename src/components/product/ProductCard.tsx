'use client';

// ============================================
// paint_n_meraki — PRODUCT CARD
// ============================================

import Link from 'next/link';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { formatPrice } from '@/lib/data/products';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import type { Product } from '@/types';
import Rating from '@/components/ui/Rating';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0], 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="product-card group block"
    >
      <div className="relative">
        {/* Image */}
        <div className="product-card-image rounded-2xl bg-beige/30 aspect-square relative overflow-hidden">
          {product.thumbnail && !product.thumbnail.includes('placeholder') ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cream via-beige/40 to-blush/30 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-dusty-rose/10 flex items-center justify-center">
                  <span className="font-accent text-dusty-rose text-lg">PM</span>
                </div>
                <p className="text-[10px] text-taupe/60 max-w-24 px-2">{product.name}</p>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.bestSeller && <span className="badge badge-bestseller">Bestseller</span>}
            {product.compareAtPrice && <span className="badge badge-sale">Sale</span>}
            {product.customizable && <span className="badge badge-custom">Customisable</span>}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 z-10"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={16}
              className={isInWishlist ? 'text-dusty-rose fill-dusty-rose' : 'text-taupe'}
            />
          </button>

          {/* Hover Overlay */}
          <div className="product-card-overlay absolute inset-0 bg-charcoal/10 backdrop-blur-[1px] rounded-2xl flex items-end justify-center pb-4 gap-2 z-10">
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-charcoal text-ivory text-xs font-medium rounded-full flex items-center gap-1.5 hover:bg-charcoal/90 transition-colors"
            >
              <ShoppingBag size={13} /> Add to Cart
            </button>
            <span className="px-4 py-2 bg-white/90 text-charcoal text-xs font-medium rounded-full flex items-center gap-1.5 hover:bg-white transition-colors">
              <Eye size={13} /> View Details
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 px-1">
          <p className="text-xs text-dusty-rose font-medium mb-0.5">{product.category}</p>
          <h3 className="font-heading text-sm sm:text-base font-semibold text-charcoal leading-snug group-hover:text-dusty-rose transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-taupe mt-0.5 line-clamp-1">{product.shortDescription}</p>
          <div className="flex items-center gap-2 mt-2">
            <Rating value={product.rating} size="sm" />
            <span className="text-[11px] text-taupe">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-heading text-base font-semibold text-charcoal">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-taupe line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          {product.sizes.length > 1 && (
            <p className="text-[11px] text-taupe mt-1">
              {product.sizes.map(s => s.label).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
