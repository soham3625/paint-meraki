'use client';

// ============================================
// paint_n_meraki — SEARCH OVERLAY
// ============================================

import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { searchProducts, formatPrice } from '@/lib/data/products';
import type { Product } from '@/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      setResults(searchProducts(query));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] animate-fade-in" role="dialog" aria-label="Search products">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-2xl mx-auto mt-20 sm:mt-32 px-4">
        <div className="bg-white rounded-2xl shadow-elevated overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-5 border-b border-beige/50">
            <Search size={20} className="text-taupe flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 px-4 py-4 text-base text-charcoal placeholder:text-warm-gray bg-transparent outline-none font-body"
            />
            <button
              onClick={onClose}
              className="p-2 text-taupe hover:text-charcoal transition-colors"
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-taupe text-sm">No products found for &ldquo;{query}&rdquo;</p>
                <p className="text-warm-gray text-xs mt-1">Try a different search term</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="p-3">
                <p className="text-xs text-taupe px-3 py-2">{results.length} result{results.length > 1 ? 's' : ''} found</p>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream/50 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-lg bg-beige/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-dusty-rose/20 to-blush/30 flex items-center justify-center">
                        <span className="text-[10px] text-taupe font-medium">IMG</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">{product.name}</p>
                      <p className="text-xs text-taupe">{product.category} · {product.sizes[0]?.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-charcoal">{formatPrice(product.price)}</p>
                      <ArrowRight size={14} className="text-dusty-rose opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {query.length < 2 && (
              <div className="p-6">
                <p className="text-xs text-taupe uppercase tracking-wider mb-3">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Resin Clock', 'Pooja Thali', 'Photo Frame', 'Geode', 'Custom'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 rounded-full bg-cream/60 text-sm text-taupe hover:text-charcoal hover:bg-beige/50 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
