'use client';

import { useEffect, useState } from 'react';
import { useIsRecording, useParticipants, useRoomInfo, useConnectionQualityIndicator, useLocalParticipant } from '@livekit/components-react';
import { Users, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { ConnectionQuality } from 'livekit-client';

interface TopBarProps {
  classTitle: string;
  isHost: boolean;
  participantCount: number;
  onParticipantsClick: () => void;
  egressFailed?: boolean;
  startedAt?: Date | null;
}

/**
 * TopBar
 *
 * Fixed to top of the meeting shell:
 *  - Class title
 *  - ● Recording indicator (pulsing, host-only warning if egress failed)
 *  - ⏱ Elapsed timer (counts up from startedAt)
 *  - Participant count pill (click opens drawer)
 *  - Network quality icon (per-user, your connection only)
 */
export function TopBar({ classTitle, isHost, participantCount, onParticipantsClick, egressFailed, startedAt }: TopBarProps) {
  const isRecording = useIsRecording();
  const elapsed = useElapsedTime(startedAt);
  const { localParticipant } = useLocalParticipant();
  const { quality } = useConnectionQualityIndicator({ participant: localParticipant });

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 backdrop-blur-sm border-b border-white/5 flex-shrink-0 z-20">
      {/* Left: title */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-sm font-semibold text-white truncate max-w-[200px] md:max-w-sm">
          {classTitle}
        </h1>
      </div>

      {/* Center: recording + timer */}
      <div className="flex items-center gap-3">
        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-1.5 text-xs" title="This class is being recorded">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-red-400 font-medium hidden sm:block">Recording</span>
          </div>
        )}

        {/* Host-only: egress failed warning */}
        {isHost && egressFailed && !isRecording && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400" title="Recording failed to start">
            <AlertTriangle size={13} />
            <span className="hidden sm:block">Not recording</span>
          </div>
        )}

        {/* Elapsed timer */}
        {elapsed && (
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono tabular-nums">
            ⏱ {elapsed}
          </div>
        )}
      </div>

      {/* Right: participants + network */}
      <div className="flex items-center gap-2">
        {/* Network quality */}
        <NetworkQuality quality={quality} />

        {/* Participant count pill */}
        <button
          id="top-participants-btn"
          onClick={onParticipantsClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs transition-colors"
          title="Open participants"
        >
          <Users size={13} />
          {participantCount}
        </button>
      </div>
    </div>
  );
}

function NetworkQuality({ quality }: { quality: ConnectionQuality }) {
  const map: Record<ConnectionQuality, { label: string; color: string; icon: React.ReactNode }> = {
    [ConnectionQuality.Excellent]: { label: 'Excellent connection', color: 'text-green-400', icon: <Wifi size={15} /> },
    [ConnectionQuality.Good]:      { label: 'Good connection',      color: 'text-green-400', icon: <Wifi size={15} /> },
    [ConnectionQuality.Poor]:      { label: 'Poor connection',      color: 'text-amber-400', icon: <Wifi size={15} /> },
    [ConnectionQuality.Lost]:      { label: 'Connection lost',      color: 'text-red-400',   icon: <WifiOff size={15} /> },
    [ConnectionQuality.Unknown]:   { label: 'Checking connection',  color: 'text-slate-500', icon: <Wifi size={15} /> },
  };
  const info = map[quality] || map[ConnectionQuality.Unknown];
  return (
    <div className={info.color} title={info.label}>
      {info.icon}
    </div>
  );
}

/** Counts up from a start timestamp — returns "00:14:32" format */
function useElapsedTime(startedAt?: Date | null) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!startedAt) return;
    const tick = () => {
      const diff = Math.max(0, Date.now() - startedAt.getTime());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setElapsed(h > 0
        ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return elapsed;
}
