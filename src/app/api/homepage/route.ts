import { NextResponse } from 'next/server';
import { getHomepageConfig, getAllBanners } from '@/lib/services/db-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [config, allBanners] = await Promise.all([
      getHomepageConfig(),
      getAllBanners(),
    ]);

    const activeBanners = (allBanners || []).filter((b) => b.isActive);

    return NextResponse.json(
      {
        config,
        banners: activeBanners,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch public homepage data' },
      { status: 500 }
    );
  }
}
