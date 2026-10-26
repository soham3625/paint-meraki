import { NextResponse } from 'next/server';
import { getActivityLogs } from '@/lib/services/db-service';
import { verifyAdminApiAccess } from '@/lib/auth/admin-auth';

export async function GET() {
  const auth = await verifyAdminApiAccess('ADMIN');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const logs = await getActivityLogs();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch logs' }, { status: 500 });
  }
}
