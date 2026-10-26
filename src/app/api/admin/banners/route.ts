import { NextResponse } from 'next/server';
import { getAllBanners, saveBanner, deleteBanner, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const banners = await getAllBanners();
    return NextResponse.json(banners);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const data = await req.json();

    if (!data.title || !data.imageUrl) {
      return NextResponse.json({ error: 'Banner title and image are required' }, { status: 400 });
    }

    const saved = await saveBanner(data);

    await logActivity(session.email, session.name, 'BANNER_SAVED', 'Banner', `Saved banner: ${saved.title}`, saved.id);

    revalidatePath('/');

    return NextResponse.json({ success: true, banner: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save banner' }, { status: 500 });
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
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    await deleteBanner(id);

    await logActivity(session.email, session.name, 'BANNER_DELETED', 'Banner', `Deleted banner #${id}`, id);

    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete banner' }, { status: 500 });
  }
}
