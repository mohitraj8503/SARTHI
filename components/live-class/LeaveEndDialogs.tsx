'use client';

import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';

interface LeaveConfirmPopoverProps {
  onCancel: () => void;
  onLeave: () => void;
  loading?: boolean;
}

/**
 * LeaveConfirmPopover — lightweight popover (not full-screen modal).
 * Student-only: simple "Cancel / Leave" choice.
 */
export function LeaveConfirmPopover({ onCancel, onLeave, loading }: LeaveConfirmPopoverProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-5 w-full max-w-xs shadow-2xl">
        <h3 className="text-sm font-semibold text-white mb-1">Leave the class?</h3>
        <p className="text-xs text-slate-400 mb-4">You can rejoin while the class is still live.</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-sm transition-colors"
            id="leave-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={onLeave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            id="leave-confirm-btn"
          >
            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Leave'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface EndClassDialogProps {
  onCancel: () => void;
  onEndForAll: () => void;
  loading?: boolean;
}

/**
 * EndClassDialog — teacher-only, more prominent "End class for everyone."
 * Single primary action: End for all. No ambiguous "OK."
 */
export function EndClassDialog({ onCancel, onEndForAll, loading }: EndClassDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 flex-shrink-0">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">End class for everyone?</h3>
            <p className="text-xs text-slate-400">
              All participants will be removed, the recording will be finalized and uploaded to Drive.
              This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={onEndForAll}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            id="end-for-all-btn"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" />Ending…</> : '🔴 End class for everyone'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-sm transition-colors"
            id="end-cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
