'use client';

import { Activity, RotateCcw, LayoutDashboard } from 'lucide-react';
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
      <div className="w-16 h-16 bg-red-500/10 rounded-[24px] flex items-center justify-center mb-6 border border-red-500/20">
        <Activity className="w-8 h-8 text-red-600" />
      </div>
      
      <div className="space-y-3 max-w-sm mb-10">
        <h2 className="text-xl font-black text-[#1A3C2E] uppercase tracking-tight italic">
          Studio_Link_Failure
        </h2>
        <p className="text-[13px] font-medium text-[#5D705C] leading-relaxed">
          We&apos;ve lost synchronization with the instruction server. Please verify your connection or re-initialize the studio.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="flex-1 px-8 py-4 bg-[#1A3C2E] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-lg active:scale-95 italic"
        >
          <RotateCcw className="w-4 h-4 inline mr-2" /> RE_INITIALIZE
        </button>
        <Link
          href="/teacher"
          className="flex-1 px-8 py-4 bg-white border border-[#E8E2D9] text-[#1A3C2E] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#F5F0E8] transition-all italic text-center"
        >
          <LayoutDashboard className="w-4 h-4 inline mr-2" /> DASHBOARD
        </Link>
      </div>
    </div>
  );
}

