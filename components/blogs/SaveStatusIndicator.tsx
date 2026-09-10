'use client'

import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  onRetry?: () => void;
}

/**
 * Real-Time Save Status Indicator
 * Provides reassuring feedback to writers about their data safety.
 */
export function SaveStatusIndicator({ isSaving, lastSaved, error, onRetry }: SaveStatusProps) {
  return (
    <div className="fixed bottom-24 md:bottom-8 right-6 z-50 flex items-center gap-3">
      {isSaving && (
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-900 text-white rounded-full shadow-2xl animate-pulse">
          <RefreshCw size={14} className="animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest">Syncing Draft...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full shadow-2xl">
          <AlertCircle size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
          <button onClick={onRetry} className="ml-2 underline text-[10px] font-black">Retry</button>
        </div>
      )}

      {!isSaving && !error && lastSaved && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white text-slate-400 rounded-full shadow-lg border border-slate-100">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
          </span>
        </div>
      )}

      {!lastSaved && !isSaving && !error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white text-slate-300 rounded-full shadow-sm border border-slate-50">
          <Cloud size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Edits</span>
        </div>
      )}
    </div>
  );
}
