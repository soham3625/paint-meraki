// ============================================
// paint_n_meraki — SITE LAYOUT (with header/footer)
// Used for all customer-facing pages
// ============================================

import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppFloat from '@/components/layout/WhatsAppFloat';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import AuthInitializer from '@/components/auth/AuthInitializer';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthInitializer />
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <MobileBottomNav />
    </>
  );
}
