'use client';

// ============================================
// paint_n_meraki — SIGNUP PAGE
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push('/account');
    }
  }, [mounted, isAuthenticated, router]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (mobile.trim() && mobile.replace(/\D/g, '').length !== 10) {
      newErrors.mobile = 'Please enter a valid 10-digit number or leave blank';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await signup(
        fullName.trim(),
        email.trim().toLowerCase(),
        password,
        confirmPassword,
        mobile.trim() || undefined
      );

      if (result.success) {
        toast.success('Account created successfully! Welcome to Paint Meraki ♡');
        router.push('/account');
      } else {
        toast.error(result.error || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;
  if (isAuthenticated) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-dusty-rose/20 to-blush/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-dusty-rose" />
          </div>
          <h1 className="font-heading text-3xl font-semibold text-charcoal">Create Account</h1>
          <p className="text-taupe text-sm mt-2">Join paint_n_meraki for a personalised experience</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-beige/30 p-6 sm:p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`input-field !pl-11 ${errors.fullName ? 'border-red-400 focus:ring-red-200' : ''}`}
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`input-field !pl-11 ${errors.email ? 'border-red-400 focus:ring-red-200' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Mobile Number (Optional)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe text-sm font-medium pointer-events-none">+91</span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number"
                  className={`input-field !pl-14 ${errors.mobile ? 'border-red-400 focus:ring-red-200' : ''}`}
                />
              </div>
              {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`input-field !pl-11 !pr-11 ${errors.password ? 'border-red-400 focus:ring-red-200' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal transition-colors z-10"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`input-field !pl-11 !pr-11 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-200' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal transition-colors z-10"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
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
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 pt-6 border-t border-beige/30 text-center">
            <p className="text-sm text-taupe">
              Already have an account?{' '}
              <Link href="/account/login" className="text-dusty-rose font-medium hover:text-dusty-rose/80 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
