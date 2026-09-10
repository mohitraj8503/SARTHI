'use client';
import { ShieldAlert, RefreshCw, ArrowLeft, ExternalLink } from 'lucide-react';

/**
 * PermissionDenied — full-screen card shown when camera/mic permission
 * is denied at OS or browser level.
 * Shows per-browser instructions detected via userAgent.
 */
export function PermissionDenied({ onRetry }: { onRetry: () => void }) {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isFirefox = ua.includes('Firefox');
  const isSafari = ua.includes('Safari') && !ua.includes('Chrome');

  const steps = isFirefox
    ? ['Click the camera/lock icon in the address bar', 'Set Camera and Microphone to "Allow"', 'Reload the page and click Retry']
    : isSafari
    ? ['Open Safari → Settings for This Website', 'Set Camera and Microphone to "Allow"', 'Reload the page and click Retry']
    : ['Click the camera icon in Chrome/Edge address bar', 'Select "Allow" for both camera and microphone', 'Click Retry below'];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
          <ShieldAlert size={40} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white mb-2">Camera & microphone blocked</h1>
          <p className="text-slate-400 text-sm">Your browser needs permission to access your camera and microphone. Follow these steps:</p>
        </div>
        <ol className="text-left w-full space-y-2">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="flex gap-3 w-full">
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    </div>
  );
}

/** JoinFailed — generic join failure screen */
export function JoinFailed({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-5">
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
          <ShieldAlert size={36} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-slate-400 text-sm">{message || 'Could not join this class. Please try again.'}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onRetry} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors">
            Retry
          </button>
          <a href="mailto:support@sarthi.in" className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white text-sm transition-colors">
            <ExternalLink size={14} /> Contact support
          </a>
        </div>
      </div>
    </div>
  );
}

/** RemovedByHost — shown when teacher removed the student */
export function RemovedByHost({ courseId }: { courseId: string }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-5">
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <ShieldAlert size={36} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white mb-2">You were removed</h1>
          <p className="text-slate-400 text-sm">You were removed from this class by the host. You cannot rejoin this session.</p>
        </div>
        <a href={`/courses/${courseId}`} className="flex items-center gap-2 py-3 px-6 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Return to course page
        </a>
      </div>
    </div>
  );
}

/** ClassFull — shown when room capacity is reached */
export function ClassFull({ onNotifyHost }: { onNotifyHost?: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-5">
        <div className="p-5 rounded-2xl bg-slate-700/40 border border-slate-600/30">
          <ShieldAlert size={36} className="text-slate-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white mb-2">This class is full</h1>
          <p className="text-slate-400 text-sm">The maximum number of participants has been reached. Please wait for someone to leave.</p>
        </div>
        {onNotifyHost && (
          <button onClick={onNotifyHost} className="py-2.5 px-6 rounded-xl border border-white/10 text-slate-300 hover:text-white text-sm transition-colors">
            Notify host
          </button>
        )}
      </div>
    </div>
  );
}
