import { NextResponse } from 'next/server';
import { getAllReviews, updateReviewStatus, deleteReview, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';

export async function GET() {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const reviews = await getAllReviews();
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const { id, isFeatured, isVisible, verified } = await req.json();

    const updated = await updateReviewStatus(id, { isFeatured, isVisible, verified });
    if (!updated) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    await logActivity(session.email, session.name, 'REVIEW_UPDATED', 'Review', `Updated review by ${updated.customerName}`, id);

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    await deleteReview(id);

    await logActivity(session.email, session.name, 'REVIEW_DELETED', 'Review', `Deleted review #${id}`, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete review' }, { status: 500 });
  }
}
