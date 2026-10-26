// ============================================
// paint_n_meraki — STOREFRONT HOMEPAGE (Server Component)
// Fetches live custom homepage images and database configurations
// directly on the server for instant SSR delivery to Vercel/clients.
// ============================================

import {
  getHomepageConfig,
  getAllProducts,
  getAllCategories,
  getAllReviews,
  getBusinessSettings,
} from '@/lib/services/db-service';
import HomePageClient from './HomePageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [homepageConfig, productsList, categoriesList, reviewsList, settings] = await Promise.all([
    getHomepageConfig(),
    getAllProducts(),
    getAllCategories(),
    getAllReviews(),
    getBusinessSettings(),
  ]);

  return (
    <HomePageClient
      initialConfig={homepageConfig}
      initialProducts={productsList}
      initialCategories={categoriesList}
      initialReviews={reviewsList}
      initialSettings={settings}
    />
  );
}
