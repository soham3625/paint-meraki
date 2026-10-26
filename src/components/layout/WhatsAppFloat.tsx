'use client';

// ============================================
// paint_n_meraki — WHATSAPP FLOATING BUTTON
// Synchronized with Admin Settings
// ============================================

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function WhatsAppFloat() {
  const pathname = usePathname();
  const [whatsappNumber, setWhatsappNumber] = useState('919878541310');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
      })
      .catch(() => {});
  }, []);

  const getWhatsAppUrl = () => {
    let message = 'Hi paint_n_meraki, I would like to know more about your handcrafted products.';

    if (pathname?.startsWith('/product/')) {
      message = `Hi paint_n_meraki, I am interested in this product: ${typeof window !== 'undefined' ? window.location.href : ''}`;
    } else if (pathname === '/custom-order') {
      message = 'Hi paint_n_meraki, I would like to discuss a custom order.';
    }

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-elevated hover:shadow-glow transition-all duration-300 hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 16 16" width="26" height="26">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 0.068 3.558 0.064 7.926c0 1.399 0.366 2.76 1.057 3.965L0 16l4.204 -1.102a7.9 7.9 0 0 0 3.79 0.965h0.004c4.368 0 7.926 -3.558 7.93 -7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1 -3.356 -0.92l-0.24 -0.144 -2.494 0.654 0.666 -2.433 -0.156 -0.251a6.56 6.56 0 0 1 -1.007 -3.505c0 -3.626 2.957 -6.584 6.591 -6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-0.004 3.639 -2.961 6.592 -6.592 6.592m3.615 -4.934c-0.197 -0.099 -1.17 -0.578 -1.353 -0.646 -0.182 -0.065 -0.315 -0.099 -0.445 0.099 -0.133 0.197 -0.513 0.646 -0.627 0.775 -0.114 0.133 -0.232 0.148 -0.43 0.05 -0.197 -0.1 -0.836 -0.308 -1.592 -0.985 -0.59 -0.525 -0.985 -1.175 -1.103 -1.372 -0.114 -0.198 -0.011 -0.304 0.088 -0.403 0.087 -0.088 0.197 -0.232 0.296 -0.346 0.1 -0.114 0.133 -0.198 0.198 -0.33 0.065 -0.134 0.034 -0.248 -0.015 -0.347 -0.05 -0.099 -0.445 -1.076 -0.612 -1.47 -0.16 -0.389 -0.323 -0.335 -0.445 -0.34 -0.114 -0.007 -0.247 -0.007 -0.38 -0.007a0.73 0.73 0 0 0 -0.529 0.247c-0.182 0.198 -0.691 0.677 -0.691 1.654s0.71 1.916 0.81 2.049c0.098 0.133 1.394 2.132 3.383 2.992 0.47 0.205 0.84 0.326 1.129 0.418 0.475 0.152 0.904 0.129 1.246 0.08 0.38 -0.058 1.171 -0.48 1.338 -0.943 0.164 -0.464 0.164 -0.86 0.114 -0.943 -0.049 -0.084 -0.182 -0.133 -0.38 -0.232" />
        </svg>
      </div>
      <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-card px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        <p className="text-xs text-charcoal font-medium">Chat with us</p>
        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white transform rotate-45 shadow-sm" />
      </div>
    </a>
  );
}
