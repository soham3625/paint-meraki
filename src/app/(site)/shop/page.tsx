'use client';

// ============================================
// paint_n_meraki — SHOP PAGE (All Products)
// Dynamic storefront synchronized with Admin Panel
// ============================================

import { useState, useMemo, useEffect } from 'react';
import { products as defaultProducts, categories as defaultCategories, formatPrice } from '@/lib/data/products';
import ProductCard from '@/components/product/ProductCard';
import { SlidersHorizontal, X, ChevronDown, RefreshCw } from 'lucide-react';
import type { Product, Category } from '@/types';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular';

export default function ShopPage() {
  const [productsList, setProductsList] = useState<Product[]>(defaultProducts);
  const [categoriesList, setCategoriesList] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFeatured, setShowFeatured] = useState(false);
  const [showBestseller, setShowBestseller] = useState(false);

  useEffect(() => {
    async function fetchLiveShopData() {
      try {
        setLoading(true);
        const [pRes, cRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/categories'),
        ]);
        if (pRes.ok) {
          const prods = await pRes.json();
          if (Array.isArray(prods) && prods.length > 0) {
            setProductsList(prods);
          }
        }
        if (cRes.ok) {
          const cats = await cRes.json();
          if (Array.isArray(cats) && cats.length > 0) {
            setCategoriesList(cats);
          }
        }
      } catch (err) {
        // Fallback to defaults
      } finally {
        setLoading(false);
      }
    }

    fetchLiveShopData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = productsList.filter((p) => (p.status || 'ACTIVE') !== 'DRAFT');

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    // Price filter
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Featured filter
    if (showFeatured) result = result.filter((p) => p.featured);
    if (showBestseller) result = result.filter((p) => p.bestSeller);

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [productsList, selectedCategory, sortBy, priceRange, showFeatured, showBestseller]);

  return (
    <div className="pb-16 sm:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-beige/30">
        <div className="container-custom py-8 sm:py-12">
          <p className="text-xs tracking-[0.2em] uppercase text-dusty-rose font-medium mb-2">paint_n_meraki</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal mb-2">Shop All Products</h1>
          <p className="text-taupe max-w-lg">
            Discover our complete collection of handcrafted resin art, personalised decor and unique creations.
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all'
                ? 'bg-charcoal text-ivory'
                : 'bg-beige/30 text-taupe hover:bg-beige/50'
                }`}
            >
              All Products
            </button>
            {categoriesList.filter(c => c.slug !== 'custom-creations').map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.slug
                  ? 'bg-charcoal text-ivory'
                  : 'bg-beige/30 text-taupe hover:bg-beige/50'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-beige/30 text-sm text-taupe hover:bg-beige/50 transition-colors sm:hidden"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none px-4 py-2 pr-8 rounded-full bg-beige/30 text-sm text-taupe cursor-pointer outline-none hover:bg-beige/50 transition-colors"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="popular">Popular</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Panel (Desktop sidebar / Mobile drawer) */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-beige/30 p-5 mb-6 sm:hidden animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-base font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-taupe hover:text-charcoal">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFeatured}
                  onChange={(e) => setShowFeatured(e.target.checked)}
                  className="accent-dusty-rose"
                />
                <span className="text-sm text-taupe">Featured Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBestseller}
                  onChange={(e) => setShowBestseller(e.target.checked)}
                  className="accent-dusty-rose"
                />
                <span className="text-sm text-taupe">Bestsellers Only</span>
              </label>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-taupe">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-accent text-2xl text-dusty-rose/50 mb-2">No products found</p>
            <p className="text-sm text-taupe">Try adjusting your filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setShowFeatured(false);
                setShowBestseller(false);
                setPriceRange([0, 10000]);
              }}
              className="btn-secondary mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
