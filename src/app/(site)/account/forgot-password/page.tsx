'use client';

// ============================================
// paint_n_meraki — FORGOT PASSWORD PAGE
// Route: /account/forgot-password & /forgot-password
// ============================================

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore();

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await forgotPassword(email.trim().toLowerCase());
      if (result.success) {
        setIsSubmitted(true);
        if (result.devResetUrl) {
          setDevResetUrl(result.devResetUrl);
        }
        toast.success(result.message || 'Reset link sent!');
      } else {
        toast.error(result.error || 'Unable to process password reset');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to request password reset');
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
            {isSubmitted ? (
              <CheckCircle size={28} className="text-green-600" />
            ) : (
              <KeyRound size={28} className="text-dusty-rose" />
            )}
          </div>
          <h1 className="font-heading text-3xl font-semibold text-charcoal">
            {isSubmitted ? 'Check Your Inbox' : 'Forgot your password?'}
          </h1>
          <p className="text-taupe text-sm mt-2">
            {isSubmitted
              ? `If an account exists for this email, a password reset link has been sent.`
              : "Enter your email address and we'll send you a secure link to reset your password."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-6 sm:p-8">
          {isSubmitted ? (
            <div className="space-y-5 text-center">
              <p className="text-sm text-taupe leading-relaxed">
                Please check your email and click the link inside to set a new password. The link will expire in <strong>60 minutes</strong>.
              </p>

              {devResetUrl && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs text-left">
                  <p className="font-semibold mb-1">🛠 Development Mode Quick Link:</p>
                  <Link href={devResetUrl} className="underline text-amber-700 break-all">
                    Click here to open reset password page
                  </Link>
                </div>
              )}

              <Link href="/account/login" className="btn-primary w-full justify-center">
                Back to Login <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field !pl-11"
                    required
                  />
                </div>
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
                    Send Reset Link <ArrowRight size={16} />
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
