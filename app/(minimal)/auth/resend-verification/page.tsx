'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || data.error || 'Something went wrong');

      setStatus('success');
      setMessage(data.message || 'Verification link sent successfully!');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F8F5F0] to-[#FDFBF7] flex">
      {/* Left Side - Image */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B4332]/90 to-[#2D6A4F]/80 z-10" />
        <Image 
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=1200&fit=crop"
          alt="Technical professional"
          fill
          className="object-cover"
        />
        
        <div className="relative z-20 flex flex-col justify-center p-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-3xl">T</span>
              </div>
              <span className="text-3xl font-bold">SARTHI</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-6">Verify Your Identity</h2>
            <p className="text-lg text-gray-200 max-w-md leading-relaxed">
              Verify your email address to unlock full access to your learning path and industry certifications.
            </p>
          </motion.div>
        </div>

        {/* Floating Orbs */}
        <motion.div 
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-20 right-20 w-64 h-64 bg-[#40916C]/20 rounded-full blur-3xl z-10"
        />
      </motion.div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative">
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#40916C]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#1B4332]/5 rounded-full blur-3xl" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1B4332] font-semibold mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Sign In
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-bold text-[#1B4332] mb-3">Resend Link</h1>
            <p className="text-gray-600 text-lg">
              Missing your verification email? No problem.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {status !== 'success' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1B4332] focus:ring-4 focus:ring-[#1B4332]/10 transition-all text-gray-800 placeholder-gray-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white rounded-xl font-bold text-lg shadow-lg shadow-[#1B4332]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  'Send Verification Email'
                )}
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#1B4332] mb-3">Check Your Inbox</h3>
              <p className="text-gray-600 mb-8">{message}</p>
              <Link
                href="/login"
                className="w-full py-4 bg-[#1B4332] text-white rounded-xl font-bold text-lg block shadow-lg shadow-[#1B4332]/20 hover:scale-[1.02] transition-all"
              >
                Back to Sign In
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

