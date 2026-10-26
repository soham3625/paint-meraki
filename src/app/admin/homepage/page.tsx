'use client';

// ============================================
// paint_n_meraki — ADMIN HOMEPAGE MANAGER
// Live Showcase Customizer for Hero, Section 2 (Resin Clocks),
// Section 3 (Pooja Thalis), Curated Products & Categories
// ============================================

import { useState, useEffect } from 'react';
import {
  Home,
  Save,
  Upload,
  Sparkles,
  Layers,
  Package,
  Eye,
  Check,
  RefreshCw,
  Clock,
  Sparkle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cleanImagePath } from '@/lib/image-utils';
import type { HomepageConfig, Product, Category } from '@/types';

export default function AdminHomepageManagerPage() {
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [heroHeading, setHeroHeading] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroButtonText, setHeroButtonText] = useState('');
  const [heroButtonLink, setHeroButtonLink] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [heroEnabled, setHeroEnabled] = useState(true);

  // Section 2 Spotlight Image (Resin Clocks)
  const [resinClocksImage, setResinClocksImage] = useState('');

  // Section 3 Spotlight Image (Pooja Thalis)
  const [poojaThalisImage, setPoojaThalisImage] = useState('');

  // Curated Slugs
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<string[]>([]);
  const [bestSellers, setBestSellers] = useState<string[]>([]);
  const [newArrivals, setNewArrivals] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [hRes, pRes, cRes] = await Promise.all([
          fetch('/api/admin/homepage', { cache: 'no-store' }),
          fetch('/api/admin/products', { cache: 'no-store' }),
          fetch('/api/admin/categories', { cache: 'no-store' }),
        ]);

        if (hRes.ok) {
          const data: HomepageConfig = await hRes.json();
          setConfig(data);
          setHeroHeading(data.heroHeading || 'Art That Speaks to Your Soul');
          setHeroSubtitle(data.heroSubtitle || 'Handcrafted Resin Masterpieces & Custom Decor');
          setHeroDescription(data.heroDescription || 'Every piece at paint_n_meraki is meticulously handcrafted with love, precision, and artistic passion by Astha Patel.');
          setHeroButtonText(data.heroButtonText || 'Explore Collection');
          setHeroButtonLink(data.heroButtonLink || '/shop');
          setHeroImage(cleanImagePath(data.heroImage) || '/circle.png');
          setHeroEnabled(data.heroEnabled !== false);
          setResinClocksImage(cleanImagePath(data.resinClocksImage) || '/images/products/clock-6.png');
          setPoojaThalisImage(cleanImagePath(data.poojaThalisImage) || '/images/categories/pooja_thali.jpg');
          setSelectedCategories(data.featuredCategories || []);
          setFeaturedProducts(data.featuredProducts || []);
          setBestSellers(data.bestSellers || []);
          setNewArrivals(data.newArrivals || []);
        }

        if (pRes.ok) setProducts(await pRes.json());
        if (cRes.ok) setCategories(await cRes.json());
      } catch (err) {
        toast.error('Failed to load homepage settings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Hero Image Upload with Auto-Save
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Uploading and publishing hero image...');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        const cleanUrl = cleanImagePath(data.url);
        setHeroImage(cleanUrl);
        // Automatically persist to live database immediately
        await fetch('/api/admin/homepage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ heroImage: cleanUrl }),
        });
        toast.success('Hero image uploaded & published live!', { id: toastId });
      } else {
        toast.error(data.error || 'Upload failed', { id: toastId });
      }
    } catch (e) {
      toast.error('Image upload failed', { id: toastId });
    }
  };

  // Section 2 Resin Clocks Spotlight Upload with Auto-Save
  const handleResinClocksImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Uploading and publishing spotlight image...');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        const cleanUrl = cleanImagePath(data.url);
        setResinClocksImage(cleanUrl);
        // Automatically persist to live database immediately
        await fetch('/api/admin/homepage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resinClocksImage: cleanUrl }),
        });
        toast.success('Section 2 spotlight image uploaded & published live!', { id: toastId });
      } else {
        toast.error(data.error || 'Upload failed', { id: toastId });
      }
    } catch (e) {
      toast.error('Image upload failed', { id: toastId });
    }
  };

  // Section 3 Pooja Thalis Spotlight Upload with Auto-Save
  const handlePoojaThalisImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Uploading and publishing pooja thalis image...');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        const cleanUrl = cleanImagePath(data.url);
        setPoojaThalisImage(cleanUrl);
        // Automatically persist to live database immediately
        await fetch('/api/admin/homepage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ poojaThalisImage: cleanUrl }),
        });
        toast.success('Pooja Thalis spotlight image uploaded & published live!', { id: toastId });
      } else {
        toast.error(data.error || 'Upload failed', { id: toastId });
      }
    } catch (e) {
      toast.error('Image upload failed', { id: toastId });
    }
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleProduct = (slug: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(slug)) {
      setter(list.filter((s) => s !== slug));
    } else {
      setter([...list, slug]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Saving and publishing changes live...');
    try {
      const cleanHero = cleanImagePath(heroImage);
      const cleanClocks = cleanImagePath(resinClocksImage);
      const cleanPooja = cleanImagePath(poojaThalisImage);

      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroHeading,
          heroSubtitle,
          heroDescription,
          heroButtonText,
          heroButtonLink,
          heroImage: cleanHero,
          heroEnabled,
          featuredCategories: selectedCategories,
          featuredProducts,
          bestSellers,
          newArrivals,
          resinClocksImage: cleanClocks,
          poojaThalisImage: cleanPooja,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Homepage configuration updated live!', { id: toastId });
        if (data.config?.heroImage) setHeroImage(data.config.heroImage);
        if (data.config?.resinClocksImage) setResinClocksImage(data.config.resinClocksImage);
        if (data.config?.poojaThalisImage) setPoojaThalisImage(data.config.poojaThalisImage);
      } else {
        toast.error(data.error || 'Failed to save configuration', { id: toastId });
      }
    } catch (e: any) {
      toast.error('Error saving settings: ' + (e?.message || 'Network error'), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-taupe text-sm">Loading homepage settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D6] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            <Home className="w-5 h-5 text-[#D4AF37]" />
            Homepage Visual Manager
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Control the hero showcase, featured collections, bestsellers, and promotional layouts.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-xs shadow-md shadow-gold/20 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing Changes...' : 'Save & Publish Live'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Hero Settings & Curation */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Hero Banner Settings */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
              <h3 className="font-serif text-base font-bold text-charcoal">
                1. Hero Showcase Section
              </h3>
              <label className="flex items-center gap-2 text-xs font-semibold text-charcoal cursor-pointer">
                <input
                  type="checkbox"
                  checked={heroEnabled}
                  onChange={(e) => setHeroEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>Enable Hero Banner</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Hero Heading Title
              </label>
              <input
                type="text"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                placeholder="Art That Speaks to Your Soul"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Hero Subtitle / Tagline
              </label>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Handcrafted Resin Masterpieces & Custom Decor"
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Hero Description Paragraph
              </label>
              <textarea
                rows={3}
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={heroButtonText}
                  onChange={(e) => setHeroButtonText(e.target.value)}
                  placeholder="Explore Collection"
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  CTA Button Destination
                </label>
                <input
                  type="text"
                  value={heroButtonLink}
                  onChange={(e) => setHeroButtonLink(e.target.value)}
                  placeholder="/shop"
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-mono text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Hero Showcase Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  onBlur={(e) => setHeroImage(cleanImagePath(e.target.value))}
                  placeholder="/circle.png or /images/categories/circle.png"
                  className="flex-1 px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
                <button
                  type="button"
                  onClick={() => setHeroImage(cleanImagePath(heroImage))}
                  title="Sanitize path format"
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-[#EAE3D6] text-xs font-medium text-charcoal"
                >
                  Clean
                </button>
                <label className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[#9B7B1B] hover:bg-amber-100 cursor-pointer flex items-center justify-center transition-colors">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-[11px] text-taupe mt-1">
                Enter an image path (e.g. <span className="font-mono text-charcoal">/circle.png</span>) or click the upload icon to upload from your computer/phone.
              </p>
            </div>
          </div>

          {/* 2. Resin Clocks Showcase Section (Section 2 Image Spotlight) */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <div className="border-b border-[#EAE3D6] pb-3">
              <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                2. Resin Clocks Showcase Section (Section 2 Spotlight Image)
              </h3>
              <p className="text-xs text-taupe mt-0.5">
                Controls the large showcase artwork image displayed in the &quot;✦ Resin Clocks / Timeless Art for Your Space&quot; section on your homepage.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Resin Clocks Spotlight Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={resinClocksImage}
                  onChange={(e) => setResinClocksImage(e.target.value)}
                  onBlur={(e) => setResinClocksImage(cleanImagePath(e.target.value))}
                  placeholder="/images/products/clock-6.png or /circle.png"
                  className="flex-1 px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
                <button
                  type="button"
                  onClick={() => setResinClocksImage(cleanImagePath(resinClocksImage))}
                  title="Sanitize path format"
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-[#EAE3D6] text-xs font-medium text-charcoal"
                >
                  Clean
                </button>
                <label className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[#9B7B1B] hover:bg-amber-100 cursor-pointer flex items-center justify-center transition-colors">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleResinClocksImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-[11px] text-taupe mt-1">
                Enter an image path or click upload to set the spotlight artwork for the Resin Clocks homepage section.
              </p>
            </div>

            {resinClocksImage && (
              <div className="flex items-center gap-3 pt-2">
                <div className="w-20 h-14 rounded-xl overflow-hidden border border-[#EAE3D6] bg-stone-100 relative shrink-0">
                  <img
                    src={cleanImagePath(resinClocksImage) || '/images/products/clock-6.png'}
                    alt="Section 2 Spotlight Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/products/clock-6.png';
                    }}
                  />
                </div>
                <div className="text-[11px] text-taupe">
                  <span className="font-semibold text-charcoal block">Current Spotlight Image Preview</span>
                  <span className="font-mono text-[10px] truncate max-w-xs block">{resinClocksImage}</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Pooja Thalis Showcase Section */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <div className="border-b border-[#EAE3D6] pb-3">
              <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-[#D4AF37]" />
                3. Pooja Thalis Section Spotlight
              </h3>
              <p className="text-xs text-taupe mt-0.5">
                Controls the spotlight artwork for the &quot;✦ Pooja Thalis / Sacred Moments, Beautifully Crafted&quot; homepage section.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Pooja Thalis Spotlight Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={poojaThalisImage}
                  onChange={(e) => setPoojaThalisImage(e.target.value)}
                  onBlur={(e) => setPoojaThalisImage(cleanImagePath(e.target.value))}
                  placeholder="/images/categories/pooja_thali.jpg"
                  className="flex-1 px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
                <button
                  type="button"
                  onClick={() => setPoojaThalisImage(cleanImagePath(poojaThalisImage))}
                  title="Sanitize path format"
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-[#EAE3D6] text-xs font-medium text-charcoal"
                >
                  Clean
                </button>
                <label className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[#9B7B1B] hover:bg-amber-100 cursor-pointer flex items-center justify-center transition-colors">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handlePoojaThalisImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* 4. Featured Categories Picker */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              4. Featured Categories on Homepage
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((c) => {
                const isSelected = selectedCategories.includes(c.slug);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.slug)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#D4AF37] bg-amber-50/70 text-[#9B7B1B] shadow-xs'
                        : 'border-[#EAE3D6] bg-[#F8F5EE] text-charcoal hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="truncate">{c.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    </div>
                    <span className="text-[10px] text-taupe font-normal block font-mono">
                      /{c.slug}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Featured Products Curator */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#D4AF37]" />
              5. Featured Products Showcase ({featuredProducts.length} selected)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {products.map((p) => {
                const isSelected = featuredProducts.includes(p.slug);
                const pThumb = cleanImagePath(p.thumbnail || (p.images && p.images[0]) || '/images/categories/clock-2.jpg');
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProduct(p.slug, featuredProducts, setFeaturedProducts)}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#D4AF37] bg-amber-50/70 text-charcoal'
                        : 'border-[#EAE3D6] bg-[#F8F5EE] text-charcoal hover:bg-stone-100'
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                      <img
                        src={pThumb}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/categories/clock-2.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{p.name}</p>
                      <p className="text-[10px] text-taupe">₹{p.price.toLocaleString('en-IN')}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Previews */}
        <div className="space-y-6">
          {/* Live Preview 1: Hero Banner */}
          <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4 sticky top-6">
            <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3 flex items-center justify-between">
              <span>Hero Section Preview</span>
              <span className="text-[10px] text-taupe font-mono">1. Hero Section</span>
            </h3>

            <div className="rounded-xl overflow-hidden border border-[#EAE3D6] bg-[#1E1B18] text-white p-4 space-y-3">
              <div className="relative h-32 rounded-lg overflow-hidden bg-stone-800">
                <img
                  src={cleanImagePath(heroImage) || '/circle.png'}
                  alt="Hero Preview"
                  className="w-full h-full object-cover opacity-80"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/circle.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[9px] uppercase tracking-wider text-[#D4AF37] font-bold">
                    {heroSubtitle || 'paint_n_meraki'}
                  </span>
                  <p className="font-serif text-xs font-bold leading-tight line-clamp-1">
                    {heroHeading || 'Art That Speaks to Your Soul'}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-[#C5BDB2] line-clamp-2 leading-relaxed">
                {heroDescription}
              </p>

              <button
                type="button"
                className="w-full py-1.5 rounded-lg bg-[#D4AF37] text-white font-bold text-[10px]"
              >
                {heroButtonText || 'Explore Collection'}
              </button>
            </div>

            {/* Live Preview 2: Section 2 Resin Clocks Showcase */}
            <div className="border-t border-[#EAE3D6] pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-xs font-bold text-charcoal">Section 2 Preview</h4>
                <span className="text-[9px] text-dusty-rose font-mono">✦ Resin Clocks</span>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#EAE3D6] bg-[#FAF8F5] p-3 space-y-2.5">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-stone-200">
                  <img
                    src={cleanImagePath(resinClocksImage) || '/images/products/clock-6.png'}
                    alt="Resin Clocks Spotlight Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/products/clock-6.png';
                    }}
                  />
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-wider text-dusty-rose font-bold block">
                    ✦ Resin Clocks
                  </span>
                  <p className="font-heading text-xs font-bold text-charcoal leading-tight">
                    Timeless Art for Your Space
                  </p>
                  <p className="text-[10px] text-taupe line-clamp-2 mt-0.5">
                    Our handcrafted resin clocks combine functional design with artistic beauty...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
