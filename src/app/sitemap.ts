import { MetadataRoute } from 'next';
import { products, categories } from '@/lib/data/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paintnmeraki.vercel.app';

  const staticPages = [
    '',
    '/shop',
    '/custom-order',
    '/about',
    '/reviews',
    '/contact',
    '/cart',
    '/track-order',
    '/account/login',
    '/account/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/shop/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const productPages = products.map((prod) => ({
    url: `${baseUrl}/product/${prod.slug}`,
    lastModified: new Date(prod.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
