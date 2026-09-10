'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Loader2, CheckCircle2,
  AlertCircle, ArrowLeft, User, Lock, Mail, Check, Leaf
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { triggerHaptic } from '@/lib/haptics';
import { redirectByRole } from '@/lib/auth-ui';
import { useToast } from '@/components/ToastProvider';
import { ZoomControl } from '@/components/auth/ZoomControl';
import { usePageZoom } from '@/lib/usePageZoom';

import { useAuth } from '@/components/AuthProvider';

function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthMeta = [
  { label: '', color: 'bg-gray-100' },
  { label: 'Weak', color: 'bg-rose-400' },
  { label: 'Fair', color: 'bg-amber-400' },
  { label: 'Good', color: 'bg-emerald-400' },
  { label: 'Strong', color: 'bg-emerald-600' },
  { label: 'Very Strong', color: 'bg-emerald-800' },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const router = useRouter();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const { user, loading: authLoading } = useAuth();

  // If user is already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      const targetUrl = searchParams.get('callbackUrl') || searchParams.get('redirect');
      if (targetUrl && targetUrl.startsWith('/')) {
        router.push(targetUrl);
      } else {
        redirectByRole(user.role, router, user.onboarded);
      }
    }
  }, [user, authLoading, router, searchParams]);

  const { zoom, isDesktop } = usePageZoom();

  const strength = getStrength(formData.password);
  const meta = strengthMeta[strength];

  const checks = [
    { label: '8+ Chars', ok: formData.password.length >= 8 },
    { label: 'Upper', ok: /[A-Z]/.test(formData.password) },
    { label: 'Lower', ok: /[a-z]/.test(formData.password) },
    { label: 'Num', ok: /[0-9]/.test(formData.password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      triggerHaptic('error');
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email.toLowerCase(),
          password: formData.password,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Registration is temporarily busy. Please wait 30 seconds and try again.');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      triggerHaptic('success');
      setSuccess(true);
      addToast({
        type: 'success',
        title: 'Account Created',
        message: 'Your professional journey starts here! Redirecting...'
      });

      setTimeout(() => {
        if (callbackUrl && callbackUrl.startsWith('/')) {
          router.push(callbackUrl);
        } else {
          redirectByRole(data.user.role, router, data.user.onboarded);
        }
      }, 1200);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      triggerHaptic('error');
    }
  };

  return (
    <div
      className="bg-[#0A3019] lg:bg-white font-inter relative flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto min-h-screen"
      style={{
        width: isDesktop ? `${(100 / zoom).toFixed(3)}vw` : '100vw',
        height: isDesktop ? `${(100 / zoom).toFixed(3)}vh` : 'auto',
        minHeight: isDesktop ? 'auto' : '100dvh',
        overflowY: isDesktop ? 'hidden' : 'auto',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,600&display=swap');
        
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

      <ZoomControl />

      {/* Back to Home Button (Glassmorphism Pill) */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 inline-flex items-center gap-2 px-[18px] py-2 rounded-[24px] bg-white/12 border border-white/20 backdrop-blur-md text-white font-medium text-[13px] transition-all duration-200 ease-in-out hover:bg-white/22"
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
        className="absolute inset-y-0 left-0 w-full lg:w-[68%] z-10 hidden lg:block pointer-events-none"
        style={{
          clipPath: 'ellipse(100% 100% at 0% 50%)',
          background: 'radial-gradient(circle at center, rgba(20, 83, 45, 0.72) 0%, rgba(10, 48, 25, 0.85) 100%)',
          filter: 'blur(1px)',
        }}
      />

      {/* SUCCESS SCREEN */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-8"
          >
            <div className="w-24 h-24 bg-[#16A34A] rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl">
              <Check className="text-white w-12 h-12 animate-pulse" strokeWidth={4} />
            </div>
            <h2 className="text-3xl font-extrabold text-[#16A34A] mb-4">Account Created!</h2>
            <div className="flex items-center gap-3 text-green-800 font-bold bg-[#f0fdf4] px-6 py-3 rounded-full border border-green-100 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Setting up your workspace...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT SECTION: Hero Content */}
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

      {/* RIGHT SECTION: Floating Signup Card */}
      <div className="w-full lg:w-[45%] relative z-30 flex items-start sm:items-center justify-center px-4 pt-4 pb-16 sm:py-8 lg:p-12 min-h-[50vh] sm:min-h-[70vh] lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full md:w-[90%] lg:w-[480px] bg-white/97 rounded-[24px] border border-white/80 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08),0_24px_48px_rgba(0,0,0,0.06)] py-8 px-6 sm:py-[44px] sm:px-[40px] flex flex-col mb-6 sm:mb-0"
        >
          <div className="mb-6">
            <h2 className="text-[22px] font-semibold text-[#111827] tracking-tight">
              Create your account
            </h2>
            <p className="text-[13px] text-[#6B7280] mt-1 font-medium">
              Join SARTHI and start learning today.
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
            {/* Full Name */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <User className="w-[18px] h-[18px]" />
              </span>
              <input
                type="text"
                autoComplete="name"
                required
                className="w-full h-[52px] border-[1.5px] border-[#E5E7EB] rounded-xl bg-[#FAFAFA] pl-[44px] pr-4 text-[#111827] placeholder-[#9CA3AF] text-base outline-none transition-all duration-200 ease-in-out focus:border-[#16A34A] focus:ring-[4px] focus:ring-[#16A34A]/8 focus:bg-white cursor-text"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <Mail className="w-[18px] h-[18px]" />
              </span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
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
                autoComplete="new-password"
                required
                className="w-full h-[52px] border-[1.5px] border-[#E5E7EB] rounded-xl bg-[#FAFAFA] pl-[44px] pr-12 text-[#111827] placeholder-[#9CA3AF] text-base outline-none transition-all duration-200 ease-in-out focus:border-[#16A34A] focus:ring-[4px] focus:ring-[#16A34A]/8 focus:bg-white cursor-text"
                placeholder="Create a password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#16A34A] transition-colors p-1 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <Lock className="w-[18px] h-[18px]" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="w-full h-[52px] border-[1.5px] border-[#E5E7EB] rounded-xl bg-[#FAFAFA] pl-[44px] pr-12 text-[#111827] placeholder-[#9CA3AF] text-base outline-none transition-all duration-200 ease-in-out focus:border-[#16A34A] focus:ring-[4px] focus:ring-[#16A34A]/8 focus:bg-white cursor-text"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            {/* Password Strength Indicator */}
            {formData.password.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5 px-1 pb-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= strength ? meta.color : 'bg-stone-200'}`} />
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#16A34A]">{meta.label}</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {checks.map(c => (
                      <div key={c.label} className={`flex items-center gap-1 text-[9px] font-bold ${c.ok ? 'text-emerald-600' : 'text-gray-300'}`}>
                        <Check size={8} strokeWidth={4} /> {c.label}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

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
                  <>Sign Up <span className="text-[15px]">→</span></>
                )}
              </motion.button>

              <div className="text-[13px] text-[#6B7280] font-medium text-center sm:text-left">
                Already have an account?{' '}
                <Link
                  href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                  className="hover:text-[#16A34A] hover:underline transition-colors duration-150 font-medium min-h-[44px] inline-flex items-center"
                >
                  Log in
                </Link>
              </div>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-[#F3F4F6]" />
            <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[2px] select-none">or continue with</span>
            <div className="flex-1 h-[1px] bg-[#F3F4F6]" />
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
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" width={18} height={18} className="w-[18px] h-[18px] flex-shrink-0" alt="Google" />
              <span className="truncate">Google</span>
            </motion.button>
            <motion.button
              whileHover={{ y: -1 }}
              onClick={() => {
                const r = searchParams.get('redirect') || searchParams.get('callbackUrl') || '';
                window.location.href = `/api/auth/login/github${r ? `?redirect=${encodeURIComponent(r)}` : ''}`;
              }}
              className="flex items-center justify-center gap-2 h-[52px] bg-white border-[1.5px] border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-[12px] font-medium text-[#374151] text-[13px] transition-all duration-150 ease-in-out cursor-pointer px-2"
            >
              <img src="https://www.svgrepo.com/show/512317/github-142.svg" width={18} height={18} className="w-[18px] h-[18px] flex-shrink-0" alt="GitHub" />
              <span className="truncate">GitHub</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

