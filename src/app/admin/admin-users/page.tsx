'use client';

// ============================================
// paint_n_meraki — ADMIN USERS & STAFF
// ============================================

import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Lock,
  User,
  Mail,
  Phone,
  X,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { User as UserType, Role } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STAFF');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setFullName('');
    setEmail('');
    setMobile('');
    setPassword('');
    setRole('STAFF');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      return toast.error('Name and email are required');
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, mobile, password, role }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Account created successfully');
        setModalOpen(false);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to create account');
      }
    } catch (err) {
      toast.error('Error creating account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this account?')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Account deleted');
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        toast.error(data.error || 'Failed to delete account');
      }
    } catch (e) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            Admin & Staff Accounts
          </h2>
          <p className="text-xs text-taupe mt-0.5">
            Manage administrative team members and role-based dashboard permissions.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-xs shadow-md shadow-gold/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-taupe text-sm">Loading accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F5EE] border-b border-[#EAE3D6] text-taupe uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FDFBF7] transition-colors">
                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] text-white font-bold flex items-center justify-center text-xs">
                          {u.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-charcoal">{u.fullName}</p>
                          <p className="text-[10px] text-taupe">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          u.role === 'ADMIN'
                            ? 'bg-[#D4AF37]/20 text-[#8C6D1F] border border-[#D4AF37]/40'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role || 'STAFF'}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-stone-600 font-mono">
                      {u.mobile || '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Active
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EAE3D6] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
              <h3 className="font-serif text-lg font-bold text-charcoal">
                Add Team Member
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-taupe hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Astha Support Team"
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Login Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="support@paintmeraki.com"
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9878541310"
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Permission Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3.5 py-2 bg-[#F8F5EE] border border-[#EAE3D6] rounded-xl text-xs font-semibold text-charcoal"
                >
                  <option value="STAFF">Staff (Orders & Catalog Management)</option>
                  <option value="ADMIN">Superadmin (Full Control)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EAE3D6] font-semibold text-charcoal hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
