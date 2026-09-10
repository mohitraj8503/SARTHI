/**
 * Evidence-Based Review Scheduling (SM-2 Algorithm)
 * Calculates optimal review intervals based on recall performance.
 */
export function calculateNextReview(
  lastReview: Date, 
  easeFactor: number = 2.5, 
  interval: number = 0, 
  quality: number // 0-5 (0: total failure, 5: perfect recall)
) {
  // Quality threshold for "passing" recall
  if (quality < 3) {
    return {
      nextReview: new Date(Date.now() + 86400000), // Review again in 24h
      newInterval: 0,
      easeFactor: Math.max(1.3, easeFactor - 0.2)
    };
  }

  let newInterval: number;
  if (interval === 0) {
    newInterval = 1;
  } else if (interval === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * easeFactor);
  }

  // Adjusted Ease Factor calculation
  const newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  return {
    nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000),
    newInterval,
    easeFactor: Math.max(1.3, newEaseFactor)
  };
}
