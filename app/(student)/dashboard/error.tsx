'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home, Wrench } from 'lucide-react';
import Link from 'next/link';
import { performFullSARTHICacheReset } from '@/lib/client-cache-reset';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full bg-white rounded-[40px] p-8 sm:p-10 border border-red-100 shadow-2xl shadow-red-500/5 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mx-auto ring-8 ring-red-50/50">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-brand-dark uppercase italic">Something <span className="text-red-600">went wrong</span></h1>
          <p className="text-sm text-premium-muted font-medium">
            We encountered an unexpected error while preparing your dashboard. Don&apos;t worry, your progress is safe.
          </p>
        </div>

        <div className="p-4 bg-red-50/80 border border-red-100 rounded-2xl text-left space-y-1.5 overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono text-red-500 font-bold uppercase tracking-widest">
            <span>Diagnostic Info</span>
            {error.digest && <span>ID: {error.digest}</span>}
          </div>
          {error.message && (
            <p className="text-xs font-mono text-red-700 break-words leading-relaxed font-semibold">{error.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-dark text-white rounded-2xl font-bold text-sm hover:bg-brand-orange transition-all shadow-lg active:scale-95 focus-visible:ring-4 focus-visible:ring-brand-orange/30"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-premium-border text-brand-dark rounded-2xl font-bold text-sm hover:bg-premium-surface transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-brand-dark/10"
            >
              <Home className="w-4 h-4" />
              Back Home
            </Link>
          </div>

          <button
            onClick={() => performFullSARTHICacheReset('/dashboard/internship')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 text-white rounded-2xl font-bold text-sm hover:bg-amber-600 transition-all shadow-md active:scale-95"
            title="Clears all local storage, cookies, and cache then reloads dashboard"
          >
            <Wrench className="w-4 h-4" />
            Fix System & Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
}
