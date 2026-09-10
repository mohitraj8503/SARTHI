'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react';

export default function EnrollmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Enrollment Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8F5EE] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-red-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-black text-[#1A3C2E] mb-3 tracking-tight">
          System Sync Failed
        </h1>
        
        <p className="text-[#5D705C] mb-8 font-medium leading-relaxed">
          We encountered a technical synchronization error while confirming your enrollment. 
          Your payment might have been successful, but we couldn&apos;t load the confirmation.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full bg-[#1A3C2E] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#2D6A4F] transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Reconnecting
          </button>
          
          <Link
            href="/dashboard"
            className="w-full bg-[#F5F0E8] text-[#1A3C2E] py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#EAE6DF] transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to My Dashboard
          </Link>
        </div>

        <p className="mt-8 text-[11px] text-[#A8B8D8] font-bold uppercase tracking-widest">
          Error Logged: {error.digest || 'Internal_State_Collision'}
        </p>
      </div>
    </div>
  );
}
