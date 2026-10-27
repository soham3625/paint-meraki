import { NextResponse } from 'next/server';
import { getAllReviews, createReview } from '@/lib/services/db-service';
import { revalidatePath } from 'next/cache';
import type { Review } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const reviews = await getAllReviews();
    let visibleReviews = reviews.filter((r) => r.isVisible !== false && (!r.status || r.status === 'APPROVED'));

    if (productId) {
      visibleReviews = visibleReviews.filter(
        (r) => r.productId === productId || r.productSlug === productId
      );
    }

    return NextResponse.json(visibleReviews);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch public reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, rating, review, productId, productName, productSlug, orderNumber, verified } = body;

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter your name (minimum 2 characters)' },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: 'Please select a valid star rating between 1 and 5' },
        { status: 400 }
      );
    }

    if (!review || typeof review !== 'string' || review.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please write a brief review of your experience (minimum 5 characters)' },
        { status: 400 }
      );
    }

    const savedReview = await createReview({
      customerName: customerName.trim(),
      rating: Math.round(numRating),
      review: review.trim(),
      productId: productId ? String(productId) : undefined,
      productName: productName ? String(productName) : undefined,
      productSlug: productSlug ? String(productSlug) : undefined,
      orderNumber: orderNumber ? String(orderNumber) : undefined,
      verified: verified !== undefined ? Boolean(verified) : true,
    });

    try {
      revalidatePath('/');
      revalidatePath('/reviews');
      revalidatePath('/api/reviews');
      if (productSlug) {
        revalidatePath(`/product/${productSlug}`);
      }
    } catch { }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been submitted successfully.',
      review: savedReview,
    });
  } catch (error: any) {
    console.error('[POST /api/reviews] Error submitting review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
