'use client';

/**
 * Login Page Error Boundary
 * This catches runtime errors in the login flow (e.g. Supabase config missing)
 * and prevents the "White Screen of Death".
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to your error reporting service
    console.error('LOGIN_PAGE_CRASH:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl shadow-[#1A3C2E]/5 border border-[#E8E2D9] text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-red-500 w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-[#1A3C2E] mb-2">Something went wrong</h2>
        <p className="text-[#5D705C] text-sm mb-8 leading-relaxed">
          We encountered an error while trying to load the login page. This could be due to a temporary connection issue or missing service configuration.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full h-12 bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#1A3C2E]/10"
          >
            <RotateCcw size={18} />
            Try Again
          </button>
          
          <Link
            href="/"
            className="w-full h-12 bg-white border border-[#E8E2D9] hover:border-[#1A3C2E] text-[#1A3C2E] rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#F5F0E8] text-center">
          <span className="text-[10px] text-[#B5C4B5] uppercase tracking-widest font-bold">
            Support ID: {error.digest || 'system-nexus-error'}
          </span>
        </div>
      </div>
    </div>
  );
}

