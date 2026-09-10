'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataChannel } from './useDataChannel';
import type { ReactionPayload, ReactionEmoji } from './meeting-types';

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number; // % from left
}

/**
 * ReactionOverlay
 *
 * Listens to the 'lc-reactions' data channel topic and renders
 * floating emoji animations rising from the bottom of the screen.
 * Fire-and-forget — auto-clears after 2.5s each.
 */
export function ReactionOverlay() {
  const [active, setActive] = useState<FloatingReaction[]>([]);

  useDataChannel<ReactionPayload>('lc-reactions', (payload) => {
    const reaction: FloatingReaction = {
      id: payload.id,
      emoji: payload.emoji,
      x: 10 + Math.random() * 80, // random horizontal spread 10%–90%
    };
    setActive((prev) => [...prev.slice(-14), reaction]); // cap at 15 concurrent animations per spec §10
    setTimeout(() => {
      setActive((prev) => prev.filter((r) => r.id !== payload.id));
    }, 2500);
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {active.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -260, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute bottom-20 text-4xl select-none"
            style={{ left: `${r.x}%` }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Hook to send reactions — call from ReactionsButton */
export function useReactionSender() {
  const { send } = useDataChannel<ReactionPayload>('lc-reactions');

  return (emoji: ReactionEmoji, senderName: string) => {
    const payload: ReactionPayload = {
      emoji,
      senderName,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    send(payload, { reliable: false });
  };
}
