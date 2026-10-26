'use client';

// ============================================
// paint_n_meraki — ADMIN LOGIN PAGE
// Luxury Brand Styled Secure Login
// ============================================

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        throw new Error('Unable to connect to the authentication service. Please try again.');
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Invalid credentials');
      }

      toast.success('Welcome back, Admin!');
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141210] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8C6D1F]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center font-serif text-white font-bold text-3xl mx-auto shadow-xl shadow-gold/25 mb-4 border border-white/20">
            M
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-tight">
            paint_n_meraki
          </h1>
          <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold mt-1">
            Admin Management Console
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1F1C18]/90 backdrop-blur-xl border border-[#3D3730] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2 pb-4 mb-6 border-b border-[#3D3730]/80">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm font-semibold text-[#E8E2D9]">
              Secure Administrative Access
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#D5CFC5] uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A69E90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@paintmeraki.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141210] border border-[#3D3730] rounded-xl text-sm text-white placeholder-[#787166] focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D5CFC5] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A69E90] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#141210] border border-[#3D3730] rounded-xl text-sm text-white placeholder-[#787166] focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A69E90] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#E5C24D] hover:to-[#CBA533] text-white font-semibold text-sm shadow-lg shadow-gold/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Public Site */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#A69E90] hover:text-[#D4AF37] transition-colors"
          >
            &larr; Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#141210] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
