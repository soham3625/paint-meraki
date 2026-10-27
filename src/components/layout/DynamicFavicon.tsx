'use client';

// ============================================
// paint_n_meraki — DYNAMIC FAVICON & TITLE LOGO SYNC
// Real-time synchronization of browser tab icon
// ============================================

import { useEffect } from 'react';

export default function DynamicFavicon() {
  useEffect(() => {
    let isMounted = true;

    async function syncFavicon() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const iconUrl = data?.favicon || data?.logo || '/api/favicon';

        if (!isMounted || !iconUrl) return;

        // Find or create rel="icon" links
        const existingLinks = document.querySelectorAll("link[rel*='icon']");
        if (existingLinks.length > 0) {
          existingLinks.forEach((link) => {
            (link as HTMLLinkElement).href = iconUrl;
          });
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = iconUrl;
          document.head.appendChild(newLink);
        }

        // Also update apple-touch-icon if present
        const appleIcon = document.querySelector("link[rel='apple-touch-icon']");
        if (appleIcon) {
          (appleIcon as HTMLLinkElement).href = iconUrl;
        }
      } catch (e) {
        // Silent fallback to standard icons
      }
    }

    syncFavicon();

    // Listen to custom storage or focus events to refresh icon when admin updates it
    const handleFocus = () => syncFavicon();
    window.addEventListener('focus', handleFocus);
    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return null;
}
