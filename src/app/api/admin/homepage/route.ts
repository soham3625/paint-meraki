import { NextResponse } from 'next/server';
import { getHomepageConfig, updateHomepageConfig, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const config = await getHomepageConfig();
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch homepage config' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const data = await req.json();

    const updated = await updateHomepageConfig(data);

    await logActivity(session.email, session.name, 'HOMEPAGE_UPDATED', 'Homepage', 'Updated homepage layout and curated products', 'default');

    revalidatePath('/');
    revalidatePath('/api/homepage');

    return NextResponse.json({ success: true, config: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update homepage' }, { status: 500 });
  }
}
