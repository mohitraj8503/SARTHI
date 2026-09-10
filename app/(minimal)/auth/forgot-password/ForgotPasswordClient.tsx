'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CircuitBoard } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { motion } from 'framer-motion';

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStatus('success');
      setMessage(data.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong');
    }
  };

  return (
    <AuthLayout title="Forgot Password?" subtitle="No worries, we'll send you reset instructions. Enter your email address below and we'll send you a secure link to reset your password. The link will expire in 24 hours for your security.">
      <div className="space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider mb-2"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Login
        </Link>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Check your email</h3>
            <p className="text-sm text-slate-300">{message}</p>
          </motion.div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Email address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs uppercase tracking-[2px] shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 group"
            >
              {status === 'loading' ? (
                <>
                  <CircuitBoard className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}

