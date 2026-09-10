'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Leaf } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ZoomControl } from '@/components/auth/ZoomControl';
import { usePageZoom } from '@/lib/usePageZoom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const { zoom, isDesktop } = usePageZoom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
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

      {/* RIGHT SECTION: Floating Forgot Password Card */}
      <div className="w-full lg:w-[45%] relative z-30 flex items-start sm:items-center justify-center px-4 pt-4 pb-16 sm:py-8 lg:p-12 min-h-[50vh] sm:min-h-[70vh] lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full md:w-[90%] lg:w-[480px] bg-white/97 rounded-[24px] border border-white/80 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08),0_24px_48px_rgba(0,0,0,0.06)] py-8 px-6 sm:py-[44px] sm:px-[40px] flex flex-col mb-6 sm:mb-0"
        >
          <div className="mb-6">
            <h2 className="text-[22px] font-semibold text-[#111827] tracking-tight">
              Reset your password
            </h2>
            <p className="text-[13px] text-[#6B7280] mt-1 font-medium">
              Enter your registered email to get a reset link.
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

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-[14px]">
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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {/* Submit Button */}
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
                  <>Send Reset Link <span className="text-[15px]">→</span></>
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium">
                  We&apos;ve sent reset instructions to:
                </p>
                <p className="font-semibold text-lg text-[#16A34A] break-all">{email}</p>
              </div>
              <button
                onClick={() => setIsSent(false)}
                className="text-[#16A34A] font-semibold text-sm hover:underline cursor-pointer"
              >
                Didn&apos;t receive the email? Click to resend
              </button>
            </motion.div>
          )}

          {/* Footer Back Link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6B7280] hover:text-[#16A34A] hover:underline transition-colors duration-150 min-h-[44px]"
            >
              <span className="text-[14px]">←</span> Back to login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
