import { NextResponse } from 'next/server';
import { getProductByIdOrSlug, saveProduct, deleteProduct, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';
import { revalidatePath } from 'next/cache';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const product = await getProductByIdOrSlug(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const { id } = await params;
    const data = await req.json();

    const saved = await saveProduct({ ...data, id });

    await logActivity(session.email, session.name, 'PRODUCT_UPDATED', 'Product', `Updated product: ${saved.name}`, saved.id);

    // Revalidate customer storefront
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/shop/${saved.categorySlug}`);
    revalidatePath(`/product/${saved.slug}`);

    return NextResponse.json({ success: true, product: saved });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const { id } = await params;
    const existing = await getProductByIdOrSlug(id);

    const success = await deleteProduct(id);
    if (!success) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (existing) {
      await logActivity(session.email, session.name, 'PRODUCT_DELETED', 'Product', `Deleted product: ${existing.name}`, id);
    }

    revalidatePath('/');
    revalidatePath('/shop');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
