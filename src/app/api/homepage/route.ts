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

    return NextResponse.json({
      config,
      banners: activeBanners,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch public homepage data' },
      { status: 500 }
    );
  }
}
