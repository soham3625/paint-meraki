import { NextResponse } from 'next/server';
import { getAllUsers, saveUser, deleteUser, logActivity } from '@/lib/services/db-service';
import { verifyAdminApiAccess, hashPassword } from '@/lib/auth/admin-auth';

export async function GET() {
  const auth = await verifyAdminApiAccess('ADMIN');
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const users = await getAllUsers();
    // Return sanitized users without sensitive password hashes
    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        mobile: u.mobile,
        role: u.role || 'STAFF',
        status: u.status || 'ACTIVE',
        createdAt: u.createdAt,
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAdminApiAccess('ADMIN');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const { fullName, email, mobile, password, role } = await req.json();

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const passwordHash = password ? await hashPassword(password) : undefined;

    const saved = await saveUser({
      fullName,
      email,
      mobile: mobile || '',
      passwordHash,
      role: role || 'STAFF',
      status: 'ACTIVE',
    });

    await logActivity(session.email, session.name, 'USER_CREATED', 'AdminUser', `Created user account for ${saved.fullName} (${saved.role})`, saved.id);

    return NextResponse.json({
      success: true,
      user: {
        id: saved.id,
        fullName: saved.fullName,
        email: saved.email,
        role: saved.role,
        status: saved.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await verifyAdminApiAccess('ADMIN');
  if (auth.errorResponse) return auth.errorResponse;
  const session = auth.session;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    if (id === session.id) {
      return NextResponse.json({ error: 'Cannot delete your own active admin account' }, { status: 400 });
    }

    await deleteUser(id);
    await logActivity(session.email, session.name, 'USER_DELETED', 'AdminUser', `Deleted staff account #${id}`, id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
