'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { performFullSARTHICacheReset } from '@/lib/client-cache-reset';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('CRITICAL_SYSTEM_FAIL:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6 selection:bg-[#1B4332]/10">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Decorative background element */}
          <div className="absolute inset-0 bg-[#1B4332]/5 blur-3xl rounded-full -z-10" />
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-50 mb-8 border border-red-100 shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-[#1B4332] tracking-tight mb-6">
            System <span className="text-[#40916C]">Interrupted</span>
          </h1>
          
          <p className="text-xl text-[#5F6E5F] font-medium max-w-lg mx-auto mb-10 leading-relaxed">
            We&apos;ve encountered a high-priority exception during processing. Our diagnostic systems have logged the event.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#1B4332] text-white rounded-2xl font-bold text-base shadow-xl shadow-[#1B4332]/20 hover:bg-[#2D6A4F] hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              Try Recovery
            </button>

            <button
              onClick={() => performFullSARTHICacheReset()}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold text-base shadow-xl shadow-amber-500/20 hover:bg-amber-600 hover:-translate-y-0.5 transition-all active:scale-95"
              title="Clears all site cache, cookies, and local data, then reloads clean session"
            >
              <Wrench className="w-5 h-5" />
              Fix System & Clear Cache
            </button>
            
            <Link 
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white border border-[#EAE6DF] text-[#1B4332] rounded-2xl font-bold text-base hover:bg-[#FDFBF7] hover:border-[#1B4332]/20 transition-all"
            >
              <Home className="w-5 h-5" />
              Return Base
            </Link>
          </div>

          <div className="mt-10 p-4 bg-red-50/80 border border-red-200/80 rounded-2xl text-left max-w-lg mx-auto space-y-2 backdrop-blur-sm shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-red-700">
              <span>Diagnostic Information</span>
              <span className="font-mono text-red-500">{error.digest ? `ID: ${error.digest}` : 'Client Exception'}</span>
            </div>
            {error.message && (
              <p className="text-xs font-mono text-red-900 break-words font-semibold bg-white/70 p-2.5 rounded-xl border border-red-100/60 leading-relaxed">
                {error.message}
              </p>
            )}
            <p className="text-[9px] font-mono text-red-400 text-right">
              {new Date().toISOString()}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#EAE6DF]/50">
            <p className="text-xs font-bold text-[#1B4332]/30 uppercase tracking-[0.2em]">
              Error Signature: {error.digest || 'UNSPECIFIED_CORE_FAIL'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
