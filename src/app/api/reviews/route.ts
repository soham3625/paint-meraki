import { NextResponse } from 'next/server';
import { getAllReviews } from '@/lib/services/db-service';
import type { Review } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const reviews = await getAllReviews();
    let visibleReviews = reviews.filter((r) => r.isVisible !== false && (!r.status || r.status === 'APPROVED'));

    if (productId) {
      visibleReviews = visibleReviews.filter((r) => r.productId === productId);
    }

    return NextResponse.json(visibleReviews);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch public reviews' },
      { status: 500 }
    );
  }
}
