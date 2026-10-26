// ============================================
// paint_n_meraki — EDIT PRODUCT PAGE
// ============================================

import { getProductByIdOrSlug } from '@/lib/services/db-service';
import ProductForm from '@/components/admin/ProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    notFound();
  }

  return <ProductForm initialData={product} isEdit={true} />;
}
