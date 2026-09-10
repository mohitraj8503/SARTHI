'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useEngagementScoring } from '@/lib/useEngagementScoring';

export default function EngagementTracker() {
  const pathname = usePathname();
  const { trackPageView, trackTimeSpent, trackScrollDepth } = useEngagementScoring();

  useEffect(() => {
    // Track page view on route change
    trackPageView();

    // Track time spent on page
    const startTime = Date.now();
    let timeInterval: NodeJS.Timeout;

    const trackTime = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent > 0) {
        trackTimeSpent(timeSpent);
      }
    };

    // Track time every 10 seconds
    timeInterval = setInterval(trackTime, 10000);

    // Track scroll depth
    // Track scroll depth with throttling for mobile performance
    let scrollTimeout: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      if (scrollTimeout) return;

      scrollTimeout = setTimeout(() => {
        const scrollTop = window.scrollY;
        const bodyHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const docHeight = bodyHeight - windowHeight;
        
        if (docHeight > 0) {
          const scrollPercent = (scrollTop / docHeight) * 100;
          if (scrollPercent >= 10) {
            trackScrollDepth(Math.floor(scrollPercent));
          }
        }
        scrollTimeout = null;
      }, 1000); // Only check scroll depth every 1 second
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearInterval(timeInterval);
      trackTime();
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, trackPageView, trackTimeSpent, trackScrollDepth]);

  // Track interactions (clicks)
  useEffect(() => {
    const handleInteraction = () => {
      // Debounce interactions to avoid too many calls
      if (typeof window !== 'undefined') {
        const lastInteraction = parseInt(localStorage.getItem('last_interaction') || '0');
        const now = Date.now();

        if (now - lastInteraction > 5000) { // 5 seconds debounce
          localStorage.setItem('last_interaction', now.toString());
          // Note: trackInteraction is not directly available here
          // We'll handle this in individual components
        }
      }
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return null; // This component doesn't render anything
}

