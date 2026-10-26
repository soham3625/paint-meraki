import { NextResponse } from 'next/server';
import { getAllProducts, saveProduct, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAdminApiAccess('STAFF');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const data = await req.json();

    if (!data.name || !data.categorySlug || !data.price) {
      return NextResponse.json({ error: 'Name, Category and Price are required' }, { status: 400 });
    }

    const saved = await saveProduct(data);

    await logActivity(session.email, session.name, 'PRODUCT_CREATED', 'Product', `Created product: ${saved.name}`, saved.id);

    // Revalidate customer storefront
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/shop/${saved.categorySlug}`);
    revalidatePath(`/product/${saved.slug}`);

    return NextResponse.json({ success: true, product: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save product' }, { status: 500 });
  }
}
