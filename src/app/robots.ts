import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paint-meraki.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
