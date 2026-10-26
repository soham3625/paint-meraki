'use client';

// ============================================
// paint_n_meraki — CUSTOM ORDER PAGE
// ============================================

import { useState } from 'react';
import { ArrowRight, Upload, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const productTypes = ['Clock', 'Photo Frame', 'Pooja Thali', 'Resin Art', 'Other'];

export default function CustomOrderPage() {
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    email: '',
    productType: '',
    preferredSize: '',
    preferredColors: '',
    budget: '',
    description: '',
    specialInstructions: '',
  });
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [personalPhoto, setPersonalPhoto] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let referenceImageUrl = '';
      let personalPhotoUrl = '';

      if (referenceImage) {
        const formData = new FormData();
        formData.append('file', referenceImage);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) referenceImageUrl = data.url;
      }

      if (personalPhoto) {
        const formData = new FormData();
        formData.append('file', personalPhoto);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) personalPhotoUrl = data.url;
      }

      await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          referenceImageUrl,
          personalPhotoUrl,
        }),
      });

      setIsSubmitted(true);
    } catch (err) {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a JPG, PNG, or WEBP image');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be under 10 MB');
        return;
      }
      setter(file);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container-custom py-20 text-center max-w-lg mx-auto pb-24 sm:pb-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle size={40} className="text-success" />
        </div>
        <h1 className="font-heading text-3xl font-semibold text-charcoal mb-2">
          Your custom creation request has been received.
        </h1>
        <p className="font-accent text-xl text-dusty-rose mb-4">We&apos;ll get back to you soon!</p>
        <p className="text-taupe text-sm mb-8">
          We&apos;ll review your request and reach out on WhatsApp within 24 hours to discuss your creation.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/919878541310?text=${encodeURIComponent('Hi paint_n_meraki, I just submitted a custom order request!')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Chat on WhatsApp
          </a>
          <Link href="/shop" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16 sm:pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-charcoal to-charcoal/95 text-ivory">
        <div className="container-custom py-12 sm:py-16 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-dusty-rose font-medium mb-3">✦ Custom Creations</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold mb-2">Your Idea. Our Craft.</h1>
          <p className="font-accent text-xl text-dusty-rose mb-4">Let&apos;s create something beautiful together.</p>
          <p className="text-ivory/60 max-w-lg mx-auto text-sm">
            From personalised clocks and photo frames to completely custom resin creations, tell us what you imagine and we&apos;ll create it for you.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container-custom pt-8 pb-16 sm:pb-24 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-beige/30 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">Your Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="input-label">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="input-label">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="input-field"
                  placeholder="10-digit number"
                />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          {/* Creation Details */}
          <div className="bg-white rounded-xl border border-beige/30 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">What Would You Like?</h2>
            <div className="space-y-4">
              <div>
                <label className="input-label">Product Type *</label>
                <div className="flex flex-wrap gap-2">
                  {productTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, productType: type })}
                      className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${form.productType === type
                        ? 'border-charcoal bg-charcoal text-ivory'
                        : 'border-beige/50 text-taupe hover:border-charcoal/30'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Preferred Size</label>
                  <input
                    type="text"
                    value={form.preferredSize}
                    onChange={(e) => setForm({ ...form, preferredSize: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 12 inch"
                  />
                </div>
                <div>
                  <label className="input-label">Preferred Colours</label>
                  <input
                    type="text"
                    value={form.preferredColors}
                    onChange={(e) => setForm({ ...form, preferredColors: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Rose Gold, White"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Budget</label>
                <input
                  type="text"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="input-field"
                  placeholder="e.g., ₹2,000 - ₹3,000"
                />
              </div>

              <div>
                <label className="input-label">Describe Your Idea *</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none h-28"
                  placeholder="Tell us what you have in mind..."
                />
              </div>

              <div>
                <label className="input-label">Special Instructions</label>
                <textarea
                  value={form.specialInstructions}
                  onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
                  className="input-field resize-none h-20"
                  placeholder="Any specific requirements, deadlines, etc."
                />
              </div>
            </div>
          </div>

          {/* Image Uploads */}
          <div className="bg-white rounded-xl border border-beige/30 p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">Upload Images</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Reference Image</label>
                <div className="relative">
                  {referenceImage ? (
                    <div className="flex items-center gap-2 p-3 bg-cream/50 rounded-xl">
                      <span className="text-sm text-charcoal truncate flex-1">{referenceImage.name}</span>
                      <button type="button" onClick={() => setReferenceImage(null)} className="text-taupe hover:text-error">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-beige/50 rounded-xl cursor-pointer hover:border-dusty-rose/50 transition-colors">
                      <Upload size={18} className="text-taupe" />
                      <span className="text-sm text-taupe">Upload reference</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setReferenceImage)}
                      />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <label className="input-label">Personal Photo</label>
                <div className="relative">
                  {personalPhoto ? (
                    <div className="flex items-center gap-2 p-3 bg-cream/50 rounded-xl">
                      <span className="text-sm text-charcoal truncate flex-1">{personalPhoto.name}</span>
                      <button type="button" onClick={() => setPersonalPhoto(null)} className="text-taupe hover:text-error">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-beige/50 rounded-xl cursor-pointer hover:border-dusty-rose/50 transition-colors">
                      <Upload size={18} className="text-taupe" />
                      <span className="text-sm text-taupe">Upload photo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setPersonalPhoto)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-taupe mt-2">Accepted: JPG, PNG, WEBP · Max size: 10 MB</p>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center disabled:opacity-50">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <>Submit Request <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
