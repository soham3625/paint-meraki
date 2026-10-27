'use client';

// ============================================
// paint_n_meraki — CONTACT PAGE
// Synchronized with Store Settings
// ============================================

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import type { BusinessSettings } from '@/types';

function InstagramIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState<Partial<BusinessSettings>>({
    whatsappNumber: '919878541310',
    email: 'hello@paintmeraki.com',
    instagramUrl: 'https://www.instagram.com/paint.meraki',
    businessAddress: 'Gujarat, India',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data) setSettings(data);
        }
      } catch (e) { }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitted(true);
  };

  const whatsappNum = settings.whatsappNumber || '+917284075825';
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent('Hi paint_n_meraki, I have an inquiry.')}`;

  return (
    <div className="pb-20 sm:pb-0">
      <div className="bg-white border-b border-beige/30">
        <div className="container-custom py-8 sm:py-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-dusty-rose font-medium mb-2">✦ Get in Touch</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal mb-2">Contact Us</h1>
          <p className="text-taupe">We love to hear from you. Reach out anytime.</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-xl font-semibold text-charcoal mb-4">We&apos;d Love to Hear from You</h2>
              <p className="text-taupe leading-relaxed">
                Whether you have a question, want to discuss a custom order, or just want to say hello — we&apos;re here for you.
              </p>
            </div>

            <div className="space-y-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 bg-white rounded-xl border border-beige/30 hover:border-dusty-rose/30 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">WhatsApp</p>
                  <p className="text-sm text-taupe group-hover:text-dusty-rose transition-colors">+{whatsappNum}</p>
                  <p className="text-xs text-taupe mt-0.5">Fastest way to reach us!</p>
                </div>
              </a>

              <a href={settings.instagramUrl || 'https://www.instagram.com/paint.meraki'} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 bg-white rounded-xl border border-beige/30 hover:border-dusty-rose/30 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-rose-light flex items-center justify-center flex-shrink-0">
                  <InstagramIcon size={18} className="text-dusty-rose" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">Instagram</p>
                  <p className="text-sm text-taupe group-hover:text-dusty-rose transition-colors">@paint_n_meraki</p>
                  <p className="text-xs text-taupe mt-0.5">Follow our journey &amp; DM us</p>
                </div>
              </a>

              <a href={`mailto:${settings.email || 'hello@paintmeraki.com'}`} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-beige/30 hover:border-dusty-rose/30 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-info" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">Email</p>
                  <p className="text-sm text-taupe group-hover:text-dusty-rose transition-colors">{settings.email || 'hello@paintmeraki.com'}</p>
                </div>
              </a>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-beige/30">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">Response Time</p>
                  <p className="text-sm text-taupe">Usually within 2-4 hours on WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl border border-beige/30 p-5 sm:p-6">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle size={48} className="text-success mx-auto mb-4" />
                <h3 className="font-heading text-xl font-semibold text-charcoal mb-2">Message Sent!</h3>
                <p className="text-taupe text-sm">We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-heading text-lg font-semibold text-charcoal mb-2">Send a Message</h3>
                <div>
                  <label className="input-label">Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="input-label">Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="input-label">Subject</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" placeholder="What is this about?" />
                </div>
                <div>
                  <label className="input-label">Message *</label>
                  <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field resize-none h-28" placeholder="Your message..." />
                </div>
                <button type="submit" className="btn-primary w-full justify-center">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
