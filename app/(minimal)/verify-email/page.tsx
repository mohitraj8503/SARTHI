'use client';
 
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
 
function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get('email');
 
  const [email, setEmail] = useState(emailParam || '');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
 
  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setInterval(() => {
        setCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownSeconds]);
 
  const handleResendEmail = async () => {
    if (!email) {
      setResendStatus('error');
      setResendMessage('Please enter your email address');
      return;
    }
 
    triggerHaptic('medium');
    setResendStatus('loading');
    setResendMessage('');
 
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
 
      const data = await response.json();
 
      if (response.ok) {
        setResendStatus('success');
        setResendMessage(data.message || 'Verification link sent! Please check your inbox.');
        setCooldownSeconds(data.cooldownSeconds || 60);
        triggerHaptic('success');
      } else {
        setResendStatus('error');
        setResendMessage(data.message || 'Failed to resend verification email.');
        if (data.cooldownSeconds) setCooldownSeconds(data.cooldownSeconds);
        triggerHaptic('error');
      }
    } catch {
      setResendStatus('error');
      setResendMessage('Connection error. Please try again.');
      triggerHaptic('error');
    }
  };
 
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-[#1A3C2E]/10 p-10 text-center border border-[#E8E2D9]"
      >
        {/* Brand Logo / Accent */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-[#1A3C2E] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1A3C2E]/20">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>
 
        <h1 className="text-3xl font-bold text-[#1A3C2E] mb-3 tracking-tight">
          Verify your email
        </h1>
        
        <p className="text-[#5D705C] mb-8 font-medium">
          We&apos;ve sent a verification link to <br/>
          <span className="text-[#1A3C2E] font-bold">{email || 'your email address'}</span>
        </p>
 
        <div className="bg-[#F9F7F2] border border-[#E8E2D9] rounded-2xl p-6 mb-8 text-sm text-[#1A3C2E] text-left">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
            <p>
              Click the link in the email to activate your account. If you don&apos;t see it, check your spam folder.
            </p>
          </div>
        </div>
 
        {/* Resend Action */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {resendMessage && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`text-sm font-bold ${resendStatus === 'success' ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {resendMessage}
              </motion.p>
            )}
          </AnimatePresence>
 
          {!emailParam && (
             <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="Confirm your email"
               className="w-full h-12 px-4 rounded-xl border border-[#E8E2D9] mb-2 focus:ring-2 focus:ring-[#2D6A4F] outline-none transition-all text-center"
             />
          )}
 
          <button
            onClick={handleResendEmail}
            disabled={resendStatus === 'loading' || cooldownSeconds > 0}
            className="w-full h-14 bg-[#1A3C2E] text-white font-bold rounded-2xl hover:bg-[#2D6A4F] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-[#1A3C2E]/10"
          >
            {resendStatus === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : cooldownSeconds > 0 ? (
              `Resend in ${cooldownSeconds}s`
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Resend link
              </>
            )}
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="flex items-center justify-center gap-2 text-[#5D705C] hover:text-[#1A3C2E] font-bold text-sm transition-colors w-full pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
 
export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center font-bold text-[#1A3C2E]">Initializing Node...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
