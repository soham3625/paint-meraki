import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import DynamicFavicon from '@/components/layout/DynamicFavicon';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://paintnmeraki.vercel.app'),
  title: {
    default: 'paint_n_meraki | Handcrafted Resin Art & Personalised Creations',
    template: '%s | paint_n_meraki',
  },
  description:
    'Discover handcrafted resin art, geode clocks, pooja thalis, decorative photo frames and custom creations by paint_n_meraki. Art from the heart, made just for you.',
  keywords: [
    'handmade resin art',
    'geode clock',
    'resin clock',
    'pooja thali',
    'decorative frame',
    'photo frame',
    'custom resin art',
    'handcrafted decor',
    'paint_n_meraki',
    'personalised gifts',
    'resin art India',
  ],
  authors: [{ name: 'paint_n_meraki' }],
  creator: 'paint_n_meraki',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://paintnmeraki.vercel.app',
    siteName: 'paint_n_meraki',
    title: 'paint_n_meraki | Handcrafted Resin Art & Personalised Creations',
    description:
      'Discover handcrafted resin art, geode clocks, pooja thalis, decorative photo frames and custom creations. Art from the heart, made just for you.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'paint_n_meraki | Handcrafted Resin Art',
    description: 'Handcrafted resin art & personalised creations made with love.',
  },
  icons: {
    icon: [
      { url: '/api/favicon', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/api/favicon',
    apple: '/apple-icon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        <DynamicFavicon />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#181616',
              color: '#FAF7F2',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}
