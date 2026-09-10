'use client'

import { useMemo } from 'react';

/**
 * Intelligent Writing Analytics Hook
 * Calculates metrics like word count, read time, and readability score in real-time.
 */
export function useWritingAnalytics(html: string) {
  return useMemo(() => {
    // Strip HTML tags for accurate counting
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    const words = text.length > 0 ? text.split(' ').length : 0;
    const chars = text.length;
    const readTime = Math.ceil(words / 200); // 200 wpm average
    
    // Simple readability check (average word length)
    const avgWordLength = words > 0 ? chars / words : 0;
    const complexity = avgWordLength > 6 ? 'Sophisticated' : avgWordLength > 4 ? 'Clear' : 'Basic';

    return {
      words,
      chars,
      readTime: `${readTime} min read`,
      complexity,
      progress: Math.min(100, Math.round((words / 1500) * 100)) // Target 1500 words
    };
  }, [html]);
}
