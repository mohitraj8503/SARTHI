import { getRedisClient } from './redis';
import { checkInMemoryRateLimit } from './security/in-memory-rate-limit';

const RATE_LIMIT_PREFIX = 'rate_limit:';
let warnedRedisUnavailable = false;

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier (IP, user ID, etc).
 * Uses a sliding window (or fixed window with Redis expiration) approach.
 * Here using Fixed Window with atomic increment for performance.
 *
 * @param identifier Unique key (e.g. "ip:127.0.0.1" or "user:123")
 * @param limit Max requests allowed in window
 * @param windowSeconds Duration of window in seconds
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const client = getRedisClient();
  const key = `${RATE_LIMIT_PREFIX}${identifier}`;
  const windowMs = windowSeconds * 1000;

  if (!client) {
    if (!warnedRedisUnavailable) {
      warnedRedisUnavailable = true;
      console.warn('[RateLimit] Redis unavailable, using in-memory fallback limiter.');
    }
    const fallback = checkInMemoryRateLimit(key, limit, windowMs);
    return { success: fallback.success, limit, remaining: fallback.remaining, reset: fallback.reset };
  }

  try {
    const multi = client.multi();
    multi.incr(key);
    multi.ttl(key);
    const results = await multi.exec();

    // Results is [[err, count], [err, ttl]]
    if (!results) {
      throw new Error('Redis transaction failed');
    }

    const count = results[0][1] as number;
    let ttl = results[1][1] as number;

    // If key didn't exist (this is first request, count is 1), set expiration
    if (count === 1) {
      await client.expire(key, windowSeconds);
      ttl = windowSeconds;
    } else if (ttl === -1) {
      // Safety net if key exists but no TTL
      await client.expire(key, windowSeconds);
      ttl = windowSeconds;
    }

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset: Date.now() + ttl * 1000,
    };
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);
    const fallback = checkInMemoryRateLimit(key, limit, windowMs);
    return { success: fallback.success, limit, remaining: fallback.remaining, reset: fallback.reset };
  }
}

/**
 * SEC-003: Account Lockout Implementation
 */
export class AccountLockout {
  private static attempts = new Map<string, { count: number; lockedUntil?: Date }>();
  
  static async recordAttempt(email: string, success: boolean) {
    const key = email.toLowerCase();
    const record = this.attempts.get(key) || { count: 0 };
    
    if (success) {
      this.attempts.delete(key); // Reset on success
      return;
    }
    
    record.count += 1;
    
    if (record.count >= 5) {
      record.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
      // In a real app, we'd also log this and notify security
      console.warn(`[SECURITY] Account lockout for ${email} after 5 failed attempts.`);
    }
    
    this.attempts.set(key, record);
  }
  
  static isLocked(email: string): boolean {
    const key = email.toLowerCase();
    const record = this.attempts.get(key);
    if (!record?.lockedUntil) return false;
    
    if (Date.now() > record.lockedUntil.getTime()) {
      this.attempts.delete(key); // Auto-unlock
      return false;
    }
    return true;
  }

  static unlock(email: string): void {
    this.attempts.delete(email.toLowerCase());
  }

  static resetAll(): void {
    this.attempts.clear();
  }
}

