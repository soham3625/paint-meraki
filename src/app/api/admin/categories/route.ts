import { NextResponse } from 'next/server';
import { getAllCategories, saveCategory, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const saved = await saveCategory(data);

    await logActivity(session.email, session.name, 'CATEGORY_SAVED', 'Category', `Saved category: ${saved.name}`, saved.id);

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/api/categories');

    return NextResponse.json({ success: true, category: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save category' }, { status: 500 });
  }
}
