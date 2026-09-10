'use client';

import { useRef, useState, useCallback } from 'react';
import { ParticipantTile, useParticipantTracks, useLocalParticipant } from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';
import { MicOff, Pin, PinOff, Hand } from 'lucide-react';

interface TileProps {
  participant: Participant;
  isLocal?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
  hasRaisedHand?: boolean;
  isPinned?: boolean;
  onPin?: (identity: string) => void;
  onUnpin?: () => void;
  isHost?: boolean;
  /** compact: used in thumbnail strip */
  compact?: boolean;
}

/**
 * MeetingParticipantTile
 *
 * Custom wrapper around LK's ParticipantTile that adds:
 *  - Animated speaking ring (green border glow)
 *  - Raised hand badge (top-right)
 *  - Mute badge (bottom-left)
 *  - "You" / Host label (bottom-left, alongside mute)
 *  - Right-click context menu to pin/unpin
 *  - Accent border on your own tile
 *  - Loading spinner while video connects
 */
export function MeetingParticipantTile({
  participant, isLocal, isSpeaking, isMuted, hasRaisedHand, isPinned, onPin, onUnpin, isHost, compact,
}: TileProps) {
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const tracks = useParticipantTracks(
    [Track.Source.Camera, Track.Source.ScreenShare],
    participant.identity
  );
  const screenShareTrack = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const primaryTrack = screenShareTrack || tracks?.[0];

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!onPin && !onUnpin) return;
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }, [onPin, onUnpin]);

  const name = participant.name || participant.identity;
  const initials = name.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('');

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 select-none ${
        isSpeaking
          ? 'ring-2 ring-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
          : isLocal
          ? 'ring-1 ring-indigo-500/50'
          : 'ring-0'
      } ${compact ? 'aspect-video' : 'w-full h-full'}`}
      onContextMenu={handleContextMenu}
    >
      {/* LK ParticipantTile handles video rendering + audio playback */}
      {primaryTrack ? (
        <ParticipantTile
          participant={participant}
          trackRef={primaryTrack}
          className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_.lk-participant-placeholder]:hidden [&_.lk-participant-metadata]:hidden"
          style={{ background: 'transparent' }}
        />
      ) : (
        /* Placeholder: no video */
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {initials}
          </div>
        </div>
      )}

      {/* Raised hand badge */}
      {hasRaisedHand && (
        <div className="absolute top-3 right-3 z-30 text-2xl animate-bounce drop-shadow-md" title="Hand raised">
          ✋
        </div>
      )}

      {/* Permanent bottom-left info tag */}
      <div className="absolute bottom-3 left-3 z-30 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-lg">
        {isMuted ? (
          <MicOff size={13} className="text-red-400 flex-shrink-0" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        )}
        <span className={`text-white font-semibold tracking-wide ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {isLocal ? `${name} (You)` : name}
          {isHost && <span className="text-indigo-400 font-normal ml-1">(Host)</span>}
        </span>
      </div>

      {/* Pinned indicator */}
      {isPinned && !compact && (
        <div className="absolute top-2 left-2 z-10">
          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-black/60 text-indigo-300">
            <Pin size={9} /> Pinned
          </span>
        </div>
      )}

      {/* Context menu */}
      {ctxMenu && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setCtxMenu(null)} />
          <div
            className="fixed z-[101] bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 min-w-[140px]"
            style={{ left: ctxMenu.x, top: ctxMenu.y }}
          >
            {isPinned ? (
              <button
                onClick={() => { onUnpin?.(); setCtxMenu(null); }}
                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5"
              >
                <PinOff size={13} /> Unpin
              </button>
            ) : (
              <button
                onClick={() => { onPin?.(participant.identity); setCtxMenu(null); }}
                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5"
              >
                <Pin size={13} /> Pin for me
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
