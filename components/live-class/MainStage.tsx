'use client';

import { useState, useMemo } from 'react';
import { LayoutGrid, User } from 'lucide-react';
import {
  useParticipants, useLocalParticipant, useSpeakingParticipants, useParticipantTracks,
} from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';
import { MeetingParticipantTile } from './MeetingParticipantTile';
import type { StageLayout } from './meeting-types';

interface MainStageProps {
  layout: StageLayout;
  onLayoutChange: (l: StageLayout) => void;
  pinnedIdentity: string | null;
  onPin: (identity: string) => void;
  onUnpin: () => void;
  raisedHands: Set<string>;
  isHost: boolean;
}

/**
 * MainStage
 *
 * Renders the main video area with two layouts:
 *  - Speaker view: active speaker fills ~85% stage; others in thumbnail strip (below)
 *  - Grid view: equal-sized tiles for all participants
 *
 * Screen-share detection: if any participant is sharing, their screen
 * takes the main area and their camera goes to a floating PiP tile.
 *
 * Layout toggle button lives in the top-right corner of the stage.
 */
export function MainStage({
  layout, onLayoutChange, pinnedIdentity, onPin, onUnpin, raisedHands, isHost,
}: MainStageProps) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const speakingParticipants = useSpeakingParticipants();
  const speakingIds = new Set(speakingParticipants.map((p) => p.identity));

  // Detect active screen share
  const screenShareParticipant = useMemo(() =>
    participants.find((p) => {
      const tracks = p.getTrackPublications();
      return Array.from(tracks.values()).some(
        (t) => t.source === Track.Source.ScreenShare && !t.isMuted
      );
    }), [participants]);

  const isScreenSharing = !!screenShareParticipant;

  // Determine main-stage participant
  const mainParticipant = useMemo(() => {
    if (isScreenSharing) return screenShareParticipant!;
    if (pinnedIdentity) return participants.find((p) => p.identity === pinnedIdentity) || null;
    if (layout === 'speaker') {
      // Active speaker, fallback to local, fallback to first
      const speaker = speakingParticipants.find((p) => p.identity !== localParticipant?.identity);
      return speaker || localParticipant || participants[0] || null;
    }
    return null; // grid: no single main participant
  }, [isScreenSharing, screenShareParticipant, pinnedIdentity, layout, speakingParticipants, participants, localParticipant]);

  const isLocal = (p: Participant | null) => p?.identity === localParticipant?.identity;

  // ── Grid layout ─────────────────────────────────────────────────────────────
  if (layout === 'grid' && !isScreenSharing && !pinnedIdentity) {
    const gridCols =
      participants.length <= 1 ? 'grid-cols-1 max-w-4xl'
      : participants.length <= 2 ? 'grid-cols-1 md:grid-cols-2 max-w-6xl'
      : participants.length <= 4 ? 'grid-cols-2 max-w-6xl'
      : 'grid-cols-2 md:grid-cols-3 max-w-7xl';

    return (
      <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-4 md:p-6">
        <LayoutToggle layout={layout} onToggle={() => onLayoutChange('speaker')} />
        <div className={`w-full h-full grid gap-4 items-center justify-center ${gridCols} mx-auto`}>
          {participants.map((p) => (
            <div key={p.identity} className="w-full h-full max-h-[calc(100vh-200px)] aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
              <MeetingParticipantTile
                participant={p}
                isLocal={isLocal(p)}
                isSpeaking={speakingIds.has(p.identity)}
                isMuted={!p.isMicrophoneEnabled}
                hasRaisedHand={raisedHands.has(p.identity)}
                isPinned={pinnedIdentity === p.identity}
                onPin={onPin}
                onUnpin={onUnpin}
                isHost={isHost && isLocal(p)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Speaker / pinned / screen-share layout ──────────────────────────────────
  return (
    <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-4 md:p-6">
      <LayoutToggle layout={layout} onToggle={() => onLayoutChange(layout === 'grid' ? 'speaker' : 'grid')} />

      {mainParticipant ? (
        <>
          {/* Main tile: 16:9 aspect ratio bounded container */}
          <div className="w-full h-full max-w-6xl max-h-[calc(100vh-200px)] aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 mx-auto">
            <MeetingParticipantTile
              participant={mainParticipant}
              isLocal={isLocal(mainParticipant)}
              isSpeaking={speakingIds.has(mainParticipant.identity)}
              isMuted={!mainParticipant.isMicrophoneEnabled}
              hasRaisedHand={raisedHands.has(mainParticipant.identity)}
              isPinned={!!pinnedIdentity}
              onPin={onPin}
              onUnpin={onUnpin}
              isHost={isHost && isLocal(mainParticipant)}
            />
          </div>

          {/* PiP: presenter's camera while screen-sharing */}
          {isScreenSharing && localParticipant && screenShareParticipant?.identity !== localParticipant.identity && (
            <div className="absolute bottom-4 right-4 w-40 h-24 rounded-xl overflow-hidden shadow-2xl border border-white/10 z-10">
              <MeetingParticipantTile
                participant={localParticipant}
                isLocal
                isSpeaking={speakingIds.has(localParticipant.identity)}
                isMuted={!localParticipant.isMicrophoneEnabled}
                hasRaisedHand={raisedHands.has(localParticipant.identity)}
                onPin={onPin}
                onUnpin={onUnpin}
                compact
              />
            </div>
          )}

          {/* Screen-share active bar */}
          {isScreenSharing && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600/90 text-white text-xs flex items-center gap-1.5 z-10 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {screenShareParticipant?.name || 'Someone'} is sharing their screen
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-600">
          <div className="flex flex-col items-center gap-3">
            <User size={40} />
            <p className="text-sm">Waiting for participants…</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LayoutToggle({ layout, onToggle }: { layout: StageLayout; onToggle: () => void }) {
  return (
    <button
      id="layout-toggle-btn"
      onClick={onToggle}
      title={layout === 'grid' ? 'Switch to speaker view' : 'Switch to grid view'}
      className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white backdrop-blur-sm transition-colors"
    >
      <LayoutGrid size={16} />
    </button>
  );
}
