// In-memory rate limiter (use Redis for production)
const requestCounts = new Map<string, {
  daily: { count: number; resetAt: number };
  minute: { count: number; resetAt: number };
}>();

const MAX_PER_DAY = 500;
const MAX_PER_MINUTE = 15;

/**
 * Check if request is within rate limits
 * @param userId - Unique user identifier
 * @returns Object with allowed status and remaining counts
 */
export function checkRateLimit(userId: string): { 
  allowed: boolean; 
  remaining?: { daily: number; minute: number };
  reason?: string;
} {
  const now = Date.now();
  const userKey = `user:${userId}`;
  
  // Get or create user's request log
  if (!requestCounts.has(userKey)) {
    requestCounts.set(userKey, {
      daily: { count: 0, resetAt: now + 24 * 60 * 60 * 1000 },
      minute: { count: 0, resetAt: now + 60 * 1000 }
    });
  }

  const userLimits = requestCounts.get(userKey)!;

  // Reset counters if expired
  if (now > userLimits.daily.resetAt) {
    userLimits.daily = { count: 0, resetAt: now + 24 * 60 * 60 * 1000 };
  }
  if (now > userLimits.minute.resetAt) {
    userLimits.minute = { count: 0, resetAt: now + 60 * 1000 };
  }

  // Check limits
  if (userLimits.daily.count >= MAX_PER_DAY) {
    return { allowed: false, reason: "Daily limit reached (500 requests/day)" };
  }

  if (userLimits.minute.count >= MAX_PER_MINUTE) {
    return { allowed: false, reason: "Rate limit exceeded (15 requests/minute)" };
  }

  // Increment counters
  userLimits.daily.count++;
  userLimits.minute.count++;

  return { 
    allowed: true, 
    remaining: {
      daily: MAX_PER_DAY - userLimits.daily.count,
      minute: MAX_PER_MINUTE - userLimits.minute.count
    }
  };
}
