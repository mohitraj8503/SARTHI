'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, Loader2, AlertCircle, User, Lock, ArrowLeft, Leaf
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { triggerHaptic } from '@/lib/haptics';
import { redirectByRole } from '@/lib/auth-ui';
import { useToast } from '@/components/ToastProvider';
import { ZoomControl } from '@/components/auth/ZoomControl';
import { usePageZoom } from '@/lib/usePageZoom';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const { zoom, isDesktop } = usePageZoom();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const callbackUrl = searchParams.get('callbackUrl');
  const urlError = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const { user, loading: authLoading, setLogin } = useAuth();
  const hasRedirectedRef = useRef(false);

  const redirectUrl = searchParams.get('redirect') || searchParams.get('callbackUrl');
  const urlReason = searchParams.get('reason');

  useEffect(() => {
    if (!authLoading && user && !urlReason && !urlError) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        redirectByRole(user.role, router, user.onboarded, redirectUrl);
      }
      return;
    }

    if (urlReason) {
      setError('Your session has expired or was cleared. Please sign in again to continue.');
    } else if (redirectUrl && !user) {
      setError('Please sign in to access your protected workspace.');
    } else if (urlError) {
      const msgs: Record<string, string> = {
        access_denied: 'Access denied. You cancelled the login request.',
        invalid_state: 'Security check failed. Please try again.',
        auth_failed: 'Authentication failed. Please try again later.',
        email_required: 'Email is required to sign in with this provider.',
        account_exists: 'An account with this email already exists using a different sign-in method.',
        service_outage: 'Our servers are temporarily busy. Please wait a moment and try again.',
        not_authenticated: 'You must be signed in to continue.',
        server_config_error: 'A configuration error occurred. Please contact support.',
        oauth_failed: 'OAuth sign-in failed. Please try again.',
        oauth_error: 'OAuth sign-in failed. Please try again.',
        missing_params: 'Sign-in request was incomplete. Please try again.',
        user_not_found: 'No account found. Please sign up first.',
        token_failed: 'Session could not be established. Please try again.',
        missing_tokens: 'Sign-in session expired. Please try again.',
        oauth_callback_failed: 'Sign-in could not be completed. Please try again.',
      };
      setError(msgs[urlError] || errorDescription || 'Authentication failed. Please try again.');
    }
  }, [authLoading, user, urlError, urlReason, errorDescription, redirectUrl, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    console.log('[AUTH] sign-in started', { email: formData.email });

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('[AUTH] non-json response received:', res.status, text);
        if (res.status === 503 || res.status === 502 || res.status === 504) {
          throw new Error('Server is currently connecting. Please try again in a few seconds.');
        } else {
          throw new Error('Connection error. Please check your network and try again.');
        }
      }
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      
      console.log('[AUTH] session established', { userId: data.user.id });
      console.log('[AUTH] profile resolved', { role: data.user.role });
      
      triggerHaptic('success');
      setLogin(data.user);
      addToast({ type: 'success', title: 'Authentication Successful', message: 'Welcome back to SARTHI! Syncing your workspace...' });
      
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        const targetUrl = searchParams.get('callbackUrl') || searchParams.get('redirect');
        redirectByRole(data.user.role, router, data.user.onboarded, targetUrl);
      }
    } catch (err: any) {
      console.error('[AUTH] sign-in failed', err.message);
      setError(err.message);
      setIsLoading(false);
      triggerHaptic('error');
    }
  };

  return (
    <>
      {/* =====================================================================
          STYLE TAG
          ===================================================================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,600&family=Dancing+Script:wght@700&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif !important;
        }
        .font-poppins {
          font-family: 'Poppins', sans-serif !important;
        }
        .hero-title {
          font-size: 42px;
        }
        @media (max-width: 450px) {
          .hero-title {
            font-size: 32px !important;
          }
        }
        @media (max-width: 380px) {
          .hero-title {
            font-size: 28px !important;
          }
        }
      `}</style>

      {/* =================================================================
          RESPONSIVE LAYOUT
          ================================================================= */}
      <div
        className="bg-[#0A3019] lg:bg-white font-inter relative flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto min-h-screen antialiased select-none"
        style={{
          width: isDesktop ? `${(100 / zoom).toFixed(3)}vw` : '100vw',
          height: isDesktop ? `${(100 / zoom).toFixed(3)}vh` : 'auto',
          minHeight: isDesktop ? 'auto' : '100dvh',
          overflowY: isDesktop ? 'hidden' : 'auto',
          fontFeatureSettings: "'kern' 1, 'liga' 1",
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <ZoomControl />

        {/* Back to Home Button (Glassmorphism Pill) */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-50 inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-[18px] rounded-[24px] bg-white/12 border border-white/20 backdrop-blur-md text-white font-medium text-[13px] transition-all duration-200 ease-in-out hover:bg-white/22"
        >
          <span className="text-[14px]">←</span> Home
        </Link>

        {/* Full-Screen Room Background (shows naturally on the right side) - hidden on mobile to optimize LCP */}
        <div className="absolute inset-0 z-0 hidden lg:block">
          <Image
            src="/highqualityloginbg.jpg"
            alt="SARTHI Learning Space"
            fill
            priority
            className="object-cover object-center"
          />
        </div>

        {/* LEFT AREA: Large Elliptical shape bleeding off the left edge (Radial Forest Green gradient with soft feathered edge) */}
        <div
          className="absolute inset-y-0 left-0 w-[30%] sm:w-[50%] lg:w-[68%] z-10 pointer-events-none"
          style={{
            clipPath: 'ellipse(100% 100% at 0% 50%)',
            background: 'radial-gradient(circle at center, rgba(20, 83, 45, 0.72) 0%, rgba(10, 48, 25, 0.85) 100%)',
            filter: 'blur(1px)',
          }}
        />

        {/* LEFT SECTION: Hero Content with background image on mobile */}
        <div className="w-full lg:w-[55%] relative z-30 flex flex-col justify-center px-8 pt-20 pb-8 lg:p-20 text-white min-h-[20vh] lg:min-h-0 overflow-hidden">
          {/* Mobile-only background image and dark green overlay */}
          <div className="absolute inset-0 z-0 lg:hidden">
            <Image
              src="/highqualityloginbg.jpg"
              alt="Studying"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#0A3019]/85" />
          </div>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[480px] lg:pl-[60px] flex flex-col animate-fadeIn relative z-10"
          >
            <Link
              href="/"
              className="font-sans font-semibold text-white select-none mb-6"
              style={{ fontSize: '16px', letterSpacing: '1px', textDecoration: 'none', cursor: 'pointer' }}
            >
              SARTHI
            </Link>
            <h1
              className="hero-title font-inter text-white tracking-[-1px]"
              style={{
                lineHeight: '1.2',
                textShadow: '0 2px 16px rgba(0,0,0,0.25)'
              }}
            >
              <span className="font-light">Improve your skills</span> <br className="hidden lg:inline" />
              <span className="font-extrabold">with SARTHI</span>
            </h1>
          </motion.div>
        </div>

        {/* RIGHT SECTION: Floating Login Card */}
        <div className="w-full lg:w-[45%] relative z-30 flex items-start sm:items-center justify-center px-4 pt-4 pb-16 sm:py-8 lg:p-12 min-h-[50vh] sm:min-h-[70vh] lg:min-h-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full md:w-[90%] lg:w-[480px] bg-white/97 rounded-[24px] border border-white/80 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08),0_24px_48px_rgba(0,0,0,0.06)] py-8 px-6 sm:py-[44px] sm:px-[40px] flex flex-col mb-6 sm:mb-0"
          >
            <div className="mb-6">
              <h2 className="text-[22px] font-semibold text-[#111827] tracking-tight">
                Log in to your account
              </h2>
              <p className="text-[13px] text-[#6B7280] mt-1 font-medium">
                Welcome back! Please enter your details.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-semibold flex items-center gap-2 border border-rose-100"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-[14px]">
              {/* Email Field */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <User className="w-[18px] h-[18px]" />
                </span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  required
                  className="w-full h-[52px] border-[1.5px] border-[#E5E7EB] rounded-xl bg-[#FAFAFA] pl-[44px] pr-4 text-[#111827] placeholder-[#9CA3AF] text-base outline-none transition-all duration-200 ease-in-out focus:border-[#16A34A] focus:ring-[4px] focus:ring-[#16A34A]/8 focus:bg-white cursor-text"
                  placeholder="Your e-mail"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <Lock className="w-[18px] h-[18px]" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full h-[52px] border-[1.5px] border-[#E5E7EB] rounded-xl bg-[#FAFAFA] pl-[44px] pr-12 text-[#111827] placeholder-[#9CA3AF] text-base outline-none transition-all duration-200 ease-in-out focus:border-[#16A34A] focus:ring-[4px] focus:ring-[#16A34A]/8 focus:bg-white cursor-text"
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#16A34A] transition-colors p-1 cursor-pointer animate-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Actions Row */}
              <div className="flex flex-col gap-4 pt-2">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  disabled={isLoading}
                  type="submit"
                  className="w-full h-[52px] bg-[#16A34A] hover:bg-[#15803D] disabled:bg-green-700/50 text-white font-semibold text-sm rounded-[12px] flex items-center justify-center gap-1 shadow-[0_4px_14px_rgba(22,163,74,0.35)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.4)] transition-all duration-[180ms] ease-in-out cursor-pointer tracking-[0.3px]"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>Sign In <span className="text-[15px]">→</span></>
                  )}
                </motion.button>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[13px] text-[#6B7280] font-medium">
                  <Link
                    href={`/signup${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                    className="hover:text-[#16A34A] hover:underline transition-colors duration-150 font-medium min-h-[44px] flex items-center py-2 px-1"
                  >
                    Register
                  </Link>
                  <Link
                    href="/forgot-password"
                    className="hover:text-[#16A34A] hover:underline transition-colors duration-150 font-medium min-h-[44px] flex items-center py-2 px-1"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-[1px] bg-[#F3F4F6]" />
              <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[2px] select-none">or continue with</span>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.button
                whileHover={{ y: -1 }}
                onClick={() => {
                  const r = searchParams.get('redirect') || searchParams.get('callbackUrl') || '';
                  window.location.href = `/api/auth/login/google?prompt=select_account${r ? `&redirect=${encodeURIComponent(r)}` : ''}`;
                }}
                className="flex items-center justify-center gap-2 h-[52px] bg-white border-[1.5px] border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-[12px] font-medium text-[#374151] text-[13px] transition-all duration-150 ease-in-out cursor-pointer px-2"
              >
                <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="truncate">Google</span>
              </motion.button>
              <motion.button
                whileHover={{ y: -1 }}
                onClick={() => {
                  const r = searchParams.get('redirect') || searchParams.get('callbackUrl') || '';
                  window.location.href = `/api/auth/login/github${r ? `&redirect=${encodeURIComponent(r)}` : ''}`;
                }}
                className="flex items-center justify-center gap-2 h-[52px] bg-white border-[1.5px] border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-[12px] font-medium text-[#374151] text-[13px] transition-all duration-150 ease-in-out cursor-pointer px-2"
              >
                <svg className="w-[18px] h-[18px] flex-shrink-0 fill-[#181717]" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span className="truncate">GitHub</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
