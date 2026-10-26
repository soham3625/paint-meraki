'use client';

// ============================================
// paint_n_meraki — ADMIN BANNERS MANAGEMENT
// ============================================

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Upload,
  X,
  RefreshCw,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Banner } from '@/types';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/categories/clock-2.jpg');
  const [buttonText, setButtonText] = useState('Shop Collection');
  const [buttonLink, setButtonLink] = useState('/shop');
  const [position, setPosition] = useState('hero');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      if (res.ok) setBanners(await res.json());
    } catch (e) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('/images/categories/clock-2.jpg');
    setButtonText('Shop Collection');
    setButtonLink('/shop');
    setPosition('hero');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImageUrl(b.imageUrl);
    setButtonText(b.buttonText || 'Shop Collection');
    setButtonLink(b.buttonLink || '/shop');
    setPosition(b.position || 'hero');
    setIsActive(b.isActive);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
        toast.success('Banner image uploaded');
      }
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Banner title is required');

    setSaving(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBanner?.id,
          title,
          subtitle,
          imageUrl,
          buttonText,
          buttonLink,
          position,
          isActive,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editingBanner ? 'Banner updated' : 'Banner created');
        setModalOpen(false);
        fetchBanners();
      } else {
        toast.error(data.error || 'Failed to save banner');
      }
    } catch (e) {
      toast.error('Error saving banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Banner deleted');
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (e) {
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
            Promotional Banners
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Create and schedule promotional banners for festival sales and new arrivals.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-xs shadow-md shadow-gold/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Banner
        </button>
      </div>

      {/* Banners List */}
      {loading ? (
        <div className="py-20 text-center text-taupe text-sm">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="py-20 text-center space-y-2 bg-white rounded-2xl border border-[#EAE3D6]">
          <ImageIcon className="w-8 h-8 text-taupe mx-auto opacity-50" />
          <p className="font-serif text-base font-bold text-charcoal">No promotional banners active</p>
          <button
            onClick={handleOpenAdd}
            className="text-xs font-semibold text-[#9B7B1B] hover:underline"
          >
            Create first banner &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div className="relative h-48 bg-stone-900 overflow-hidden">
                <Image
                  src={b.imageUrl || '/images/categories/clock-2.jpg'}
                  alt={b.title}
                  fill
                  className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37]">
                      Position: {b.position}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        b.isActive ? 'bg-emerald-500 text-white' : 'bg-stone-500 text-white'
                      }`}
                    >
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold leading-tight">{b.title}</h3>
                  {b.subtitle && (
                    <p className="text-xs text-[#E8E2D9] mt-0.5">{b.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="p-4 flex items-center justify-between border-t border-[#F0ECE1] text-xs">
                <div>
                  <span className="text-taupe block text-[10px]">Button Link:</span>
                  <span className="font-mono text-charcoal font-semibold">{b.buttonLink || '/shop'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                    title="Edit Banner"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE3D6] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
              <h3 className="font-serif text-lg font-bold text-charcoal">
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-taupe hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Banner Heading *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Festive Geode Clocks Sale"
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Subtitle / Subtext
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Limited Edition Handcrafted Pieces"
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Banner Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="/images/..."
                    className="flex-1 px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
                  />
                  <label className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[#9B7B1B] hover:bg-amber-100 cursor-pointer flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-mono text-charcoal"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-charcoal">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span>Active (Live on Website)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EAE3D6] font-semibold text-charcoal hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
