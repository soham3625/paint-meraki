'use client';

// ============================================
// paint_n_meraki — LOGIN / AUTHENTICATION PAGE
// Firebase Phone Auth + Email Login & Registration
// ============================================

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { getFirebaseAuth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import {
  Phone,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Edit2,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  User,
  Heart,
} from 'lucide-react';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const { isAuthenticated, syncWithBackendSession, login, signup } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const isResetSuccess = searchParams.get('reset') === 'success';

  const initialTab =
    searchParams.get('mode') === 'signup' ||
    searchParams.get('tab') === 'register' ||
    searchParams.get('tab') === 'create'
      ? 'register'
      : isResetSuccess
      ? 'email'
      : 'mobile';

  const [authMethod, setAuthMethod] = useState<'mobile' | 'email' | 'register'>(initialTab);

  // Phone OTP Flow State
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Email & Password Login State
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

  // Clean up reCAPTCHA verifier on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && (window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  // Auto focus first OTP box on screen transition
  useEffect(() => {
    if (otpSent && otpInputsRef.current[0]) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [otpSent]);

  const getCleanPhoneNumber = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed.startsWith('+')) return trimmed;
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  };

  const setupRecaptcha = () => {
    const auth = getFirebaseAuth();
    if (typeof window === 'undefined') return null;

    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {}
      (window as any).recaptchaVerifier = null;
    }

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        setErrorMessage('Security verification expired. Please try again.');
      },
    });

    (window as any).recaptchaVerifier = verifier;
    return verifier;
  };

  const mapFirebasePhoneError = (error: any): string => {
    const code = error?.code || '';
    if (code === 'auth/invalid-phone-number') {
      return 'Please enter a valid 10-digit mobile number.';
    }
    if (code === 'auth/missing-phone-number') {
      return 'Please enter your mobile number.';
    }
    if (code === 'auth/quota-exceeded') {
      return 'SMS quota exceeded for today. Please try again later or contact support.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Please wait a few moments and try again.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Phone authentication is temporarily unavailable. Please try again later.';
    }
    if (code === 'auth/captcha-check-failed') {
      return 'Security verification failed. Please refresh the page and try again.';
    }
    if (code === 'auth/app-not-authorized') {
      return 'Application verification failed. Please verify domain configuration.';
    }
    if (code === 'auth/invalid-verification-code') {
      return 'The 6-digit OTP entered is incorrect. Please check and try again.';
    }
    if (code === 'auth/code-expired') {
      return 'This OTP has expired. Please tap "Resend OTP" to receive a new code.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network connection error. Please check your internet connection.';
    }
    if (code === 'auth/user-disabled') {
      return 'This account has been disabled. Please contact Paint Meraki support.';
    }
    return error?.message || 'Verification failed. Please try again.';
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const rawDigits = mobile.replace(/\D/g, '');
    const isStandardIndian = /^[6-9]\d{9}$/.test(rawDigits);
    const isInternational = mobile.startsWith('+') && /^\+[1-9]\d{7,14}$/.test(mobile.trim());

    if (!isStandardIndian && !isInternational) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    const fullPhoneNumber = getCleanPhoneNumber(mobile);
    setIsSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      let verifier = (window as any).recaptchaVerifier;
      if (!verifier) {
        verifier = setupRecaptcha();
      }

      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setOtpTimer(60);
      toast.success('OTP sent successfully to ' + fullPhoneNumber);
    } catch (err: any) {
      console.error('Firebase send OTP error:', err);
      const friendlyMsg = mapFirebasePhoneError(err);
      setErrorMessage(friendlyMsg);
      toast.error(friendlyMsg);

      if (typeof window !== 'undefined' && (window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
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
      setErrorMessage('Please enter the complete 6-digit OTP.');
      return;
    }

    if (!confirmationResult) {
      setErrorMessage('Session expired. Please request a new OTP.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userCredential = await confirmationResult.confirm(enteredOtp);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      const syncResult = await syncWithBackendSession(idToken);
      if (syncResult.success) {
        toast.success('Logged in successfully! Welcome to Paint Meraki ♡');
        router.push(redirectUrl);
      } else {
        const errorMsg = syncResult.error || 'Failed to initialize customer account.';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error('Firebase verify OTP error:', err);
      const friendlyMsg = mapFirebasePhoneError(err);
      setErrorMessage(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setConfirmationResult(null);
    setErrorMessage(null);
  };

  if (!mounted || isAuthenticated) return null;

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-dusty-rose/20 to-blush/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
            {authMethod === 'register' ? (
              <Heart size={28} className="text-dusty-rose" />
            ) : (
              <Sparkles size={28} className="text-dusty-rose" />
            )}
          </div>
          <h1 className="font-heading text-3xl font-semibold text-charcoal">
            {otpSent
              ? 'Verify Mobile'
              : authMethod === 'register'
              ? 'Create Account'
              : 'Login / Create Account'}
          </h1>
          <p className="text-taupe text-sm mt-2">
            {otpSent
              ? `Enter the 6-digit OTP sent to +91 ${mobile.replace(/\D/g, '').slice(-10)}`
              : authMethod === 'register'
              ? 'Join Paint Meraki for a personalised shopping experience'
              : 'Handcrafted Resin Art & Personalised Creations'}
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
                  setAuthMethod('mobile');
                  setErrorMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs sm:text-sm font-semibold transition-all ${
                  authMethod === 'mobile'
                    ? 'text-dusty-rose border-b-2 border-dusty-rose bg-white shadow-xs'
                    : 'text-taupe hover:text-charcoal'
                }`}
              >
                <Phone size={14} /> Mobile & OTP
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
                <Mail size={14} /> Email Login
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
                <UserPlus size={14} /> Create Account
              </button>
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Reset Password Success Banner */}
            {isResetSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 flex items-start gap-2 animate-fade-in">
                <span className="font-bold">✓</span>
                <span>Your password has been reset successfully. Please log in with your new password.</span>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50/80 border border-red-200/60 text-xs text-red-600 flex items-start gap-2 animate-fade-in">
                <span className="font-bold">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: MOBILE NUMBER OTP */}
            {authMethod === 'mobile' && !otpSent && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <div className="relative flex rounded-xl border border-beige/60 focus-within:border-dusty-rose focus-within:ring-2 focus-within:ring-dusty-rose/20 bg-cream/20 transition-all overflow-hidden">
                    <div className="flex items-center px-3.5 bg-beige/20 border-r border-beige/40 text-xs font-medium text-charcoal select-none">
                      <span className="text-sm mr-1">🇮🇳</span> +91
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full px-3.5 py-3 text-sm bg-transparent outline-none text-charcoal font-medium placeholder:text-taupe/60"
                      maxLength={10}
                      autoFocus
                      required
                    />
                  </div>
                  <p className="text-[11px] text-taupe mt-1.5 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-dusty-rose" /> We will send an SMS OTP for secure verification.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || mobile.replace(/\D/g, '').length < 10}
                  className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="mt-4 pt-3 border-t border-beige/30 text-center">
                  <p className="text-xs text-taupe">
                    Prefer Email & Password?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('register');
                        setErrorMessage(null);
                      }}
                      className="text-dusty-rose font-semibold hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* OTP VERIFICATION VIEW */}
            {otpSent && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-cream/40 border border-beige/40">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-dusty-rose" />
                    <span className="text-xs font-semibold text-charcoal">
                      +91 {mobile.replace(/\D/g, '').slice(-10)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleChangeNumber}
                    className="text-xs text-dusty-rose hover:underline font-medium flex items-center gap-1"
                  >
                    <Edit2 size={11} /> Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-3 text-center">
                    Enter 6-Digit OTP Code
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
                      Verify & Continue <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  {otpTimer > 0 ? (
                    <p className="text-xs text-taupe flex items-center justify-center gap-1.5">
                      <RefreshCw size={12} className="animate-spin text-taupe/60" /> Resend OTP in {otpTimer}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isSubmitting}
                      className="text-xs text-dusty-rose hover:underline font-semibold"
                    >
                      Didn&apos;t receive code? Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* TAB 2: EMAIL LOGIN */}
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

                {/* Create Account Link under Email Login */}
                <div className="mt-4 pt-3 border-t border-beige/30 text-center">
                  <p className="text-xs text-taupe">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('register');
                        setErrorMessage(null);
                      }}
                      className="text-dusty-rose font-semibold hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* TAB 3: CREATE ACCOUNT (INLINE REGISTRATION) */}
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

                {/* Switch to Login Link */}
                <div className="mt-4 pt-3 border-t border-beige/30 text-center">
                  <p className="text-xs text-taupe">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('email');
                        setErrorMessage(null);
                      }}
                      className="text-dusty-rose font-semibold hover:underline"
                    >
                      Sign In
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
