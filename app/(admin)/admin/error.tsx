'use client';

import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mb-8 border border-red-500/20">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
      
      <div className="space-y-4 max-w-md mb-12">
        <h2 className="text-2xl font-black text-[#1C2B4A] uppercase tracking-tighter italic">
          System Error
        </h2>
        <p className="text-sm font-medium text-[#1C2B4A]/60 leading-relaxed">
          The core system encountered an unexpected disruption while processing your request. Error metrics have been logged for review.
        </p>
        <code className="block p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-[10px] text-red-600 font-mono overflow-auto italic">
          {error.message || 'CRITICAL_INTERNAL_EXCEPTION'}
        </code>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-3 px-8 py-4 bg-[#1C2B4A] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#2D457A] transition-all shadow-xl active:scale-95 italic"
        >
          <RefreshCcw className="w-4 h-4" /> REBOOT_SESSION
        </button>
        <Link
          href="/admin"
          className="flex items-center gap-3 px-8 py-4 bg-white border border-[#E2E8F4] text-[#1C2B4A] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#F0F2F8] transition-all italic"
        >
          <Home className="w-4 h-4" /> Main Dashboard
        </Link>
      </div>
    </div>
  );
}

