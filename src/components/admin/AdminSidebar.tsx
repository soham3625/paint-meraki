'use client';

// ============================================
// paint_n_meraki — ADMIN SIDEBAR COMPONENT
// ============================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Sparkles,
  Users,
  Star,
  Home,
  FileText,
  Image as ImageIcon,
  Tag,
  CreditCard,
  Settings,
  ShieldCheck,
  History,
  LogOut,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export default function AdminSidebar({ isOpen, onClose, user, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Custom Orders', href: '/admin/custom-orders', icon: Sparkles },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Homepage Manager', href: '/admin/homepage', icon: Home },
    { label: 'Website Content', href: '/admin/content', icon: FileText },
    { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
    { label: 'Discounts / Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Payments & Shipping', href: '/admin/payments-shipping', icon: CreditCard },
    { label: 'Business Settings', href: '/admin/settings', icon: Settings },
    { label: 'Admin Users', href: '/admin/admin-users', icon: ShieldCheck },
    { label: 'Activity Logs', href: '/admin/activity-logs', icon: History },
  ];

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-[#1E1B18] text-[#E8E2D9] z-50 flex flex-col border-r border-[#38332E] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#38332E] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center shadow-lg shadow-gold/20 font-serif text-white font-bold text-xl">
              M
            </div>
            <div>
              <span className="font-serif text-lg tracking-wider text-white font-semibold block leading-tight">
                paint_n_meraki
              </span>
              <span className="text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">
                Admin Control
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-cream/70 hover:text-white hover:bg-white/10"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Storefront Quick Link */}
        <div className="px-4 py-3 border-b border-[#38332E]/70 bg-black/20">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              View Customer Store
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#9C9488]">
            Core Modules
          </div>
          {menuItems.slice(0, 7).map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-white shadow-md shadow-gold/20 font-semibold'
                    : 'text-[#D5CFC5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#D4AF37]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#9C9488]">
            Store & Content
          </div>
          {menuItems.slice(7, 12).map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-white shadow-md shadow-gold/20 font-semibold'
                    : 'text-[#D5CFC5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#D4AF37]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#9C9488]">
            Administration
          </div>
          {menuItems.slice(12).map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-white shadow-md shadow-gold/20 font-semibold'
                    : 'text-[#D5CFC5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#D4AF37]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-[#38332E] bg-black/30">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center font-bold text-xs text-[#D4AF37] shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Astha Patel'}</p>
                <p className="text-[10px] text-[#A69E90] truncate">{user?.role || 'Superadmin'}</p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-[#D5CFC5] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
