'use client';

// ============================================
// paint_n_meraki — ACCOUNT LAYOUT
// Sidebar navigation for user account pages
// ============================================

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { User, Package, MapPin, Lock, LogOut, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const accountLinks = [
  { name: 'My Profile', href: '/account', icon: User },
  { name: 'My Orders', href: '/account/orders', icon: Package },
  { name: 'Track Order', href: '/track-order', icon: MapPin },
  { name: 'Change Password', href: '/account/change-password', icon: Lock },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      // Allow access to login, signup, forgot-password without auth
      const publicPaths = ['/account/login', '/account/signup', '/account/forgot-password'];
      if (!publicPaths.some(p => pathname?.startsWith(p))) {
        router.push('/account/login');
      }
    }
  }, [mounted, isAuthenticated, pathname, router]);

  // Don't show sidebar on auth pages
  const isAuthPage = ['/account/login', '/account/signup', '/account/forgot-password'].some(
    p => pathname?.startsWith(p)
  );

  if (!mounted) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="w-8 h-8 border-2 border-dusty-rose border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="pb-20 sm:pb-0">
      <div className="container-custom py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-charcoal">My Account</h1>
          <p className="text-taupe text-sm mt-1">Welcome back, {user?.fullName?.split(' ')[0]} ♡</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-card border border-beige/30 overflow-hidden">
              {/* User Info */}
              <div className="p-5 border-b border-beige/30 bg-gradient-to-br from-cream/50 to-blush/20">
                <div className="w-12 h-12 rounded-full bg-dusty-rose/10 flex items-center justify-center mb-3">
                  <span className="font-heading text-lg text-dusty-rose font-semibold">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-medium text-charcoal text-sm">{user?.fullName}</p>
                <p className="text-xs text-taupe mt-0.5">{user?.email}</p>
              </div>

              {/* Nav Links */}
              <nav className="p-2">
                {accountLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group ${isActive
                        ? 'bg-dusty-rose/10 text-dusty-rose font-medium'
                        : 'text-taupe hover:bg-cream/50 hover:text-charcoal'
                        }`}
                    >
                      <Icon size={18} className={isActive ? 'text-dusty-rose' : 'text-taupe group-hover:text-charcoal'} />
                      <span className="flex-1">{link.name}</span>
                      <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
                    </Link>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-taupe hover:bg-red-50 hover:text-red-500 transition-all duration-200 w-full group mt-1"
                >
                  <LogOut size={18} className="text-taupe group-hover:text-red-500" />
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
