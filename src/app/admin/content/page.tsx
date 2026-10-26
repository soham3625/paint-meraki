'use client';

// ============================================
// paint_n_meraki — ADMIN WEBSITE CONTENT & POLICIES
// ============================================

import { useState } from 'react';
import {
  FileText,
  Save,
  Sparkles,
  Shield,
  Truck,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminContentPage() {
  const [saving, setSaving] = useState(false);

  // Content Tabs
  const [aboutStory, setAboutStory] = useState(
    'paint_n_meraki was born from a deep love for resin art, colors, and the magic that happens when liquid resin transforms into crystal-clear glasslike masterworks. Founded by artist Astha Patel, every single creation is poured and layered by hand in our studio.'
  );
  const [artistBio, setArtistBio] = useState(
    'Astha Patel is a contemporary resin artist from Gujarat, India. With years of experimentation in geode crystal layering and flower preservation, her mission is to bring bespoke luxury art into modern homes.'
  );
  const [shippingPolicy, setShippingPolicy] = useState(
    'All resin pieces are handcrafted to order. Standard processing time is 5-7 business days to allow resin curing. Once dispatched, domestic delivery takes 3-5 business days. Free shipping is provided for all orders above ₹2,000.'
  );
  const [returnPolicy, setReturnPolicy] = useState(
    'Because our resin art pieces and custom clocks are crafted specifically for each client, returns are accepted only in case of transit damage. Please notify us within 24 hours of delivery with unboxing video proof for prompt replacement.'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Website content & policies updated live!');
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D6] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D4AF37]" />
            Website Content & Policies
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Edit brand storytelling, artist bio, shipping policies, and return conditions.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-xs shadow-md shadow-gold/20 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Content'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Brand Story */}
        <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            About Us — Brand Story
          </h3>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Studio Story & Meraki Meaning
            </label>
            <textarea
              rows={4}
              value={aboutStory}
              onChange={(e) => setAboutStory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Artist Bio (Astha Patel)
            </label>
            <textarea
              rows={4}
              value={artistBio}
              onChange={(e) => setArtistBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal leading-relaxed"
            />
          </div>
        </div>

        {/* 2. Store Policies */}
        <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            Store Terms & Policies
          </h3>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#D4AF37]" /> Shipping & Dispatch Policy
            </label>
            <textarea
              rows={4}
              value={shippingPolicy}
              onChange={(e) => setShippingPolicy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" /> Returns & Replacement Policy
            </label>
            <textarea
              rows={4}
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal leading-relaxed"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
