'use client';

import { useEffect, useState } from 'react';

/**
 * RecordingBadge
 *
 * Animated red pulsing dot + "Recording" label shown to the host (instructor)
 * during a live class while egress recording is active.
 */
export function RecordingBadge({ className = '' }: { className?: string }) {
  const [visible, setVisible] = useState(true);

  // Blink the badge every 2 seconds for extra attention
  useEffect(() => {
    const interval = setInterval(() => setVisible((v) => !v), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 backdrop-blur-sm ${className}`}
      aria-label="Recording in progress"
    >
      <span
        className="relative flex h-2.5 w-2.5"
        style={{ opacity: visible ? 1 : 0.2, transition: 'opacity 0.4s ease' }}
      >
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span className="text-xs font-semibold text-red-400 tracking-widest uppercase">
        Recording
      </span>
    </div>
  );
}
