import { NextResponse } from 'next/server';
import { deleteCategory, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';
import { revalidatePath } from 'next/cache';

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const { slug } = await params;
    const result = await deleteCategory(slug);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await logActivity(session.email, session.name, 'CATEGORY_DELETED', 'Category', `Deleted category: ${slug}`, slug);

    revalidatePath('/');
    revalidatePath('/shop');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
