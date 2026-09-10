'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LayoutDashboard, RefreshCw } from 'lucide-react';

export default function UnauthorizedPage() {
  const handleReauthenticate = () => {
    try {
      // Clear session cookies to allow fresh login with updated permissions
      document.cookie = 'tt_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'user_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch (_) {}
    window.location.href = '/login';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        minWidth: '100vw',
        minHeight: '100vh',
        zIndex: 999999,
        background: 'radial-gradient(circle at center, #0e3020 0%, #06170e 100%)',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Glassmorphic Card */}
      <div
        className="relative z-10 max-w-lg w-full rounded-3xl p-8 sm:p-10 text-center shadow-2xl transition-all"
        style={{
          background: 'rgba(15, 35, 25, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 50px rgba(16, 185, 129, 0.15)',
        }}
      >
        {/* Shield Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-10 h-10 text-rose-500 animate-pulse" />
        </div>

        {/* Title */}
        <h1
          className="text-2xl sm:text-3xl font-black mb-3 tracking-tight uppercase"
          style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
        >
          Access Restricted
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base font-medium text-emerald-100/90 leading-relaxed mb-8">
          Your current session token does not have authorization for this area. If your account role or permissions were recently updated, please re-authenticate to refresh your security credentials.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
          <button
            onClick={handleReauthenticate}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Re-authenticate / Sign In
          </button>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-100 font-bold text-xs uppercase tracking-wider rounded-2xl border border-emerald-700/50 transition-all active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            Go to Dashboard
          </Link>
        </div>

        {/* Secondary Return Link */}
        <div className="mt-6 pt-6 border-t border-emerald-900/60">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400/90 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to SARTHI Home
          </Link>
        </div>
      </div>
    </div>
  );
}
