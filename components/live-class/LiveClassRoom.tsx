'use client';

import { useCallback, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useConnectionState,
} from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import '@livekit/components-styles';
import { RecordingBadge } from './RecordingBadge';
import { Loader2, WifiOff } from 'lucide-react';

interface LiveClassRoomProps {
  token: string;
  serverUrl: string;
  liveClassId: string;
  isHost: boolean;
  onEndClass?: () => void;
  onLeave?: () => void;
}

/**
 * LiveClassRoom
 *
 * Main LiveKit video-conferencing UI for a live class.
 *
 * UX improvements (E):
 *  - Shows a "Reconnecting…" overlay when the connection drops (flaky wifi)
 *  - Distinguishes RECONNECTING from DISCONNECTED states
 *  - End Class button is disabled while reconnecting to avoid double-ending
 */
export function LiveClassRoom({
  token,
  serverUrl,
  liveClassId,
  isHost,
  onEndClass,
  onLeave,
}: LiveClassRoomProps) {
  const handleDisconnect = useCallback(() => { onLeave?.(); }, [onLeave]);

  const handleEndClass = useCallback(async () => {
    if (!isHost) return;
    try {
      await fetch('/api/live-class/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveClassId }),
      });
    } catch (err) {
      console.error('[LiveClassRoom] Failed to end class:', err);
    }
    onEndClass?.();
  }, [isHost, liveClassId, onEndClass]);

  return (
    <div className="relative w-full" style={{ height: '100dvh' }}>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={handleDisconnect}
        style={{ height: '100%', background: 'rgb(15 23 42)' }}
      >
        {/* Connection state overlay — E: reconnecting UX */}
        <ConnectionStateOverlay isHost={isHost} onEndClass={handleEndClass} />

        {/* End Class button + optional Recording badge — instructor only */}
        {isHost && (
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            {process.env.NEXT_PUBLIC_RECORDING_ENABLED === 'true' && <RecordingBadge />}
            <EndClassButton onEndClass={handleEndClass} />
          </div>
        )}

        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

/**
 * ConnectionStateOverlay — shows Reconnecting banner on poor network
 * Must be rendered inside <LiveKitRoom> to access the room context.
 */
function ConnectionStateOverlay({
  isHost,
  onEndClass,
}: {
  isHost: boolean;
  onEndClass: () => void;
}) {
  const state = useConnectionState();
  const isReconnecting = state === ConnectionState.Reconnecting;

  if (!isReconnecting) return null;

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-3">
        <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30">
          <WifiOff size={28} className="text-amber-400" />
        </div>
        <h2 className="text-white font-semibold text-lg">Reconnecting…</h2>
        <p className="text-slate-400 text-sm text-center max-w-xs">
          Poor network connection. Trying to reconnect automatically.
        </p>
        <Loader2 size={20} className="animate-spin text-indigo-400" />
      </div>
    </div>
  );
}

/**
 * EndClassButton — uses connection state to disable while reconnecting
 */
function EndClassButton({ onEndClass }: { onEndClass: () => void }) {
  const state = useConnectionState();
  const [ending, setEnding] = useState(false);
  const isReconnecting = state === ConnectionState.Reconnecting;

  const handle = async () => {
    if (isReconnecting || ending) return;
    setEnding(true);
    await onEndClass();
    setEnding(false);
  };

  return (
    <button
      id="end-class-btn"
      onClick={handle}
      disabled={isReconnecting || ending}
      className="px-4 py-1.5 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {ending ? 'Ending…' : 'End Class'}
    </button>
  );
}
