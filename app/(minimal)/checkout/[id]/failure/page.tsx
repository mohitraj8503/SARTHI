'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  XCircle, 
  RefreshCcw, 
  MessageSquare, 
  ArrowLeft,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';

export default function FailurePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-red-500/30 overflow-x-hidden font-sans">
      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/images/instructors/mohit-raj-bg.jpg" 
          fill 
          alt="Cinematic Background" 
          className="object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#020617]/95 to-red-900/10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.05),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')] mix-blend-soft-light" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-red-500 blur-[60px] opacity-20" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <XCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-black tracking-tighter mb-6"
        >
          Payment <span className="text-red-500">Failed.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-slate-400 max-w-xl font-medium leading-relaxed mb-12"
        >
          Your payment could not be completed. No amount has been permanently charged. This can happen due to bank timeout, incorrect details, or insufficient funds.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-white/[0.03] backdrop-blur-2xl rounded-[40px] border border-white/10 p-8 mb-12"
        >
          <div className="flex items-center gap-4 text-left p-4 bg-red-500/5 rounded-2xl border border-red-500/10 mb-8">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-black text-white">Failure Reason</p>
              <p className="text-xs font-medium text-slate-500">Transaction declined by bank / Gateway timeout</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push(`/checkout/${courseId}`)}
              className="flex items-center justify-center gap-3 bg-white text-[#020617] py-4 rounded-2xl font-black hover:bg-[#FBBF24] transition-all group"
            >
              <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Retry Payment
            </button>
            <button
              onClick={() => router.push('/help')}
              className="flex items-center justify-center gap-3 bg-white/[0.05] text-white py-4 rounded-2xl font-black hover:bg-white/[0.1] border border-white/10 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Contact Support
            </button>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => router.push(`/courses/${courseId}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-white font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course Details
        </motion.button>

        {/* Security Badge */}
        <div className="mt-20 flex items-center gap-6 opacity-30 grayscale">
          <ShieldAlert className="w-12 h-12" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest">Secure Gateway</p>
            <p className="text-xs font-bold">Your data is always encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}
