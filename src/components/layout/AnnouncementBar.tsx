'use client';

// ============================================
// paint_n_meraki — ANNOUNCEMENT BAR
// ============================================

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [announcementText, setAnnouncementText] = useState(
    '♡ Handmade with Love | ✦ Custom Orders Available | Free Shipping Above ₹2,000 ♡'
  );

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.announcementEnabled === false) {
          setIsVisible(false);
          return;
        }
        let text = data.announcementText || '♡ Handmade with Love | ✦ Custom Orders Available | Free Shipping Above ₹2,000 ♡';
        if (typeof data.freeShippingThreshold === 'number') {
          const formattedThreshold = `₹${data.freeShippingThreshold.toLocaleString('en-IN')}`;
          text = text.replace(
            /Free Shipping (?:Above|on orders above)\s*₹[0-9,]+/i,
            `Free Shipping Above ${formattedThreshold}`
          );
        }
        setAnnouncementText(text);
      })
      .catch(() => {});
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-blush/40 border-b border-beige/50 relative">
      <div className="container-custom flex items-center justify-center py-2 px-8">
        <p className="text-xs sm:text-sm text-taupe tracking-wide text-center truncate">
          {announcementText}
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-taupe/60 hover:text-charcoal transition-colors"
          aria-label="Close announcement"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
