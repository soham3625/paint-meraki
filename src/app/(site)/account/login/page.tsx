'use client';

// ============================================
// paint_n_meraki — LOGIN / AUTHENTICATION PAGE
// Free Email OTP Verification + Password Login & Registration
// Powered by Existing Resend Integration (Zero Paid SMS Quotas)
// ============================================

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  User,
  Heart,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Edit2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const { isAuthenticated, login, signup, sendEmailOtp, verifyEmailOtp } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const isResetSuccess = searchParams.get('reset') === 'success';

  const initialTab =
    searchParams.get('mode') === 'signup' ||
    searchParams.get('tab') === 'register' ||
    searchParams.get('tab') === 'create'
      ? 'register'
      : isResetSuccess
      ? 'email'
      : 'otp';

  const [authMethod, setAuthMethod] = useState<'otp' | 'email' | 'register'>(initialTab);

  // Email OTP Flow State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpFullName, setOtpFullName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);

  // Password Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Create Account State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [mounted, isAuthenticated, router, redirectUrl]);

  // Resend Timer Countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Auto-focus first OTP box on screen transition
  useEffect(() => {
    if (otpSent && otpInputsRef.current[0]) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [otpSent]);

  // ============================================
  // HANDLERS: EMAIL OTP
  // ============================================
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const clean = otpEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!clean || !emailRegex.test(clean)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendEmailOtp(clean, 'LOGIN', otpFullName.trim() || undefined);
      if (res.success) {
        setOtpSent(true);
        setOtp(['', '', '', '', '', '']);
        setOtpTimer(res.cooldownSeconds || 60);
        toast.success(res.message || 'Verification code sent to your email! ♡');
      } else {
        const msg = res.error || 'Failed to send verification code. Please try again.';
        setErrorMessage(msg);
        toast.error(msg);
        if (res.cooldownSeconds && res.cooldownSeconds > 0) {
          setOtpTimer(res.cooldownSeconds);
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Network error while sending verification code.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, 5);
    otpInputsRef.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyEmailOtp(
        otpEmail.trim().toLowerCase(),
        enteredOtp,
        otpFullName.trim() || undefined
      );

      if (res.success) {
        toast.success('Logged in successfully! Welcome to Paint Meraki ♡');
        router.push(redirectUrl);
      } else {
        const errorMsg = res.error || 'Verification failed. Please check the code.';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Verification failed. Please try again.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setErrorMessage(null);
  };

  // ============================================
  // HANDLERS: PASSWORD LOGIN
  // ============================================
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (result.success) {
        toast.success('Welcome back to Paint Meraki! ♡');
        router.push(redirectUrl);
      } else {
        const msg = result.error || 'Email or password is incorrect.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // HANDLERS: CREATE ACCOUNT
  // ============================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signup(
        fullName.trim(),
        regEmail.trim().toLowerCase(),
        regPassword,
        regConfirmPassword,
        regMobile.trim() || undefined
      );

      if (result.success) {
        toast.success('Account created successfully! Welcome to Paint Meraki ♡');
        router.push(redirectUrl);
      } else {
        const msg = result.error || 'Registration failed. Please try again.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || 'An error occurred during registration.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || isAuthenticated) return null;

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-dusty-rose/20 to-blush/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
            {authMethod === 'register' ? (
              <Heart size={28} className="text-dusty-rose" />
            ) : authMethod === 'otp' ? (
              <Sparkles size={28} className="text-dusty-rose" />
            ) : (
              <Lock size={26} className="text-dusty-rose" />
            )}
          </div>
          <h1 className="font-heading text-3xl font-semibold text-charcoal">
            {otpSent
              ? 'Verify Email'
              : authMethod === 'register'
              ? 'Create Account'
              : authMethod === 'otp'
              ? 'Instant Email Sign-In'
              : 'Welcome Back'}
          </h1>
          <p className="text-taupe text-sm mt-2">
            {otpSent
              ? `Enter the 6-digit code sent to ${otpEmail}`
              : authMethod === 'register'
              ? 'Join Paint Meraki for a personalised shopping experience'
              : authMethod === 'otp'
              ? 'Fast & secure verification code sent directly to your inbox'
              : 'Sign in to access your orders, wishlists & addresses'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-beige/30 overflow-hidden">
          {/* Top Switcher Tabs */}
          {!otpSent && (
            <div className="flex border-b border-beige/30 bg-cream/10">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('otp');
                  setErrorMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs sm:text-sm font-semibold transition-all ${
                  authMethod === 'otp'
                    ? 'text-dusty-rose border-b-2 border-dusty-rose bg-white shadow-xs'
                    : 'text-taupe hover:text-charcoal'
                }`}
              >
                <Sparkles size={14} /> Email OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setErrorMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs sm:text-sm font-semibold transition-all ${
                  authMethod === 'email'
                    ? 'text-dusty-rose border-b-2 border-dusty-rose bg-white shadow-xs'
                    : 'text-taupe hover:text-charcoal'
                }`}
              >
                <Lock size={14} /> Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs sm:text-sm font-semibold transition-all ${
                  authMethod === 'register'
                    ? 'text-dusty-rose border-b-2 border-dusty-rose bg-white shadow-xs'
                    : 'text-taupe hover:text-charcoal'
                }`}
              >
                <UserPlus size={14} /> Register
              </button>
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Reset Password Success Banner */}
            {isResetSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 flex items-start gap-2 animate-fade-in">
                <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
                <span>Your password has been reset successfully. Please log in with your new password.</span>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50/80 border border-red-200/60 text-xs text-red-600 flex items-start gap-2 animate-fade-in">
                <span className="font-bold text-sm leading-none mt-0.5">⚠️</span>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: FREE EMAIL OTP FLOW */}
            {authMethod === 'otp' && !otpSent && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field !pl-10 text-sm"
                      autoFocus
                      required
                    />
                  </div>
                  <p className="text-[11px] text-taupe mt-1.5 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-dusty-rose" /> We will email a secure 6-digit code. No password needed!
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-taupe/60 lowercase font-normal">(optional for new customers)</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                    <input
                      type="text"
                      value={otpFullName}
                      onChange={(e) => setOtpFullName(e.target.value)}
                      placeholder="e.g. Astha Patel"
                      className="input-field !pl-10 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !otpEmail.trim() || otpTimer > 0}
                  className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Code...
                    </>
                  ) : otpTimer > 0 ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-white/70" />
                      Wait {otpTimer}s to resend
                    </>
                  ) : (
                    <>
                      Send Verification Code <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="mt-4 pt-3 border-t border-beige/30 text-center">
                  <p className="text-xs text-taupe">
                    Prefer password login?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('email');
                        setErrorMessage(null);
                      }}
                      className="text-dusty-rose font-semibold hover:underline"
                    >
                      Use Password
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* OTP VERIFICATION VIEW */}
            {authMethod === 'otp' && otpSent && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-cream/40 border border-beige/40">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Mail size={14} className="text-dusty-rose shrink-0" />
                    <span className="text-xs font-semibold text-charcoal truncate">
                      {otpEmail}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="text-xs text-dusty-rose hover:underline font-medium flex items-center gap-1 shrink-0 ml-2"
                  >
                    <Edit2 size={11} /> Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-3 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="flex justify-between gap-2 sm:gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono text-lg font-bold rounded-xl border border-beige/60 bg-cream/10 text-charcoal focus:border-dusty-rose focus:ring-2 focus:ring-dusty-rose/20 outline-none transition-all shadow-xs"
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-taupe text-center mt-2">
                    Code expires in 10 minutes. Check your inbox or spam folder.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otp.join('').length !== 6}
                  className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Sign In <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  {otpTimer > 0 ? (
                    <p className="text-xs text-taupe flex items-center justify-center gap-1.5">
                      <RefreshCw size={12} className="animate-spin text-taupe/60" /> Resend code in {otpTimer}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isSubmitting}
                      className="text-xs text-dusty-rose hover:underline font-semibold"
                    >
                      Didn&apos;t receive code? Resend Code
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* TAB 2: EMAIL & PASSWORD LOGIN */}
            {authMethod === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field !pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider">
                      Password
                    </label>
                    <Link href="/account/forgot-password" className="text-xs text-dusty-rose hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="input-field !pl-10 !pr-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="mt-4 pt-3 border-t border-beige/30 text-center">
                  <p className="text-xs text-taupe">
                    Prefer passwordless sign in?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('otp');
                        setErrorMessage(null);
                      }}
                      className="text-dusty-rose font-semibold hover:underline"
                    >
                      Instant Email OTP
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* TAB 3: CREATE ACCOUNT */}
            {authMethod === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="input-field !pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field !pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Mobile Number (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe text-xs font-medium pointer-events-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      className="input-field !pl-12 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Password (Min. 8 characters)
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create password"
                      className="input-field !pl-10 !pr-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal"
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe pointer-events-none" />
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="input-field !pl-10 !pr-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal"
                    >
                      {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="mt-4 pt-3 border-t border-beige/30 text-center">
                  <p className="text-xs text-taupe">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('otp');
                        setErrorMessage(null);
                      }}
                      className="text-dusty-rose font-semibold hover:underline"
                    >
                      Sign In with OTP
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Privacy & Trust Footnote */}
            <div className="mt-6 pt-5 border-t border-beige/30 text-center">
              <p className="text-[11px] text-taupe leading-relaxed">
                By continuing, you agree to paint_n_meraki&apos;s{' '}
                <Link href="/about" className="underline hover:text-charcoal">
                  Terms of Service
                </Link>{' '}
                &{' '}
                <Link href="/about" className="underline hover:text-charcoal">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-dusty-rose border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
