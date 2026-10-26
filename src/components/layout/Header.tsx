'use client';

// ============================================
// paint_n_meraki — HEADER / NAVIGATION
// Premium sticky header with scroll-compact behavior
// ============================================

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, ShoppingBag, Menu, X, User, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import { useWishlistStore } from '@/lib/store/wishlist-store';
import { useAuthStore } from '@/lib/store/auth-store';
import SearchOverlay from '@/components/search/SearchOverlay';
import type { Category } from '@/types';
import { categories as defaultCategories } from '@/lib/data/products';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categoriesList, setCategoriesList] = useState<Category[]>(defaultCategories);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const rawCartCount = useCartStore((s) => s.getItemCount());
  const rawWishlistCount = useWishlistStore((s) => s.getItemCount());
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategoriesList(data);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    {
      name: 'Shop',
      href: '/shop',
      children: [
        { name: 'All Products', href: '/shop' },
        ...categoriesList.map((c) => ({
          name: c.name,
          href: c.slug === 'custom-creations' ? '/custom-order' : `/shop/${c.slug}`,
        })),
      ],
    },
    { name: 'Custom Orders', href: '/custom-order' },
    { name: 'About', href: '/about' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'Contact', href: '/contact' },
  ];

  const cartCount = mounted ? rawCartCount : 0;
  const wishlistCount = mounted ? rawWishlistCount : 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-ivory/95 backdrop-blur-md shadow-soft py-2'
          : 'bg-ivory py-3 sm:py-4'
          }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 group"
              aria-label="paint_n_meraki Home"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="flex items-center gap-2">
                <div className={`transition-all duration-300 ${isScrolled ? 'w-10 h-10' : 'w-12 h-12 sm:w-14 sm:h-14'}`}>
                  <div className="w-full h-full rounded-full border-2 border-charcoal/80 flex items-center justify-center bg-ivory overflow-hidden relative">
                    <img
                      src="/logo.jpg"
                      alt="paint_n_meraki Logo"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="font-accent text-charcoal text-xs leading-none absolute inset-0 flex items-center justify-center -z-10" style={{ fontSize: isScrolled ? '8px' : '10px' }}>
                      paint<br />meraki
                    </span>
                  </div>
                </div>
                <div className={`hidden sm:block transition-all duration-300 ${isScrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  <h1 className="font-heading text-lg font-semibold text-charcoal tracking-wide leading-tight">
                    Paint_n_Meraki
                  </h1>
                  <p className="text-[10px] text-taupe tracking-widest uppercase">
                    Handcrafted Art
                  </p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`px-3 xl:px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${pathname === link.href
                      ? 'text-charcoal'
                      : 'text-taupe hover:text-charcoal'
                      }`}
                  >
                    {link.name}
                    {link.children && <ChevronDown size={12} className={`transition-transform duration-200 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                    {pathname === link.href && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-dusty-rose rounded-full" />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {link.children && activeDropdown === link.name && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-elevated border border-beige/50 py-2 animate-fade-in">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-4 py-2.5 text-sm transition-colors ${pathname === child.href
                            ? 'text-charcoal bg-rose-light/50 font-medium'
                            : 'text-taupe hover:text-charcoal hover:bg-cream/50'
                            }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-taupe hover:text-charcoal transition-colors rounded-full hover:bg-beige/30"
                aria-label="Search products"
              >
                <Search size={20} />
              </button>

              <Link
                href="/wishlist"
                className="relative p-2 text-taupe hover:text-charcoal transition-colors rounded-full hover:bg-beige/30 hidden sm:flex"
                aria-label={`Wishlist (${wishlistCount} items)`}
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-dusty-rose text-white text-[10px] font-semibold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => mounted && isAuthenticated ? setShowUserMenu(!showUserMenu) : router.push('/account/login')}
                  className="p-2 text-taupe hover:text-charcoal transition-colors rounded-full hover:bg-beige/30 flex items-center gap-1"
                  aria-label="Account"
                >
                  {mounted && isAuthenticated ? (
                    <div className="w-6 h-6 rounded-full bg-dusty-rose/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-dusty-rose">{user?.fullName?.charAt(0).toUpperCase()}</span>
                    </div>
                  ) : (
                    <User size={20} />
                  )}
                </button>

                {/* User Dropdown */}
                {showUserMenu && mounted && isAuthenticated && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-elevated border border-beige/30 py-2 z-50">
                    <div className="px-4 py-2 border-b border-beige/20">
                      <p className="text-sm font-medium text-charcoal truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-taupe truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-taupe hover:text-charcoal hover:bg-cream/50 transition-colors"
                    >
                      <User size={15} /> My Profile
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-taupe hover:text-charcoal hover:bg-cream/50 transition-colors"
                    >
                      <Package size={15} /> My Orders
                    </Link>
                    <Link
                      href="/account/change-password"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-taupe hover:text-charcoal hover:bg-cream/50 transition-colors"
                    >
                      <Settings size={15} /> Settings
                    </Link>
                    <div className="border-t border-beige/20 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setShowUserMenu(false); router.push('/'); }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/cart"
                className="relative p-2 text-taupe hover:text-charcoal transition-colors rounded-full hover:bg-beige/30"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-charcoal text-ivory text-[10px] font-semibold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-taupe hover:text-charcoal transition-colors rounded-full hover:bg-beige/30"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-ivory shadow-elevated animate-fade-in overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading text-lg font-semibold text-charcoal">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-taupe hover:text-charcoal"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-1" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <Link
                      href={link.href}
                      className={`block py-3 px-3 rounded-lg text-base font-medium transition-colors ${pathname === link.href
                        ? 'text-charcoal bg-rose-light/40'
                        : 'text-taupe hover:text-charcoal hover:bg-cream/50'
                        }`}
                    >
                      {link.name}
                    </Link>
                    {link.children && (
                      <div className="ml-4 mt-1 space-y-0.5 mb-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block py-2 px-3 rounded-lg text-sm transition-colors ${pathname === child.href
                              ? 'text-charcoal font-medium'
                              : 'text-taupe hover:text-charcoal'
                              }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-beige/50 space-y-3">
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 py-3 px-3 text-taupe hover:text-charcoal rounded-lg hover:bg-cream/50 transition-colors"
                >
                  <Heart size={18} />
                  <span className="text-sm font-medium">Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="ml-auto badge badge-new">{wishlistCount}</span>
                  )}
                </Link>
                <Link
                  href="/track-order"
                  className="flex items-center gap-3 py-3 px-3 text-taupe hover:text-charcoal rounded-lg hover:bg-cream/50 transition-colors"
                >
                  <ShoppingBag size={18} />
                  <span className="text-sm font-medium">Track Order</span>
                </Link>
                <Link
                  href={mounted && isAuthenticated ? '/account' : '/account/login'}
                  className="flex items-center gap-3 py-3 px-3 text-taupe hover:text-charcoal rounded-lg hover:bg-cream/50 transition-colors"
                >
                  <User size={18} />
                  <span className="text-sm font-medium">{mounted && isAuthenticated ? 'My Account' : 'Login / Sign Up'}</span>
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-beige/50">
                <a
                  href="https://wa.me/919878541310?text=Hi%20Paint%20Meraki%2C%20I%20would%20like%20to%20know%20more%20about%20your%20products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-rose w-full justify-center text-sm"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
