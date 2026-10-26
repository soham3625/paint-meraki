import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/services/db-service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');

    const allProducts = await getAllProducts();
    let filtered = allProducts.filter((p) => (p.status || 'ACTIVE') !== 'DRAFT');

    if (slug) {
      const match = filtered.find((p) => p.slug === slug || p.id === slug);
      if (!match) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(match);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.categorySlug === category);
    }

    return NextResponse.json(filtered);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch public products catalog' },
      { status: 500 }
    );
  }
}
