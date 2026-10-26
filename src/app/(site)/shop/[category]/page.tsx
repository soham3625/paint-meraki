'use client';

// ============================================
// paint_n_meraki — CATEGORY PAGE
// Dynamic storefront synchronized with Admin Panel
// ============================================

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  products as defaultProducts,
  categories as defaultCategories,
  getCategoryBySlug,
} from '@/lib/data/products';
import ProductCard from '@/components/product/ProductCard';
import { ArrowRight, ChevronRight } from 'lucide-react';
import type { Product, Category } from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.category as string;

  const [productsList, setProductsList] = useState<Product[]>(defaultProducts);
  const [categoriesList, setCategoriesList] = useState<Category[]>(defaultCategories);

  useEffect(() => {
    async function fetchLiveCategoryData() {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);
        if (pRes.ok) {
          const prods = await pRes.json();
          if (Array.isArray(prods) && prods.length > 0) setProductsList(prods);
        }
        if (cRes.ok) {
          const cats = await cRes.json();
          if (Array.isArray(cats) && cats.length > 0) setCategoriesList(cats);
        }
      } catch (err) {
        // Fallback to defaults
      }
    }

    fetchLiveCategoryData();
  }, []);

  const category = categoriesList.find((c) => c.slug === slug) || getCategoryBySlug(slug);
  const categoryProducts = productsList.filter(
    (p) => p.categorySlug === slug && (p.status || 'ACTIVE') !== 'DRAFT'
  );

  if (slug === 'custom-creations') {
    return (
      <div className="pb-16 sm:pb-0">
        <div className="bg-white border-b border-beige/30">
          <div className="container-custom py-8 sm:py-12">
            <div className="flex items-center gap-2 text-xs text-taupe mb-4">
              <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
              <ChevronRight size={12} />
              <Link href="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
              <ChevronRight size={12} />
              <span className="text-charcoal">Custom Creations</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal mb-3">Custom Creations</h1>
            <p className="text-taupe max-w-lg mb-6">
              Made uniquely for you — tell us your idea and we&apos;ll bring it to life.
            </p>
            <Link href="/custom-order" className="btn-primary">
              Request Custom Order <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="font-heading text-2xl text-charcoal mb-2">Category Not Found</h1>
        <p className="text-taupe mb-6">The category you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="pb-16 sm:pb-0">
      <div className="bg-white border-b border-beige/30">
        <div className="container-custom py-8 sm:py-12">
          <div className="flex items-center gap-2 text-xs text-taupe mb-4">
            <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
            <ChevronRight size={12} />
            <span className="text-charcoal">{category.name}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal mb-2">{category.name}</h1>
          <p className="text-taupe max-w-lg">{category.description}</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <p className="text-sm text-taupe mb-6">{categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''}</p>
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-accent text-2xl text-dusty-rose/50 mb-2">Coming Soon</p>
            <p className="text-sm text-taupe">New products will be added shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
