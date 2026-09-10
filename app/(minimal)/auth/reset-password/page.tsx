"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);

  // Dynamic 150% zoom effect on desktop screens
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        document.documentElement.style.zoom = '1.5';
        document.documentElement.style.minHeight = '66.667vh';
        document.documentElement.style.height = '66.667vh';
        document.documentElement.style.overflow = 'hidden';
        
        document.body.style.minHeight = '66.667vh';
        document.body.style.height = '66.667vh';
        document.body.style.overflow = 'hidden';
      } else {
        document.documentElement.style.zoom = '1';
        document.documentElement.style.minHeight = '';
        document.documentElement.style.height = '';
        document.documentElement.style.overflow = '';
        
        document.body.style.minHeight = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.documentElement.style.zoom = '';
      document.documentElement.style.minHeight = '';
      document.documentElement.style.height = '';
      document.documentElement.style.overflow = '';
      
      document.body.style.minHeight = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setStatus('error');
      setMessage("Reset token is missing. Please request a new link.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.message || 'Failed to reset password. The link may have expired.');
        return;
      }

      setStatus('success');
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setStatus('error');
      setMessage('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="bg-white flex overflow-hidden font-plus-jakarta relative"
      style={{
        width: isDesktop ? '66.667vw' : '100vw',
        height: isDesktop ? '66.667vh' : '100vh',
        minHeight: isDesktop ? '66.667vh' : '100vh',
        maxHeight: isDesktop ? '66.667vh' : '100vh',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .font-plus-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        .future-text {
          color: #22c55e;
          text-shadow: 0 0 18px rgba(34, 197, 94, 0.35);
        }

        .premium-input {
          height: 46px;
          border-radius: 12px;
          background: rgba(250, 250, 250, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid #e5e7eb;
          padding: 0 16px;
          transition: all 0.3s ease;
          outline: none;
          width: 100%;
        }
        .premium-input:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
          background: #ffffff;
          transform: scale(1.01);
        }

        .premium-btn {
          background: linear-gradient(90deg, #166534, #22c55e);
          box-shadow: 0 10px 24px rgba(34, 197, 94, 0.2);
          height: 46px;
          border-radius: 12px;
          font-weight: 700;
          color: #ffffff;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          cursor: pointer;
        }
        .premium-btn:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 12px 28px rgba(34, 197, 94, 0.3);
        }
        .premium-btn:active {
          transform: translateY(-1px);
        }

        /* Floating Gradient Blobs */
        @keyframes float-slow-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -25px) scale(1.08); }
        }
        @keyframes float-slow-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-35px, 35px) scale(0.92); }
        }
        .floating-blob-1 {
          animation: float-slow-1 12s ease-in-out infinite;
        }
        .floating-blob-2 {
          animation: float-slow-2 15s ease-in-out infinite;
        }

        @media (min-width: 1024px) {
          .custom-home-btn {
            left: auto !important;
            right: 50% !important;
            margin-right: 24px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
            box-shadow: none !important;
          }
          .custom-home-btn:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            color: #22c55e !important;
          }
        }
      `}</style>

      {/* Floating Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-stone-200/50 backdrop-blur-md text-stone-600 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm hover:-translate-y-0.5 custom-home-btn"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Home
      </Link>

      {/* Left Side - Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center p-20"
      >
        {/* Background Image (Still, no motion effects) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: "url('https://cdn.pixabay.com/photo/2022/10/04/21/25/xr-7499160_1280.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
        {/* Cinematic Overlay - Sibling of image wrapper for reliable stacking */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none" 
          style={{
            background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.58))"
          }}
        />

        <div className="relative z-20 flex flex-col justify-center text-white max-w-[480px]" style={{ transform: 'translateY(-30px)' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col relative"
          >
            {/* Soft glow behind heading */}
            <div 
              className="absolute top-1/4 left-1/4 w-60 h-60 bg-[#22c55e] rounded-full pointer-events-none -z-10"
              style={{ filter: 'blur(80px)', opacity: 0.12 }}
            />

            {/* Small Logo positioned inline and aligned with text left edge */}
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 relative mb-10 overflow-hidden p-1.5 self-start ml-[-6px] opacity-80 hover:opacity-100 transition-all duration-300">
              <div className="relative w-full h-full">
                <Image src="/sarthi-logo.png" alt="SARTHI" fill priority quality={100} unoptimized className="object-contain" />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-6xl text-white mb-6 tracking-tight font-plus-jakarta drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]" 
                style={{ lineHeight: '0.92', letterSpacing: '-2px', fontWeight: 800 }}>
              Secure Your<br />
              <span className="future-text">Account</span>
            </h1>
            
            <p className="text-lg text-stone-300 font-normal leading-relaxed mb-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
              Create a new, strong password to regain access to your professional learning profile.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div 
        className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 md:py-4 md:px-10 relative overflow-hidden"
        style={{
          background: "radial-gradient(circle at top, rgba(34, 197, 94, 0.07), transparent 35%), #f8fffa"
        }}
      >
        {/* Soft floating atmospheric glow blobs */}
        <div 
          className="absolute top-[10%] right-[10%] w-72 h-72 bg-[#4ade80] rounded-full pointer-events-none floating-blob-1" 
          style={{ filter: 'blur(80px)', opacity: 0.15 }}
        />
        <div 
          className="absolute bottom-[10%] left-[10%] w-80 h-80 bg-[#22c55e] rounded-full pointer-events-none floating-blob-2" 
          style={{ filter: 'blur(100px)', opacity: 0.10 }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[440px] relative z-10"
        >
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-[#166534] font-bold text-xs uppercase tracking-wider mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>

          <div className="mb-2">
            <h1 className="text-2xl font-extrabold text-[#166534] tracking-tight mb-1">Set New Password</h1>
            <p className="text-stone-500 text-xs font-semibold leading-relaxed">
              Choose a strong password you haven&apos;t used before.
            </p>
          </div>

          {!token && (
            <div className="mb-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-semibold">
              <p className="flex items-center gap-1 mb-0.5 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                Reset token missing
              </p>
              Please use the link sent to your email. If the problem persists, request a new reset link.
            </div>
          )}

          <AnimatePresence mode="wait">
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-2 p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {status !== 'success' ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-500 ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="premium-input text-[#1A1916] font-semibold pr-10 text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#22c55e] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-500 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="premium-input text-[#1A1916] font-semibold pr-5 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="premium-btn text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Set New Password'
                )}
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-2"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-[#166534] mb-1">Password Updated</h3>
              <p className="text-stone-500 mb-4 font-semibold text-xs">
                Your security credentials have been successfully updated. Redirecting you to sign in...
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[#166534] font-bold text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting...
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-gray-500 font-semibold text-xs">
              Remember your password? <Link href="/login" className="text-[#166534] hover:underline underline-offset-4 decoration-2 font-bold">Sign In</Link>
            </p>

            <div className="flex justify-center gap-4 mt-3.5">
              <Link href="/privacy" className="text-[10px] font-semibold text-stone-400 hover:text-[#22c55e] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[10px] font-semibold text-stone-400 hover:text-[#22c55e] transition-colors">Terms of Service</Link>
              <Link href="/help" className="text-[10px] font-semibold text-stone-400 hover:text-[#22c55e] transition-colors">Support</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#166534]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
