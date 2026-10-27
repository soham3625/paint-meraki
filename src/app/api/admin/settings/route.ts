import { NextResponse } from 'next/server';
import { getBusinessSettings, updateBusinessSettings, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await verifyAdminApiAccess('ADMIN');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const settings = await getBusinessSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await verifyAdminApiAccess('ADMIN');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const data = await req.json();

    const updated = await updateBusinessSettings(data);

    try {
      await logActivity(
        session.email,
        session.name,
        'SETTINGS_UPDATED',
        'Settings',
        'Updated store, UPI, and shipping settings',
        'default'
      );
    } catch (logErr: any) {
      console.warn('[PUT /api/admin/settings] Activity log notice:', logErr?.message || logErr);
    }

    revalidatePath('/');
    revalidatePath('/cart');
    revalidatePath('/checkout');
    revalidatePath('/api/settings');
    revalidatePath('/api/favicon');

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
