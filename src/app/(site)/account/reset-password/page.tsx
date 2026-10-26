'use client';

// ============================================
// paint_n_meraki — RESET PASSWORD PAGE
// Route: /account/reset-password & /reset-password
// ============================================

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const { resetPassword } = useAuthStore();

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token.trim()) {
      toast.error('Password reset token is missing');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetPassword(token.trim(), password, confirmPassword);
      if (result.success) {
        toast.success('Password reset successfully!');
        router.push('/account/login?reset=success');
      } else {
        const msg = result.error || 'This password reset link has expired or has already been used.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || 'Error updating password';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-dusty-rose/20 to-blush/30 rounded-full flex items-center justify-center mx-auto mb-4">
            {errorMessage ? (
              <AlertCircle size={28} className="text-red-500" />
            ) : (
              <KeyRound size={28} className="text-dusty-rose" />
            )}
          </div>
          <h1 className="font-heading text-3xl font-semibold text-charcoal">
            {errorMessage ? 'Link Expired or Invalid' : 'Create a New Password'}
          </h1>
          <p className="text-taupe text-sm mt-2">
            {errorMessage
              ? 'This password reset link is no longer valid.'
              : emailParam
              ? `Create a new password for ${emailParam}`
              : 'Enter and confirm your new account password'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-6 sm:p-8">
          {errorMessage ? (
            <div className="space-y-5 text-center">
              <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-100 text-left">
                {errorMessage}
              </div>
              <Link href="/account/forgot-password" className="btn-primary w-full justify-center">
                Request a New Reset Link <ArrowRight size={16} />
              </Link>
              <div className="pt-4 border-t border-beige/30">
                <Link
                  href="/account/login"
                  className="inline-flex items-center gap-1.5 text-sm text-taupe hover:text-charcoal transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {!initialToken && (
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">Reset Token</label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste reset token from email"
                    className="input-field font-mono text-xs"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="input-field !pl-11 !pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal z-10"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="input-field !pl-11"
                    required
                  />
                </div>
              </div>

              <div className="text-xs text-taupe space-y-1 bg-cream/40 p-3 rounded-lg">
                <p>• Minimum 8 characters</p>
                <p>• Both passwords must match</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Reset Password <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-beige/30 text-center">
                <Link
                  href="/account/login"
                  className="inline-flex items-center gap-1.5 text-sm text-taupe hover:text-charcoal transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-dusty-rose border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
