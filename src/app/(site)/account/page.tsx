'use client';

// ============================================
// paint_n_meraki — USER PROFILE PAGE
// ============================================

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOrderStore } from '@/lib/store/order-store';
import { User, Mail, Phone, Edit3, Check, X, Package, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { orders } = useOrderStore();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.fullName || '');
      setEditMobile(user.mobile || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  if (!mounted || !user) return null;

  const userOrders = orders.filter(o => o.userId === user.id);
  const totalOrders = userOrders.length;
  const activeOrders = userOrders.filter(o => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.orderStatus)).length;

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    const cleanMobile = editMobile.replace(/\D/g, '');
    if (cleanMobile && cleanMobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number or leave blank');
      return;
    }

    await updateProfile({
      fullName: editName.trim(),
      mobile: cleanMobile || undefined,
      email: editEmail.trim() ? editEmail.trim().toLowerCase() : undefined,
    });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditName(user.fullName || '');
    setEditMobile(user.mobile || '');
    setEditEmail(user.email || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/account/orders" className="bg-white rounded-2xl shadow-card border border-beige/30 p-5 hover:shadow-elevated transition-shadow group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dusty-rose/10 flex items-center justify-center group-hover:bg-dusty-rose/20 transition-colors">
              <Package size={20} className="text-dusty-rose" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-charcoal">{totalOrders}</p>
              <p className="text-xs text-taupe">Total Orders</p>
            </div>
          </div>
        </Link>

        <Link href="/account/orders" className="bg-white rounded-2xl shadow-card border border-beige/30 p-5 hover:shadow-elevated transition-shadow group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-charcoal">{activeOrders}</p>
              <p className="text-xs text-taupe">Active Orders</p>
            </div>
          </div>
        </Link>

        <Link href="/track-order" className="bg-white rounded-2xl shadow-card border border-beige/30 p-5 hover:shadow-elevated transition-shadow group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-charcoal">Track</p>
              <p className="text-xs text-taupe">Track Order</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-card border border-beige/30 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige/30">
          <h2 className="font-heading text-lg font-semibold text-charcoal">Profile Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-sm text-dusty-rose hover:text-dusty-rose/80 font-medium transition-colors"
            >
              <Edit3 size={14} /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 text-sm text-taupe hover:text-charcoal transition-colors"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                <Check size={14} /> Save
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-dusty-rose/20 to-blush/40 flex items-center justify-center flex-shrink-0">
              <span className="font-heading text-2xl text-dusty-rose font-semibold">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field text-lg font-medium"
                  placeholder="Your name"
                />
              ) : (
                <>
                  <p className="font-heading text-lg font-semibold text-charcoal">{user.fullName}</p>
                  <p className="text-xs text-taupe">
                    Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-taupe uppercase tracking-wider">
                <Mail size={12} /> Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="input-field text-sm"
                />
              ) : (
                <p className="text-sm text-charcoal bg-cream/30 rounded-lg px-3 py-2.5">
                  {user.email || 'Not provided'}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-taupe uppercase tracking-wider">
                <Phone size={12} /> Mobile
              </label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe text-sm pointer-events-none">+91</span>
                  <input
                    type="tel"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="input-field !pl-12 text-sm"
                  />
                </div>
              ) : (
                <p className="text-sm text-charcoal bg-cream/30 rounded-lg px-3 py-2.5">+91 {user.mobile}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-6">
        <h2 className="font-heading text-lg font-semibold text-charcoal mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/account/orders" className="btn-secondary text-center text-sm">
            View My Orders
          </Link>
          <Link href="/account/change-password" className="btn-secondary text-center text-sm">
            Change Password
          </Link>
          <Link href="/shop" className="btn-secondary text-center text-sm">
            Continue Shopping
          </Link>
          <Link href="/custom-order" className="btn-secondary text-center text-sm">
            Request Custom Order
          </Link>
        </div>
      </div>
    </div>
  );
}
