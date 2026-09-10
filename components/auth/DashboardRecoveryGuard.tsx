'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ShieldAlert, ArrowRight, RefreshCcw } from 'lucide-react';

interface DiagnosticInfo {
  reason: string;
  route: string;
  timestamp: string;
  role?: string;
  signatureId: string;
  isTimeout: boolean;
}

interface DashboardRecoveryGuardProps {
  children: React.ReactNode;
  timeoutMs?: number;
  isLoading?: boolean;
  hasData?: boolean;
  expectedRole?: string | string[];
  routeName?: string;
}

// Global module-level lock to guarantee EXACTLY ONE recovery redirect across the entire application lifecycle
let globalRecoveryLock = false;
const RECOVERY_COOLDOWN_MS = 30000;

export default function DashboardRecoveryGuard({
  children,
  timeoutMs = 10000,
  isLoading = false,
  hasData = true,
  expectedRole,
  routeName,
}: DashboardRecoveryGuardProps) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [recoveryTriggered, setRecoveryTriggered] = useState(false);
  const [isLoopProtected, setIsLoopProtected] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);

  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasFiredRef = useRef(false);
  const currentRoute = routeName || pathname || 'dashboard';

  // Logging Helper
  const logNavEvent = useCallback((event: string, details?: any) => {
    console.log(`[RECOVERY_GUARD] [${currentRoute}] ${event}`, details || '');
  }, [currentRoute]);

  // Central, Deterministic Recovery Execution
  const executeRecovery = useCallback((reason: string, isTimeout: boolean = false) => {
    // Never execute recovery if currently on login route
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) {
      return;
    }

    if (globalRecoveryLock || recoveryTriggered || hasFiredRef.current) {
      logNavEvent('[RECOVERY] Ignored duplicate recovery call (lock active)', { reason });
      return;
    }
    hasFiredRef.current = true;

    const timestamp = new Date().toISOString();
    const signatureId = `ERR-REC-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const info: DiagnosticInfo = {
      reason,
      route: currentRoute,
      timestamp,
      role: user?.role || 'UNKNOWN',
      signatureId,
      isTimeout,
    };

    logNavEvent('[RECOVERY] recovery triggered', info);

    // Anti-loop check using sessionStorage
    let isCooldownActive = false;
    try {
      const lastRecoveryStr = sessionStorage.getItem('tt_last_recovery_time');
      const lastRecoveryTime = lastRecoveryStr ? parseInt(lastRecoveryStr, 10) : 0;
      if (Date.now() - lastRecoveryTime < RECOVERY_COOLDOWN_MS) {
        isCooldownActive = true;
      }
    } catch (e) {}

    if (isCooldownActive) {
      logNavEvent('[RECOVERY] Cooldown active — displaying in-place recovery UI without auto-redirect');
      setDiagnostics(info);
      setRecoveryTriggered(true);
      setIsLoopProtected(true);
      return;
    }

    // Acquire global lock immediately
    globalRecoveryLock = true;
    setDiagnostics(info);
    setRecoveryTriggered(true);

    try {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('tt_last_recovery_time', Date.now().toString());
    } catch (e) {}

    logNavEvent('[NAV] redirect requested: /login via window.location.replace', { reason, signatureId, source: 'DashboardRecoveryGuard' });

    // Execute immediate replacement without delay race window for auth failures
    const delay = isTimeout ? 1200 : 0;
    setTimeout(() => {
      window.location.replace(`/login?reason=${encodeURIComponent(reason)}&sig=${signatureId}`);
    }, delay);
  }, [currentRoute, user, recoveryTriggered, logNavEvent]);

  // -------------------------------------------------------------
  // RULE 2 & 3: Watchdog Logic
  // ONLY start dashboard watchdog AFTER authLoading === false AND user !== null!
  // -------------------------------------------------------------
  useEffect(() => {
    // If auth is still loading, DO NOTHING. (Do not count login/auth processing as a failure!)
    if (authLoading) {
      logNavEvent('[RECOVERY] Auth initializing — watchdog idle');
      return;
    }

    // If no user exists after authLoading === false, auth failure watchdog handles it below.
    if (!user) {
      return;
    }

    // Auth is resolved and user exists! Check dashboard loading status.
    const isDashboardLoading = isLoading;

    if (isDashboardLoading) {
      if (!watchdogTimerRef.current) {
        logNavEvent('[RECOVERY] watchdog started', { timeoutMs });
        watchdogTimerRef.current = setTimeout(() => {
          logNavEvent('[RECOVERY] watchdog timeout reached');
          setHasTimedOut(true);
          executeRecovery('DASHBOARD_INITIALIZATION_TIMEOUT', true);
        }, timeoutMs);
      }
    } else {
      // Dashboard is ready — cancel watchdog timer!
      if (watchdogTimerRef.current) {
        logNavEvent('[RECOVERY] dashboardReady — canceling watchdog');
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
    }

    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
    };
  }, [authLoading, user, isLoading, timeoutMs, executeRecovery, logNavEvent]);

  // -------------------------------------------------------------
  // RULE 2: Auth Failure / Role Mismatch Watchdog
  // ONLY evaluate AFTER authLoading === false!
  // -------------------------------------------------------------
  useEffect(() => {
    // CRITICAL: Do NOT recover during auth initialization
    if (authLoading) return;

    // Case A: Auth completed, but session is invalid/null on a protected route
    if (!user) {
      logNavEvent('[AUTH] Unauthenticated session detected after auth resolved');
      executeRecovery('UNAUTHENTICATED_SESSION_EXPIRED');
      return;
    }

    logNavEvent('[AUTH] profile resolved', { userId: user.id, role: user.role });

    // Case B: User role does not match expected role
    if (expectedRole) {
      const allowedRoles = Array.isArray(expectedRole)
        ? expectedRole.map(r => r.toUpperCase())
        : [expectedRole.toUpperCase()];

      const userRole = (user.role || '').toUpperCase();
      logNavEvent('[AUTH] role resolved', { userRole, allowedRoles });

      if (!allowedRoles.includes(userRole)) {
        executeRecovery(`ROLE_MISMATCH_EXPECTED_${allowedRoles.join('_')}_GOT_${userRole}`);
        return;
      }
    }

    // Case C: Dashboard data explicitly failed to load (data is false/null when loading finished)
    if (!isLoading && hasData === false) {
      logNavEvent('[RECOVERY] Critical dashboard data is null/missing');
      executeRecovery('CRITICAL_DASHBOARD_DATA_NULL');
      return;
    }
  }, [authLoading, user, expectedRole, isLoading, hasData, executeRecovery, logNavEvent]);

  // Manual Sign Out Action
  const handleManualSignOut = async () => {
    logNavEvent('[AUTH] Manual sign-out triggered from recovery UI');
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}

    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.replace('/login?reason=manual_signout');
  };

  const handleManualRetry = () => {
    globalRecoveryLock = false;
    sessionStorage.removeItem('tt_last_recovery_time');
    window.location.reload();
  };

  if (recoveryTriggered || hasTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 font-sans selection:bg-amber-100 selection:text-amber-900 z-[9999] relative">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 border border-amber-200 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-widest">
              Session Expired
            </span>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Session Timed Out
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto font-medium">
              Your session has expired or was cleared. Please sign in again to continue to your workspace.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleManualSignOut}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1B4332] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#143326] transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <span>Sign In Again</span>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </button>

            {isLoopProtected && (
              <button
                onClick={handleManualRetry}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
