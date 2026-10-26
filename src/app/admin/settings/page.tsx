'use client';

// ============================================
// paint_n_meraki — ADMIN BUSINESS SETTINGS
// ============================================

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Settings,
  Save,
  Upload,
  Globe,
  MessageCircle,
  Mail,
  MapPin,
  Megaphone,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { BusinessSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [businessName, setBusinessName] = useState('paint_n_meraki');
  const [logo, setLogo] = useState('/logo.png');
  const [whatsappNumber, setWhatsappNumber] = useState('919878541310');
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/paint.meraki');
  const [email, setEmail] = useState('hello@paintmeraki.com');
  const [businessAddress, setBusinessAddress] = useState('Gujarat, India');
  const [announcementText, setAnnouncementText] = useState('♡ Handmade with Love | ✦ Custom Orders Available | Made Just for You ♡');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data: BusinessSettings) => {
        setSettings(data);
        setBusinessName(data.businessName || 'paint_n_meraki');
        setLogo(data.logo || '/logo.png');
        setWhatsappNumber(data.whatsappNumber || '919878541310');
        setInstagramUrl(data.instagramUrl || 'https://www.instagram.com/paint.meraki');
        setEmail(data.email || 'hello@paintmeraki.com');
        setBusinessAddress(data.businessAddress || 'Gujarat, India');
        setAnnouncementText(data.announcementText || '♡ Handmade with Love | ✦ Custom Orders Available | Made Just for You ♡');
        setAnnouncementEnabled(data.announcementEnabled ?? true);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          logo,
          whatsappNumber,
          instagramUrl,
          email,
          businessAddress,
          announcementText,
          announcementEnabled,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Store & Business settings saved live!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-taupe text-sm">Loading store settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D6] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#D4AF37]" />
            Store & Brand Settings
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Manage your store name, contact info, social handles, and top announcement bar.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-xs shadow-md shadow-gold/20 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Store Identity */}
        <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            Brand Profile
          </h3>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Brand / Store Name *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-bold text-charcoal focus:outline-hidden focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Studio Location & Address
            </label>
            <input
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="Gujarat, India"
              className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Support Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@paintmeraki.com"
              className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
            />
          </div>
        </div>

        {/* 2. Contact & Social Channels */}
        <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-charcoal border-b border-[#EAE3D6] pb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
            Contact & Socials
          </h3>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Official WhatsApp Number *
            </label>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="919878541310"
              className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-mono font-bold text-charcoal"
            />
            <p className="text-[11px] text-taupe mt-1">
              Used for floating WhatsApp button, order confirmations, and custom requests.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Instagram Profile URL
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://www.instagram.com/paint.meraki"
              className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
            />
          </div>
        </div>

        {/* 3. Top Announcement Bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EAE3D6] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
            <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#D4AF37]" />
              Top Announcement Bar
            </h3>
            <label className="flex items-center gap-2 text-xs font-semibold text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span>Enable Announcement Bar</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Announcement Message
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="♡ Handmade with Love | ✦ Custom Orders Available | Free Shipping above ₹2,000 ♡"
              className="w-full px-3.5 py-2.5 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal font-medium"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
