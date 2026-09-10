'use client';

import { useEffect } from 'react';

export function useTouchOptimizations() {
  useEffect(() => {
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    
    const handleTouchEnd = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', handleTouchEnd, false);

    // Prevent accidental horizontal swipe navigation on mobile
    const handleTouchMove = (event: TouchEvent) => {
      // Logic for specific touch move handling if needed
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
}
