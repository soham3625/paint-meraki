'use client';

// ============================================
// paint_n_meraki — FOOTER
// Dynamic synchronization with Store Settings & Categories
// ============================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Mail, Phone, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Category, BusinessSettings } from '@/types';
import { categories as defaultCategories } from '@/lib/data/products';

function InstagramIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
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

const infoLinks = [
  { name: 'About', href: '/about' },
  { name: 'Reviews', href: '/reviews' },
  { name: 'Contact', href: '/contact' },
  { name: 'My Account', href: '/account' },
  { name: 'Admin Portal', href: '/admin' },
];

const careLinks = [
  { name: 'Shipping Policy', href: '/shipping-policy' },
  { name: 'Returns & Refunds', href: '/returns' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Terms & Conditions', href: '/terms' },
  { name: 'Track Order', href: '/track-order' },
];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [categoriesList, setCategoriesList] = useState<Category[]>(defaultCategories);
  const [settings, setSettings] = useState<Partial<BusinessSettings>>({
    whatsappNumber: '919878541310',
    instagramUrl: 'https://www.instagram.com/paint_n_meraki',
    email: 'hello@paintmeraki.com',
  });

  useEffect(() => {
    async function loadFooterData() {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/admin/settings'),
        ]);
        if (cRes.ok) {
          const cats = await cRes.json();
          if (Array.isArray(cats) && cats.length > 0) setCategoriesList(cats);
        }
        if (sRes.ok) {
          const sett = await sRes.json();
          if (sett) setSettings(sett);
        }
      } catch (e) {}
    }
    loadFooterData();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const whatsappNum = settings.whatsappNumber || '919878541310';
  const whatsappUrl = `https://wa.me/${whatsappNum}`;

  return (
    <footer className="bg-charcoal text-ivory/80 mt-auto">
      {/* Newsletter Section */}
      <div className="border-b border-ivory/10">
        <div className="container-custom py-12 sm:py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-heading text-2xl sm:text-3xl text-ivory mb-2">Stay Inspired</h3>
            <p className="text-ivory/50 text-sm mb-6">
              Get updates about new creations, custom orders and special offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-full bg-ivory/10 border border-ivory/20 text-ivory placeholder:text-ivory/30 text-sm outline-none focus:border-dusty-rose/50 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-dusty-rose text-white rounded-full text-sm font-medium hover:bg-dusty-rose/90 transition-colors flex-shrink-0"
              >
                {subscribed ? '✓ Subscribed!' : 'Subscribe →'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-ivory/60 flex items-center justify-center">
                <span className="font-accent text-ivory text-[8px] leading-none">
                  paint<br />meraki
                </span>
              </div>
              <span className="font-heading text-lg text-ivory font-semibold">paint_n_meraki</span>
            </div>
            <p className="text-ivory/40 text-sm leading-relaxed mb-4">
              Handcrafted resin art &amp; personalised creations made with love.
            </p>
            <div className="flex gap-3">
              <a
                href={settings.instagramUrl || 'https://www.instagram.com/paint_n_meraki'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-ivory/10 flex items-center justify-center text-ivory/50 hover:text-ivory hover:bg-ivory/20 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-ivory/10 flex items-center justify-center text-ivory/50 hover:text-ivory hover:bg-ivory/20 transition-colors"
                aria-label="WhatsApp"
              >
                <Phone size={16} />
              </a>
              <a
                href={`mailto:${settings.email || 'hello@paintmeraki.com'}`}
                className="w-9 h-9 rounded-full bg-ivory/10 flex items-center justify-center text-ivory/50 hover:text-ivory hover:bg-ivory/20 transition-colors"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-ivory font-medium text-sm mb-4 tracking-wide">Shop</h4>
            <ul className="space-y-2.5">
              {categoriesList.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={cat.slug === 'custom-creations' ? '/custom-order' : `/shop/${cat.slug}`}
                    className="text-ivory/40 hover:text-ivory text-sm transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-ivory font-medium text-sm mb-4 tracking-wide">Information</h4>
            <ul className="space-y-2.5">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ivory/40 hover:text-ivory text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-ivory font-medium text-sm mb-4 tracking-wide">Customer Care</h4>
            <ul className="space-y-2.5">
              {careLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ivory/40 hover:text-ivory text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-ivory font-medium text-sm mb-4 tracking-wide">Contact</h4>
            <ul className="space-y-2.5 text-sm text-ivory/40">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ivory transition-colors"
                >
                  WhatsApp: +{whatsappNum}
                </a>
              </li>
              <li>
                <a
                  href={settings.instagramUrl || 'https://www.instagram.com/paint_n_meraki'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ivory transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.email || 'hello@paintmeraki.com'}`} className="hover:text-ivory transition-colors">
                  {settings.email || 'hello@paintmeraki.com'}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-ivory/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-ivory/30 text-xs">
            © 2026 paint_n_meraki. All rights reserved.
          </p>
          <p className="text-ivory/30 text-xs flex items-center gap-1">
            Made with <Heart size={12} className="text-dusty-rose fill-dusty-rose" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
