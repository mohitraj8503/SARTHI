'use client';

import { useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { WifiOff, Loader2, RefreshCw } from 'lucide-react';

interface ReconnectingBannerProps {
  onRejoin: () => void;
}

/**
 * ReconnectingBanner
 *
 * Overlays the main stage (not the entire screen — content stays visible/dimmed).
 * Bottom control bar is disabled during reconnect (parent reads isReconnecting).
 * If reconnect fails (30s timeout), shows "Connection lost. Rejoin" button.
 */
export function ReconnectingBanner({ onRejoin }: ReconnectingBannerProps) {
  const state = useConnectionState();

  const isReconnecting = state === ConnectionState.Reconnecting;
  const isDisconnected = state === ConnectionState.Disconnected;

  if (!isReconnecting && !isDisconnected) return null;

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center gap-4 px-6 py-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl max-w-xs text-center">
        <div className={`p-3 rounded-full ${isDisconnected ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
          <WifiOff size={24} className={isDisconnected ? 'text-red-400' : 'text-amber-400'} />
        </div>

        {isReconnecting ? (
          <>
            <div>
              <p className="text-sm font-semibold text-white">Reconnecting…</p>
              <p className="text-xs text-slate-400 mt-1">Poor network connection. Trying to reconnect automatically.</p>
            </div>
            <Loader2 size={20} className="animate-spin text-indigo-400" />
          </>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold text-white">Connection lost</p>
              <p className="text-xs text-slate-400 mt-1">Your connection to the class was lost.</p>
            </div>
            <button
              id="rejoin-after-disconnect-btn"
              onClick={onRejoin}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              <RefreshCw size={15} /> Rejoin
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Hook — returns true while reconnecting (used to disable control bar) */
export function useIsReconnecting() {
  const state = useConnectionState();
  return state === ConnectionState.Reconnecting;
}
