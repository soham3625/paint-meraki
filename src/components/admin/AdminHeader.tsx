'use client';

// ============================================
// paint_n_meraki — ADMIN HEADER COMPONENT
// ============================================

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  Plus,
  ExternalLink,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Layers,
  Package,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export default function AdminHeader({ onOpenMobileMenu, user, onLogout }: HeaderProps) {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Generate breadcrumb title based on path
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard Overview';
    if (pathname === '/admin/products') return 'Product Catalog';
    if (pathname === '/admin/products/new') return 'Create New Product';
    if (pathname.startsWith('/admin/products/')) return 'Edit Product';
    if (pathname === '/admin/categories') return 'Categories Management';
    if (pathname === '/admin/orders') return 'Customer Orders';
    if (pathname.startsWith('/admin/orders/')) return 'Order Details';
    if (pathname === '/admin/custom-orders') return 'Custom Order Requests';
    if (pathname === '/admin/customers') return 'Customer Directory';
    if (pathname === '/admin/reviews') return 'Reviews Moderation';
    if (pathname === '/admin/homepage') return 'Homepage Content Manager';
    if (pathname === '/admin/content') return 'Website Content & Policies';
    if (pathname === '/admin/banners') return 'Promotional Banners';
    if (pathname === '/admin/coupons') return 'Discounts & Coupon Codes';
    if (pathname === '/admin/payments-shipping') return 'Payments & Shipping Settings';
    if (pathname === '/admin/settings') return 'Business & Store Settings';
    if (pathname === '/admin/admin-users') return 'Admin & Staff Management';
    if (pathname === '/admin/activity-logs') return 'Activity & Audit Logs';
    return 'Admin Control Panel';
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EAE3D6] px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-charcoal hover:bg-black/5 transition-colors"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-serif font-bold text-charcoal tracking-tight">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] text-taupe hidden sm:block">
              paint_n_meraki &bull; Handcrafted Studio
            </p>
          </div>
        </div>

        {/* Right Side: Quick Actions & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Quick Add Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-white shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create New</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showQuickAdd && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowQuickAdd(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#EAE3D6] py-1.5 z-40 text-xs font-medium animate-fadeIn">
                  <Link
                    href="/admin/products/new"
                    onClick={() => setShowQuickAdd(false)}
                    className="flex items-center gap-2 px-3 py-2 text-charcoal hover:bg-[#F8F5EE] hover:text-[#9B7B1B]"
                  >
                    <Package className="w-4 h-4 text-[#D4AF37]" />
                    Add Product
                  </Link>
                  <Link
                    href="/admin/categories"
                    onClick={() => setShowQuickAdd(false)}
                    className="flex items-center gap-2 px-3 py-2 text-charcoal hover:bg-[#F8F5EE] hover:text-[#9B7B1B]"
                  >
                    <Layers className="w-4 h-4 text-[#D4AF37]" />
                    Add Category
                  </Link>
                  <Link
                    href="/admin/banners"
                    onClick={() => setShowQuickAdd(false)}
                    className="flex items-center gap-2 px-3 py-2 text-charcoal hover:bg-[#F8F5EE] hover:text-[#9B7B1B]"
                  >
                    <Plus className="w-4 h-4 text-[#D4AF37]" />
                    Add Banner
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* View Live Store */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal/80 bg-black/5 hover:bg-black/10 border border-black/5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-taupe" />
            Live Store
          </a>

          {/* Notification Icon */}
          <Link
            href="/admin/orders"
            className="p-2 rounded-lg text-charcoal/70 hover:text-charcoal hover:bg-black/5 transition-colors relative"
            title="Recent Orders"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </Link>

          {/* User Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-black/5 border border-transparent hover:border-black/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-charcoal leading-tight truncate max-w-[100px]">
                  {user?.name || 'Astha Patel'}
                </span>
                <span className="block text-[10px] text-taupe leading-none">
                  {user?.role || 'Admin'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-taupe hidden sm:block" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#EAE3D6] py-2 z-40 text-xs animate-fadeIn">
                  <div className="px-3.5 py-2 border-b border-[#EAE3D6] mb-1">
                    <p className="font-semibold text-charcoal">{user?.name || 'Astha Patel'}</p>
                    <p className="text-[11px] text-taupe truncate">{user?.email || 'admin@paintmeraki.com'}</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-charcoal hover:bg-[#F8F5EE]"
                  >
                    <Shield className="w-3.5 h-3.5 text-taupe" />
                    Store & Account Settings
                  </Link>
                  <Link
                    href="/admin/activity-logs"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-charcoal hover:bg-[#F8F5EE]"
                  >
                    <User className="w-3.5 h-3.5 text-taupe" />
                    My Activity Logs
                  </Link>
                  {onLogout && (
                    <div className="border-t border-[#EAE3D6] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-red-600 hover:bg-red-50 text-left font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
