'use client';

// ============================================
// paint_n_meraki — PRODUCT DETAIL PAGE
// Dynamic storefront synchronized with Admin Panel
// ============================================

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  getProductBySlug,
  getProductsByCategory,
  formatPrice,
  demoReviews as defaultReviews,
  products as defaultProducts,
} from '@/lib/data/products';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import Rating from '@/components/ui/Rating';
import ProductCard from '@/components/product/ProductCard';
import { Heart, ShoppingBag, Zap, ChevronRight, Minus, Plus, Truck, Shield, RotateCcw, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product, ProductSize, Review, BusinessSettings } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const initialProduct = getProductBySlug(slug) || defaultProducts.find((p) => p.slug === slug);
  const [product, setProduct] = useState<Product | undefined>(initialProduct);
  const [allProducts, setAllProducts] = useState<Product[]>(defaultProducts);
  const [reviewsList, setReviewsList] = useState<Review[]>(defaultReviews);
  const [settings, setSettings] = useState<Partial<BusinessSettings>>({
    whatsappNumber: '919878541310',
    freeShippingThreshold: 2000,
    processingTime: '5-7 business days',
    deliveryTime: '3-5 business days',
  });

  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'shipping' | 'reviews'>('description');
  const [customText, setCustomText] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => (product ? s.isInWishlist(product.id) : false));

  useEffect(() => {
    async function fetchLiveProductData() {
      try {
        const [pRes, rRes, sRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/reviews'),
          fetch('/api/admin/settings'),
        ]);

        if (pRes.ok) {
          const prods: Product[] = await pRes.json();
          if (Array.isArray(prods) && prods.length > 0) {
            setAllProducts(prods);
            const found = prods.find((p) => p.slug === slug || p.id === slug);
            if (found) {
              setProduct(found);
              if (found.sizes && found.sizes.length > 0) {
                setSelectedSize(found.sizes[0]);
              }
              if (found.colors && found.colors.length > 0) {
                setSelectedColor(found.colors[0]);
              }
            }
          }
        }

        if (rRes.ok) {
          const revs: Review[] = await rRes.json();
          if (Array.isArray(revs) && revs.length > 0) {
            setReviewsList(revs.filter((r) => !r.status || r.status === 'APPROVED'));
          }
        }

        if (sRes.ok) {
          const sett = await sRes.json();
          if (sett) setSettings(sett);
        }
      } catch (err) {
        // Fallback
      }
    }

    fetchLiveProductData();
  }, [slug]);

  useEffect(() => {
    if (product && !selectedSize && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    if (product && !selectedColor && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product, selectedSize, selectedColor]);

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <p className="font-accent text-3xl text-dusty-rose/50 mb-3">Product Not Found</p>
        <p className="text-taupe mb-6">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const relatedProducts = allProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id && (p.status || 'ACTIVE') !== 'DRAFT')
    .slice(0, 4);

  const productReviews = reviewsList
    .filter((r) => r.productSlug === product.slug || r.productName === product.name || (r.status === 'APPROVED' && (!r.productSlug || r.productSlug === '')))
    .slice(0, 5);

  const currentPrice = selectedSize?.price ?? product.price;

  const handleAddToCart = () => {
    const sizeToUse = selectedSize || product.sizes[0] || { label: 'Standard', value: 'standard', price: product.price, stock: product.stock };
    addToCart(product, sizeToUse, quantity, {
      color: selectedColor || undefined,
      text: customText || undefined,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkout';
  };

  const whatsappMessage = encodeURIComponent(
    `Hi paint_n_meraki, I would like to know more about "${product.name}" (${selectedSize?.label || 'Standard'}, ₹${currentPrice}).`
  );
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber || '919878541310'}?text=${whatsappMessage}`;

  return (
    <div className="pb-16 sm:pb-0">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-beige/30">
        <div className="container-custom py-3">
          <div className="flex items-center gap-2 text-xs text-taupe">
            <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
            <ChevronRight size={12} />
            <Link href={`/shop/${product.categorySlug}`} className="hover:text-charcoal transition-colors">{product.category}</Link>
            <ChevronRight size={12} />
            <span className="text-charcoal truncate max-w-32">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ===== IMAGE GALLERY ===== */}
          <div>
            {/* Main Image */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-cream via-beige/30 to-blush/20 aspect-square flex items-center justify-center mb-3 relative shadow-sm">
              {product.images && product.images[selectedImageIndex] ? (
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = product.thumbnail || '/images/categories/clock-2.jpg';
                  }}
                />
              ) : (
                <div className="text-center p-8">
                  <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-dusty-rose/10 flex items-center justify-center">
                    <span className="font-accent text-dusty-rose text-3xl">PM</span>
                  </div>
                  <p className="font-heading text-charcoal/40">{product.name}</p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((imgSrc, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors relative ${selectedImageIndex === i ? 'border-dusty-rose' : 'border-beige/50'
                      }`}
                  >
                    <img
                      src={imgSrc}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== PRODUCT INFO ===== */}
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.bestSeller && <span className="badge badge-bestseller">Bestseller</span>}
              {product.customizable && <span className="badge badge-custom">Customisable</span>}
              {product.compareAtPrice && <span className="badge badge-sale">Sale</span>}
              {product.stock <= 0 && <span className="bg-red-100 text-red-700 text-xs px-2.5 py-0.5 rounded-full font-medium">Out of Stock</span>}
              {product.stock > 0 && product.stock <= 3 && <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Only {product.stock} Left!</span>}
            </div>

            <p className="text-xs text-dusty-rose font-medium tracking-wider uppercase mb-1">{product.category}</p>
            <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-charcoal mb-2">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <Rating value={product.rating || 5} size="sm" showValue />
              <span className="text-sm text-taupe">({product.reviewCount || productReviews.length || 1} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-heading text-3xl font-semibold text-charcoal">{formatPrice(currentPrice)}</span>
              {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                <span className="text-lg text-taupe line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </div>

            <p className="text-taupe leading-relaxed mb-6">{product.shortDescription || product.description}</p>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5">
                <label className="input-label">Select Size / Variant</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.value || size.label}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${selectedSize?.label === size.label || selectedSize?.value === size.value
                          ? 'border-charcoal bg-charcoal text-ivory'
                          : 'border-beige/50 text-taupe hover:border-charcoal'
                        }`}
                    >
                      {size.label} — {formatPrice(size.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-5">
                <label className="input-label">Color Theme: <span className="text-charcoal font-medium">{selectedColor || product.colors[0]}</span></label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${selectedColor === color
                          ? 'border-charcoal bg-charcoal/5 text-charcoal font-medium'
                          : 'border-beige/50 text-taupe hover:border-charcoal/30'
                        }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Text (for customizable products) */}
            {product.customizable && (
              <div className="mb-5">
                <label className="input-label">Personalisation Text / Name (Optional)</label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g., Names, date (e.g. Astha & Rohan 24-11-2025)"
                  className="input-field"
                  maxLength={60}
                />
                <p className="text-xs text-taupe mt-1">Our artist will handcraft your text into the piece</p>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="input-label">Quantity</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border border-beige/50 flex items-center justify-center text-taupe hover:bg-beige/30 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 h-10 flex items-center justify-center font-medium text-charcoal">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 rounded-xl border border-beige/50 flex items-center justify-center text-taupe hover:bg-beige/30 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={16} /> {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="btn-rose flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={16} /> Buy Now
              </button>
              <button
                onClick={() => {
                  toggleWishlist(product);
                  toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
                }}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${isInWishlist
                    ? 'border-dusty-rose bg-dusty-rose/10'
                    : 'border-beige/50 hover:border-dusty-rose'
                  }`}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} className={isInWishlist ? 'text-dusty-rose fill-dusty-rose' : 'text-taupe'} />
              </button>
            </div>

            {/* Trust Features */}
            <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-cream/30 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-taupe">
                <Truck size={14} className="text-dusty-rose" /> Free shipping above ₹{settings.freeShippingThreshold || 2000}
              </div>
              <div className="flex items-center gap-2 text-xs text-taupe">
                <Shield size={14} className="text-dusty-rose" /> 100% Quality Guaranteed
              </div>
              <div className="flex items-center gap-2 text-xs text-taupe">
                <RotateCcw size={14} className="text-dusty-rose" /> Safe transit guarantee
              </div>
              <div className="flex items-center gap-2 text-xs text-taupe">
                <Package size={14} className="text-dusty-rose" /> Luxury secure packaging
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-taupe hover:text-charcoal transition-colors py-2"
            >
              💬 Ask about this product on WhatsApp
            </a>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="mt-12 sm:mt-16">
          <div className="flex gap-1 border-b border-beige/30 overflow-x-auto hide-scrollbar">
            {(['description', 'details', 'shipping', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap capitalize border-b-2 transition-colors ${activeTab === tab
                    ? 'border-charcoal text-charcoal'
                    : 'border-transparent text-taupe hover:text-charcoal'
                  }`}
              >
                {tab === 'reviews' ? `Reviews (${productReviews.length})` : tab}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="max-w-3xl">
                <p className="text-taupe leading-relaxed whitespace-pre-line">{product.description || product.shortDescription}</p>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="max-w-3xl space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-taupe font-medium">Material</p>
                    <p className="text-charcoal">{product.material || 'Premium epoxy resin on solid base'}</p>
                  </div>
                  <div>
                    <p className="text-taupe font-medium">Dimensions</p>
                    <p className="text-charcoal">{product.dimensions || 'Handcrafted dimensions'}</p>
                  </div>
                  <div>
                    <p className="text-taupe font-medium">Weight</p>
                    <p className="text-charcoal">{product.weight || 'Varies by size'}</p>
                  </div>
                  <div>
                    <p className="text-taupe font-medium">SKU</p>
                    <p className="text-charcoal">{product.sku || 'PM-ART-001'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-taupe font-medium text-sm mb-1">Care Instructions</p>
                  <p className="text-sm text-charcoal/80">{product.careInstructions || 'Wipe clean gently with a dry microfiber cloth. Keep away from direct harsh sunlight.'}</p>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-3xl">
                <p className="text-taupe leading-relaxed mb-4">{product.shippingInfo || `Carefully packed in multiple layers of bubble wrap and protective casing. Free shipping across India on orders above ₹${settings.freeShippingThreshold || 2000}.`}</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Truck size={16} className="text-dusty-rose mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">Processing Time</p>
                      <p className="text-sm text-taupe">{settings.processingTime || '5-7 business days'} (handmade to order)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package size={16} className="text-dusty-rose mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">Delivery Time</p>
                      <p className="text-sm text-taupe">{settings.deliveryTime || '3-5 business days'} after dispatch</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <p className="font-heading text-3xl font-semibold text-charcoal">{product.rating || 5.0}</p>
                    <Rating value={product.rating || 5.0} size="sm" />
                    <p className="text-xs text-taupe mt-1">{productReviews.length} reviews</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {productReviews.length > 0 ? (
                    productReviews.map((review) => (
                      <div key={review.id} className="p-4 bg-cream/30 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Rating value={review.rating} size="sm" />
                            {review.verified && <span className="text-[10px] text-success font-medium">✓ Verified</span>}
                          </div>
                          <span className="text-xs text-taupe">{review.date || 'Recent'}</span>
                        </div>
                        <p className="text-sm text-charcoal/80 mb-2">{review.review}</p>
                        <p className="text-xs text-taupe">— {review.customerName}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-taupe italic">Be the first to review this handcrafted masterpiece!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== RELATED PRODUCTS ===== */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
