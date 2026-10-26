'use client';

// ============================================
// paint_n_meraki — MOBILE BOTTOM NAVIGATION
// ============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, Search, User } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { useAuthStore } from '@/lib/store/auth-store';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Shop', href: '/shop', icon: Search },
  { name: 'Wishlist', href: '/wishlist', icon: Heart },
  { name: 'Cart', href: '/cart', icon: ShoppingBag },
  { name: 'Account', href: '/account', icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const rawCartCount = useCartStore((s) => s.getItemCount());
  const rawWishlistCount = useWishlistStore((s) => s.getItemCount());

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? rawCartCount : 0;
  const wishlistCount = mounted ? rawWishlistCount : 0;

  const isCheckout = pathname === '/checkout';
  if (isCheckout) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-beige/50 sm:hidden safe-area-bottom"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          const count = item.name === 'Cart' ? cartCount : item.name === 'Wishlist' ? wishlistCount : 0;

          return (
            <Link
              key={item.name}
              href={item.name === 'Account' && mounted && !isAuthenticated ? '/account/login' : item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 relative transition-colors ${isActive ? 'text-charcoal' : 'text-taupe'
                }`}
              aria-label={`${item.name}${count > 0 ? ` (${count} items)` : ''}`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-dusty-rose text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-dusty-rose rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
