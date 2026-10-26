import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/services/db-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch public categories' },
      { status: 500 }
    );
  }
}
