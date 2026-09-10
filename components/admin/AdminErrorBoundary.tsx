'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, ShieldAlert, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enterprise Admin Error Boundary
 * Prevents full dashboard crashes from isolated component or hook failures.
 */
export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ADMIN_RUNTIME_ERROR]", error, errorInfo);
    // In a prod environment, this is where we'd push to Sentry/LogDNA
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center bg-white rounded-[32px] border border-red-100 shadow-xl m-8">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-8 border border-red-100">
            <ShieldAlert className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-black text-[#1C2B4A] mb-4 italic uppercase tracking-tight">
            Dashboard_Link_Severed
          </h1>
          
          <div className="max-w-md mx-auto space-y-4 mb-10">
            <p className="text-[#7A8FAF] font-medium leading-relaxed">
              We encountered a runtime kernel exception in this admin module. 
              The system protected your active session by isolating the crash.
            </p>
            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-500/10 text-left">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-1">Error_Diagnostic:</span>
              <code className="text-[11px] font-mono text-red-700/80 line-clamp-2">
                {this.state.error?.message || "UNDEFINED_CORE_FAILURE"}
              </code>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={this.handleRetry}
              className="px-8 py-4 bg-[#1C2B4A] text-white rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-lg active:scale-95"
            >
              <RefreshCcw className="w-4 h-4" />
              Re-establish_Link
            </button>
            <Link
              href="/admin"
              className="px-8 py-4 border border-[#E2E8F4] text-[#7A8FAF] rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center gap-3 hover:bg-neutral-50 transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Link>
            <button
              onClick={() => {
                try { localStorage.clear(); sessionStorage.clear(); } catch(e) {}
                fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
                window.location.href = '/login?reason=admin_error_logout';
              }}
              className="px-8 py-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 transition-all active:scale-95"
            >
              Sign Out
            </button>
          </div>

          <p className="mt-12 text-[9px] font-black text-[#7A8FAF]/40 uppercase tracking-[0.3em]">
            Safety_Protocol_Gamma_Active
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

