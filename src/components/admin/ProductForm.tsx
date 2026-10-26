'use client';

// ============================================
// paint_n_meraki — REUSABLE PRODUCT FORM
// Multi-size, Image Gallery, Pricing & Details
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  Sparkles,
  Save,
  Eye,
  Check,
  X,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product, Category, ProductSize } from '@/types';

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [categorySlug, setCategorySlug] = useState(initialData?.categorySlug || 'resin-clocks');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');

  // Pricing & Stock
  const [price, setPrice] = useState<number>(initialData?.price || 2499);
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>(initialData?.compareAtPrice || '');
  const [costPrice, setCostPrice] = useState<number | ''>(initialData?.costPrice || '');
  const [stock, setStock] = useState<number>(initialData?.stock || 10);
  const [sku, setSku] = useState(initialData?.sku || '');

  // Dynamic Sizes
  const [sizes, setSizes] = useState<ProductSize[]>(
    initialData?.sizes && initialData.sizes.length > 0
      ? initialData.sizes
      : [
          { label: '10 inch', value: '10-inch', price: 2499, stock: 5 },
          { label: '12 inch', value: '12-inch', price: 3100, stock: 5 },
          { label: '14 inch', value: '14-inch', price: 3800, stock: 3 },
        ]
  );

  // Images & Gallery
  const [images, setImages] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : ['/images/categories/clock-2.jpg']
  );
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Specs & Options
  const [material, setMaterial] = useState(initialData?.material || 'High-gloss Epoxy Resin on Solid MDF Base');
  const [dimensions, setDimensions] = useState(initialData?.dimensions || '12 x 12 inches');
  const [weight, setWeight] = useState(initialData?.weight || '1.2 kg');
  const [careInstructions, setCareInstructions] = useState(
    initialData?.careInstructions ||
      'Clean with a soft, dry or slightly damp microfiber cloth. Do not use chemical cleaners or abrasive pads.'
  );
  const [shippingInfo, setShippingInfo] = useState(
    initialData?.shippingInfo || 'Dispatched in 4-6 business days. Free shipping across India.'
  );

  // Status & Badges
  const [status, setStatus] = useState<string>(initialData?.status || 'ACTIVE');
  const [featured, setFeatured] = useState<boolean>(initialData?.featured || false);
  const [bestSeller, setBestSeller] = useState<boolean>(initialData?.bestSeller || false);
  const [isNewArrival, setIsNewArrival] = useState<boolean>(initialData?.isNewArrival || false);
  const [customizable, setCustomizable] = useState<boolean>(initialData?.customizable || true);

  // Load categories
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  // Auto-generate slug and SKU from title
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
      setSku(`PM-${generatedSlug.substring(0, 6).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`);
    }
  };

  // Image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImages((prev) => [...prev, data.url]);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    if (images.length === 1) {
      toast.error('Product must have at least one image');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Dynamic Sizes Management
  const handleAddSize = () => {
    setSizes((prev) => [
      ...prev,
      {
        label: `Size ${prev.length + 1}`,
        value: `size-${prev.length + 1}`,
        price: price,
        stock: 5,
      },
    ]);
  };

  const handleUpdateSize = (index: number, field: keyof ProductSize, val: any) => {
    setSizes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleRemoveSize = (index: number) => {
    if (sizes.length === 1) {
      toast.error('Product must have at least one size variant');
      return;
    }
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Product name is required');
    if (!categorySlug) return toast.error('Please select a category');

    setLoading(true);

    const payload = {
      name,
      slug,
      categorySlug,
      shortDescription,
      description,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      costPrice: costPrice ? Number(costPrice) : null,
      stock: Number(stock),
      sku,
      sizes,
      images,
      thumbnail: images[0],
      material,
      dimensions,
      weight,
      careInstructions,
      shippingInfo,
      status,
      featured,
      bestSeller,
      isNewArrival,
      customizable,
    };

    try {
      const url = isEdit ? `/api/admin/products/${initialData?.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isEdit ? 'Product updated successfully!' : 'Product created successfully!');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to save product');
      }
    } catch (err) {
      toast.error('An error occurred while saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 bg-[#F8F5EE]/95 backdrop-blur-xs py-3 border-b border-[#EAE3D6]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white border border-[#EAE3D6] text-charcoal hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-charcoal">
              {isEdit ? `Edit: ${initialData?.name}` : 'Create New Product'}
            </h2>
            <p className="text-[11px] text-taupe">
              {isEdit ? 'Update details, size variations and stock' : 'Add handcrafted creation to online catalog'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl border border-[#EAE3D6] bg-white text-xs font-semibold text-charcoal hover:bg-stone-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-xs shadow-md shadow-gold/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Information */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3">
              1. Basic Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Classic Geode Resin Clock with Gold Crystal Veins"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="classic-geode-resin-clock"
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-mono text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium focus:outline-hidden focus:border-[#D4AF37]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Short Description
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="One sentence summary for product cards and search results..."
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Full Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of craftsmanship, colors, resin layering technique, and inspiration..."
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal leading-relaxed focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* 2. Image Gallery Manager */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
              <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                2. Product Images ({images.length})
              </h3>
              <span className="text-[11px] text-taupe">First image will be main thumbnail</span>
            </div>

            {/* Existing Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden aspect-square border-2 border-[#EAE3D6] bg-stone-50"
                >
                  <Image
                    src={imgUrl}
                    alt={`Product image ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#D4AF37] text-white text-[9px] font-bold shadow-xs">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Upload & Add URL controls */}
            <div className="pt-3 border-t border-[#EAE3D6] grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File Upload Button */}
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#D4AF37]/60 bg-amber-50/40 hover:bg-amber-50 cursor-pointer text-xs font-semibold text-[#9B7B1B] transition-colors">
                <Upload className="w-4 h-4" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Image (Max 10MB)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              {/* Direct URL Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Or paste image URL (/images/...)"
                  className="flex-1 px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-2 bg-[#2A241F] hover:bg-black text-white rounded-xl text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* 3. Multi-Size & Pricing Variations */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  3. Size Options & Size-wise Pricing
                </h3>
                <p className="text-[11px] text-taupe">Configure multiple sizes with custom prices and stock</p>
              </div>
              <button
                type="button"
                onClick={handleAddSize}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-[#9B7B1B] hover:bg-amber-100 text-xs font-semibold border border-amber-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add Size Option
              </button>
            </div>

            <div className="space-y-3">
              {sizes.map((s, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3.5 rounded-xl bg-[#F8F5EE] border border-[#EAE3D6]"
                >
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-[10px] uppercase font-bold text-taupe mb-1">
                      Size Label
                    </label>
                    <input
                      type="text"
                      value={s.label}
                      onChange={(e) => handleUpdateSize(idx, 'label', e.target.value)}
                      placeholder="e.g. 12 inch"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D6] rounded-lg text-xs font-semibold text-charcoal"
                    />
                  </div>

                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-[10px] uppercase font-bold text-taupe mb-1">
                      Slug Value
                    </label>
                    <input
                      type="text"
                      value={s.value}
                      onChange={(e) => handleUpdateSize(idx, 'value', e.target.value)}
                      placeholder="12-inch"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D6] rounded-lg text-xs font-mono text-charcoal"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-[10px] uppercase font-bold text-taupe mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={s.price}
                      onChange={(e) => handleUpdateSize(idx, 'price', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D6] rounded-lg text-xs font-bold text-charcoal"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-[10px] uppercase font-bold text-taupe mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={s.stock}
                      onChange={(e) => handleUpdateSize(idx, 'stock', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE3D6] rounded-lg text-xs text-charcoal"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(idx)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                      title="Remove size"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Craftsmanship Specs */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3">
              4. Material & Craftsmanship Specs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Material
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Weight
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Care Instructions
              </label>
              <textarea
                rows={2}
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Column: Status, Pricing & Toggles */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3">
              Status & Visibility
            </h3>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Product Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-semibold text-charcoal"
              >
                <option value="ACTIVE">🟢 Active (Live on Store)</option>
                <option value="DRAFT">🟡 Draft (Hidden)</option>
                <option value="OUT_OF_STOCK">🔴 Out of Stock</option>
                <option value="ARCHIVED">⚪ Archived</option>
              </select>
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-charcoal">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>Featured Product (Shows on Homepage)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-charcoal">
                <input
                  type="checkbox"
                  checked={bestSeller}
                  onChange={(e) => setBestSeller(e.target.checked)}
                  className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>Bestseller Badge</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-charcoal">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>New Arrival Badge</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-charcoal">
                <input
                  type="checkbox"
                  checked={customizable}
                  onChange={(e) => setCustomizable(e.target.checked)}
                  className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>Allow Custom Text Personalization</span>
              </label>
            </div>
          </div>

          {/* Pricing & SKU Card */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3">
              Base Price & Stock
            </h3>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Base Price (₹) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-sm font-bold text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Compare-at Price (MRP)
              </label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="Optional strike-through MRP"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Total Stock
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-bold text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Base SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-mono text-charcoal"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
