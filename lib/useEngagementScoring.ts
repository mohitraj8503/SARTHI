'use client';

import { useEffect, useState, useCallback } from 'react';

interface EngagementScore {
  pageViews: number;
  timeSpent: number;
  interactions: number;
  returns: number;
  scrollDepth: number;
  lastVisit: number;
}

const STORAGE_KEY = 'techTomorrow_engagement';

export function useEngagementScoring() {
  const [score, setScore] = useState<EngagementScore>({
    pageViews: 0,
    timeSpent: 0,
    interactions: 0,
    returns: 0,
    scrollDepth: 0,
    lastVisit: Date.now(),
  });

  // Load stored data
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const daysSinceLastVisit = (now - parsed.lastVisit) / (1000 * 60 * 60 * 24);

      // Check if it's a return visit (more than 30 days)
      if (daysSinceLastVisit > 30) {
        parsed.returns += 1;
      }

      parsed.lastVisit = now;
      setScore(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  }, []);

  // Track page view
  const trackPageView = useCallback(() => {
    setScore(prev => {
      const newScore = { ...prev, pageViews: prev.pageViews + 1 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newScore));
      return newScore;
    });
  }, []);

  // Track time spent
  const trackTimeSpent = useCallback((timeInSeconds: number) => {
    setScore(prev => {
      const newScore = { ...prev, timeSpent: prev.timeSpent + timeInSeconds };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newScore));
      return newScore;
    });
  }, []);

  // Track interaction
  const trackInteraction = useCallback(() => {
    setScore(prev => {
      const newScore = { ...prev, interactions: prev.interactions + 1 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newScore));
      return newScore;
    });
  }, []);

  // Track scroll depth
  const trackScrollDepth = useCallback((depth: number) => {
    setScore(prev => {
      const newScore = { ...prev, scrollDepth: Math.max(prev.scrollDepth, depth) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newScore));
      return newScore;
    });
  }, []);

  // Calculate total engagement score (0-100)
  const getEngagementScore = useCallback(() => {
    const { pageViews, timeSpent, interactions, returns, scrollDepth } = score;

    let totalScore = 0;

    // Page views: +30 points for ≥3 pages
    if (pageViews >= 3) totalScore += 30;

    // Time spent: +20 points for ≥60 seconds
    if (timeSpent >= 60) totalScore += 20;

    // Returns: +15 points for 2nd+ visit within 30 days
    if (returns > 0) totalScore += 15;

    // Interactions: +10 points for any interaction
    if (interactions > 0) totalScore += 10;

    // Returns count: +25 points for ≥5 total visits
    if (returns >= 4) totalScore += 25; // 5 total visits = 4 returns

    // Scroll depth: +5 bonus for deep scrolling
    if (scrollDepth >= 70) totalScore += 5;

    return Math.min(totalScore, 100);
  }, [score]);

  // Check if should show PWA prompt
  const shouldShowPrompt = useCallback(() => {
    const engagementScore = getEngagementScore();
    const { pageViews, timeSpent, scrollDepth } = score;

    // Condition 1: Engagement score > 70
    if (engagementScore > 70) return true;

    // Condition 2: Session triggers
    if (timeSpent >= 90 || pageViews >= 3 || scrollDepth >= 70) return true;

    // Condition 3: Device & context (simplified - would need more context)
    // For now, just check if not dismissed recently
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (lastDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return false; // Don't show for 7 days after dismiss
    }

    return false;
  }, [score, getEngagementScore]);

  return {
    score,
    engagementScore: getEngagementScore(),
    trackPageView,
    trackTimeSpent,
    trackInteraction,
    trackScrollDepth,
    shouldShowPrompt,
  };
}
