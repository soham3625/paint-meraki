'use client';

// ============================================
// paint_n_meraki — ADMIN LAYOUT
// Protected Admin Panel Shell
// ============================================

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // If login page, render clean page without admin layout shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    async function checkAuth() {
      if (isLoginPage) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/auth/me');
        if (!res.ok) {
          throw new Error('Authentication required');
        }

        const data = await res.json();

        if (data.authenticated && data.user && data.user.role !== 'CUSTOMER') {
          setUser(data.user);
        } else {
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch (err) {
        setUser(null);
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (e) {
      setUser(null);
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#181614] text-[#E8E2D9]">
        <Toaster position="top-right" />
        {children}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5EE] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center font-serif text-white font-bold text-2xl animate-pulse mx-auto shadow-lg shadow-gold/20">
            M
          </div>
          <p className="font-serif text-charcoal font-semibold text-sm tracking-wide">
            Loading paint_n_meraki Control Panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-charcoal flex">
      <Toaster position="top-right" />

      {/* Responsive Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <AdminHeader
          onOpenMobileMenu={() => setSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}
