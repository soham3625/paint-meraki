'use client';

// ============================================
// paint_n_meraki — ADMIN PRODUCT LIST
// ============================================

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CheckSquare,
  Square,
} from 'lucide-react';
import { formatPrice } from '@/lib/data/products';
import toast from 'react-hot-toast';
import type { Product, Category } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'stock-asc'>('newest');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);
      if (pRes.ok) setProducts(await pRes.json());
      if (cRes.ok) setCategories(await cRes.json());
    } catch (e) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      result = result.filter((p) => (p.status || 'ACTIVE') === selectedStatus);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'stock-asc':
        result.sort((a, b) => a.stock - b.stock);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Bulk Select Toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete Single Product
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted successfully');
        setProducts((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
        setSelectedIds((prev) => prev.filter((i) => i !== id));
      } else {
        toast.error('Failed to delete product');
      }
    } catch (e) {
      toast.error('Error deleting product');
    } finally {
      setDeleteModalId(null);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

    for (const id of selectedIds) {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    }
    toast.success(`${selectedIds.length} products deleted`);
    setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal">
            Product Catalog
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Manage handcrafted resin art pieces, prices, sizes, and stock availability.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2 rounded-xl border border-[#EAE3D6] bg-white hover:bg-stone-50 text-charcoal transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-xs shadow-md shadow-gold/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE3D6] shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-taupe absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, category..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium focus:outline-hidden focus:border-[#D4AF37]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium focus:outline-hidden focus:border-[#D4AF37]"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium focus:outline-hidden focus:border-[#D4AF37]"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#2A241F] text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-md animate-fadeIn text-xs">
          <span className="font-semibold">
            {selectedIds.length} product(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-medium transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product Table Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-taupe text-sm">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="font-serif text-lg text-charcoal font-bold">No products match your criteria</p>
            <p className="text-xs text-taupe">Try clearing filters or search terms.</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#D4AF37] text-white"
            >
              <Plus className="w-4 h-4" /> Add First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F5EE] border-b border-[#EAE3D6] text-taupe uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-taupe hover:text-charcoal"
                    >
                      {selectedIds.length === filteredProducts.length ? (
                        <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Stock</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Badges</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isLowStock = p.stock <= 3;
                  const thumb = p.thumbnail || (p.images && p.images[0]) || '/images/categories/clock-2.jpg';

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#FDFBF7] transition-colors ${
                        isSelected ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(p.id)}
                          className="text-taupe hover:text-charcoal"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Product Thumbnail & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-[#EAE3D6] shrink-0">
                            <Image
                              src={thumb}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="font-bold text-charcoal hover:text-[#9B7B1B] transition-colors line-clamp-1"
                            >
                              {p.name}
                            </Link>
                            <span className="text-[10px] text-taupe block font-mono">
                              SKU: {p.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-charcoal block">
                          {formatPrice(p.price)}
                        </span>
                        {p.compareAtPrice && (
                          <span className="text-[10px] text-taupe line-through block">
                            {formatPrice(p.compareAtPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isLowStock
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stock} in stock
                        </span>
                        {p.sizes && p.sizes.length > 1 && (
                          <span className="block text-[10px] text-taupe mt-0.5">
                            {p.sizes.length} sizes
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800'
                              : p.status === 'OUT_OF_STOCK'
                              ? 'bg-red-100 text-red-800'
                              : p.status === 'ARCHIVED'
                              ? 'bg-stone-200 text-stone-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.status || 'ACTIVE'}
                        </span>
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.featured && (
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[9px] font-bold">
                              Featured
                            </span>
                          )}
                          {p.bestSeller && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-bold">
                              Bestseller
                            </span>
                          )}
                          {p.customizable && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[9px] font-bold">
                              Customizable
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/product/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-taupe hover:text-charcoal hover:bg-stone-100"
                            title="View on Store"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteModalId(p.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#EAE3D6]">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-charcoal">Delete Product?</h3>
              <p className="text-xs text-taupe">
                This action cannot be undone and will permanently remove this item from the store.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#EAE3D6] text-xs font-semibold text-charcoal hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteModalId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
