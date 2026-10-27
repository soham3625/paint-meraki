'use client';

// ============================================
// paint_n_meraki — ADMIN BUSINESS SETTINGS & TITLE LOGO MANAGER
// ============================================

import { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon,
  Sparkles,
  Check,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { BusinessSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form Fields
  const [businessName, setBusinessName] = useState('paint_n_meraki');
  const [logo, setLogo] = useState('/logo.jpg');
  const [favicon, setFavicon] = useState('/logo.jpg');
  const [syncLogoAndFavicon, setSyncLogoAndFavicon] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('919878541310');
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/paint.meraki');
  const [email, setEmail] = useState('hello@paintmeraki.com');
  const [businessAddress, setBusinessAddress] = useState('Gujarat, India');
  const [announcementText, setAnnouncementText] = useState('♡ Handmade with Love | ✦ Custom Orders Available | Free Shipping Above ₹2,000 ♡');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);

  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data: BusinessSettings) => {
        setSettings(data);
        setBusinessName(data.businessName || 'paint_n_meraki');
        const currentLogo = data.logo || '/logo.jpg';
        const currentFavicon = data.favicon || currentLogo || '/logo.jpg';
        setLogo(currentLogo);
        setFavicon(currentFavicon);
        setWhatsappNumber(data.whatsappNumber || '919878541310');
        setInstagramUrl(data.instagramUrl || 'https://www.instagram.com/paint.meraki');
        setEmail(data.email || 'hello@paintmeraki.com');
        setBusinessAddress(data.businessAddress || 'Gujarat, India');
        setAnnouncementText(data.announcementText || '♡ Handmade with Love | ✦ Custom Orders Available | Free Shipping Above ₹2,000 ♡');
        setAnnouncementEnabled(data.announcementEnabled ?? true);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  // Upload handler for Title Logo / Favicon
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setFavicon(data.url);
        if (syncLogoAndFavicon) {
          setLogo(data.url);
        }

        // Dynamically update document head immediately for instant feedback
        const existingIcons = document.querySelectorAll("link[rel*='icon']");
        existingIcons.forEach((link) => {
          (link as HTMLLinkElement).href = data.url;
        });

        toast.success('Title logo / Favicon uploaded! Click Save Settings to persist.');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      toast.error('Upload failed: ' + (err.message || 'Network error'));
    } finally {
      setUploadingFavicon(false);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  };

  // Upload handler for Header Brand Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setLogo(data.url);
        if (syncLogoAndFavicon) {
          setFavicon(data.url);
          const existingIcons = document.querySelectorAll("link[rel*='icon']");
          existingIcons.forEach((link) => {
            (link as HTMLLinkElement).href = data.url;
          });
        }
        toast.success('Store header logo uploaded! Click Save Settings to persist.');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      toast.error('Upload failed: ' + (err.message || 'Network error'));
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

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
          favicon,
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
        toast.success('Store settings & title logo saved live!');
        if (data.warning) {
          toast(data.warning, { icon: '⚠️' });
        }
      } else {
        toast.error(data?.error || 'Failed to save settings');
      }
    } catch (err: any) {
      toast.error('Error saving settings: ' + (err?.message || 'Network error'));
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
            Manage your website title logo, browser tab favicon, contact info, and store identity.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-xs shadow-md shadow-gold/20 transition-all self-start sm:self-auto disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: TITLE LOGO & BROWSER TAB FAVICON MANAGER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-[#FAF7F2] via-white to-[#F5EFE6] rounded-2xl border-2 border-[#D4AF37]/30 shadow-md p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE3D6] pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#D4AF37]/15 text-[#8C6D1F] mb-1.5">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Title Logo &amp; Favicon
            </span>
            <h3 className="font-serif text-lg font-bold text-charcoal">
              Website Title Logo &amp; Browser Tab Icon
            </h3>
            <p className="text-xs text-taupe mt-0.5">
              Upload your custom logo to display on the top of the browser tab and throughout your website header.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-charcoal cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#EAE3D6] shadow-xs">
            <input
              type="checkbox"
              checked={syncLogoAndFavicon}
              onChange={(e) => setSyncLogoAndFavicon(e.target.checked)}
              className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
            />
            <span>Sync tab favicon with header logo</span>
          </label>
        </div>

        {/* Live Visual Preview: Browser Window Top Bar */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
            Live Preview: Browser Tab (Top of Website)
          </label>
          <div className="rounded-xl border border-[#D5CEBF] bg-[#E8E2D7] overflow-hidden shadow-sm">
            {/* Window control buttons */}
            <div className="bg-[#DDD6C9] px-4 py-2 border-b border-[#CCC4B5] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E57373]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD54F]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#81C784]" />
              </div>
              <div className="bg-white/70 px-3 py-1 rounded-md text-[11px] font-mono text-taupe flex items-center gap-1.5 max-w-xs truncate border border-[#CCC4B5]">
                <Globe className="w-3 h-3 text-taupe shrink-0" />
                https://paintnmeraki.vercel.app
              </div>
              <div className="w-10" />
            </div>

            {/* Active Browser Tab */}
            <div className="px-3 pt-2 pb-0 flex items-end">
              <div className="bg-white px-3.5 py-2 rounded-t-xl border-t border-x border-[#D5CEBF] shadow-xs flex items-center gap-2 max-w-sm">
                <div className="w-4.5 h-4.5 rounded-full border border-[#D4AF37]/50 overflow-hidden shrink-0 bg-ivory flex items-center justify-center relative">
                  <img
                    src={favicon || logo || '/logo.jpg'}
                    alt="Favicon preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="font-accent text-[6px] text-charcoal absolute leading-none -z-10">
                    PM
                  </span>
                </div>
                <span className="text-xs font-semibold text-charcoal truncate font-sans">
                  {businessName || 'paint_n_meraki'} | Handcrafted Resin Art &amp; Personalised Creations
                </span>
                <span className="text-taupe hover:text-charcoal text-xs ml-1 cursor-default">×</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-taupe">
            ✦ This shows exactly how visitors see your website tab icon and title on Chrome, Edge, Safari, and Brave.
          </p>
        </div>

        {/* Upload Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Card 1: Browser Tab Title Logo / Favicon */}
          <div className="bg-white p-5 rounded-xl border border-[#EAE3D6] space-y-4">
            <div className="flex items-center gap-2 text-charcoal font-semibold text-xs uppercase tracking-wider">
              <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
              Title Logo / Browser Tab Favicon
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#D4AF37] p-1 bg-[#FAF7F2] shrink-0 flex items-center justify-center overflow-hidden relative shadow-xs">
                <img
                  src={favicon || '/logo.jpg'}
                  alt="Title logo"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={faviconInputRef}
                  onChange={handleFaviconUpload}
                  accept="image/png,image/jpeg,image/webp,image/x-icon,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingFavicon}
                  onClick={() => faviconInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-charcoal hover:bg-black text-ivory text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {uploadingFavicon ? 'Uploading...' : 'Upload Title Logo'}
                </button>
                <div className="flex items-center justify-between text-[11px] text-taupe">
                  <span>PNG, JPG, ICO, WEBP</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFavicon('/logo.jpg');
                      toast.success('Reset to default logo');
                    }}
                    className="text-[#8C6D1F] hover:underline cursor-pointer"
                  >
                    Reset default
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-taupe/90 leading-relaxed">
              Square aspect ratio (1:1), 64×64 or 192×192 pixels recommended for crisp rendering on high-DPI displays.
            </p>
          </div>

          {/* Card 2: Storefront Header Brand Logo */}
          <div className="bg-white p-5 rounded-xl border border-[#EAE3D6] space-y-4">
            <div className="flex items-center gap-2 text-charcoal font-semibold text-xs uppercase tracking-wider">
              <Globe className="w-4 h-4 text-[#D4AF37]" />
              Storefront Header Brand Logo
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-charcoal/80 p-0.5 bg-ivory shrink-0 flex items-center justify-center overflow-hidden relative shadow-xs">
                <img
                  src={logo || '/logo.jpg'}
                  alt="Header logo"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-charcoal hover:bg-black text-ivory text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {uploadingLogo ? 'Uploading...' : 'Upload Header Logo'}
                </button>
                <div className="flex items-center justify-between text-[11px] text-taupe">
                  <span>Displays in navbar &amp; footer</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLogo('/logo.jpg');
                      toast.success('Reset to default logo');
                    }}
                    className="text-[#8C6D1F] hover:underline cursor-pointer"
                  >
                    Reset default
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-taupe/90 leading-relaxed">
              This logo is placed prominently on the top navigation bar of every page next to your store name.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: BRAND PROFILE & CONTACT INFO */}
      {/* ========================================================================= */}
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
              Studio Location &amp; Address
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
            Contact &amp; Socials
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
