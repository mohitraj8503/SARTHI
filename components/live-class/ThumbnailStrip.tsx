'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useParticipants, useLocalParticipant, useSpeakingParticipants } from '@livekit/components-react';
import { Participant } from 'livekit-client';
import { MeetingParticipantTile } from './MeetingParticipantTile';

interface ThumbnailStripProps {
  pinnedIdentity: string | null;
  raisedHands: Set<string>;
  onPin: (identity: string) => void;
  onUnpin: () => void;
  /** The identity shown in the main stage (excluded from strip in speaker view) */
  mainStageIdentity?: string | null;
}

/**
 * ThumbnailStrip
 *
 * Horizontally-scrollable strip of participant tiles below the main stage.
 * Left/right chevron arrows appear on hover when content overflows.
 * Clicking a thumbnail pins it to the main stage.
 */
export function ThumbnailStrip({ pinnedIdentity, raisedHands, onPin, onUnpin, mainStageIdentity }: ThumbnailStripProps) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const speakingParticipants = useSpeakingParticipants();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // Exclude the main-stage participant from the strip
  const strip = participants.filter((p) => p.identity !== mainStageIdentity);

  const speakingIds = new Set(speakingParticipants.map((p) => p.identity));

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 8);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  if (strip.length === 0) return null;

  return (
    <div className="relative flex-shrink-0 h-28 bg-slate-950/80 border-t border-white/5 group/strip">
      {/* Left chevron */}
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 px-1.5 bg-gradient-to-r from-slate-950 to-transparent flex items-center"
        >
          <ChevronLeft size={20} className="text-slate-400 hover:text-white" />
        </button>
      )}

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="h-full flex items-center gap-2 px-3 overflow-x-auto scrollbar-none"
      >
        {strip.map((p) => {
          const isLocal = p.identity === localParticipant?.identity;
          const isSpeaking = speakingIds.has(p.identity);
          const isMuted = !p.isMicrophoneEnabled;
          const hasHand = raisedHands.has(p.identity);
          const isPinned = pinnedIdentity === p.identity;

          return (
            <div
              key={p.identity}
              className="flex-shrink-0 h-20 w-32 cursor-pointer rounded-lg overflow-hidden"
              onClick={() => isPinned ? onUnpin() : onPin(p.identity)}
            >
              <MeetingParticipantTile
                participant={p}
                isLocal={isLocal}
                isSpeaking={isSpeaking}
                isMuted={isMuted}
                hasRaisedHand={hasHand}
                isPinned={isPinned}
                onPin={onPin}
                onUnpin={onUnpin}
                compact
              />
            </div>
          );
        })}
      </div>

      {/* Right chevron */}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 px-1.5 bg-gradient-to-l from-slate-950 to-transparent flex items-center"
        >
          <ChevronRight size={20} className="text-slate-400 hover:text-white" />
        </button>
      )}
    </div>
  );
}
