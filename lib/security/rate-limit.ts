import { NextRequest } from 'next/server';
import { checkInMemoryRateLimit } from './in-memory-rate-limit';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  '/api/auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  '/api/auth/signup': { windowMs: 60 * 60 * 1000, maxRequests: 5 },
  '/api/auth/forgot-password': { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  '/api/*': { windowMs: 60 * 1000, maxRequests: 100 }
};

let warnedRedisUnavailable = false;

export async function rateLimit(req: NextRequest): Promise<{ success: boolean; headers?: Record<string, string> }> {
  const { pathname } = new URL(req.url);
  const ipForwarded = req.headers.get('x-forwarded-for') || '';
  const ip = ipForwarded.split(',')[0].trim() || req.ip || 'unknown';
  const config = Object.entries(rateLimitConfigs).find(([path]) => {
      if (path.endsWith('*')) return pathname.startsWith(path.slice(0, -1));
      return pathname === path;
  })?.[1] || rateLimitConfigs['/api/*'];

  const key = `rate_limit:${pathname}:${ip}`;
  const makeHeaders = (remaining: number, reset: number) => ({
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString()
  });

  const applyFallback = () => {
    const fallback = checkInMemoryRateLimit(key, config.maxRequests, config.windowMs);
    return {
      success: fallback.success,
      headers: makeHeaders(fallback.remaining, fallback.reset),
    };
  };

  // Edge compatibility: ioredis is not supported in Edge.
  if (typeof (globalThis as Record<string, unknown>).EdgeRuntime === "string") {
    return applyFallback();
  }

  // Use dynamic import to prevent the package from being bundled in Edge runtime
  const { getRedisClient } = await import('@/lib/redis');
  const redis = getRedisClient();
  if (!redis) {
    if (!warnedRedisUnavailable) {
      warnedRedisUnavailable = true;
      console.warn('[RateLimit] Redis not configured, using in-memory fallback limiter.');
    }
    return applyFallback();
  }

  try {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, Math.ceil(config.windowMs / 1000));
    }
    
    const remaining = Math.max(0, config.maxRequests - current);
    const headers = {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': (Date.now() + config.windowMs).toString()
    };

    if (current > config.maxRequests) {
      return { success: false, headers };
    }
    
    return { success: true, headers };
  } catch (err) {
    console.error('[RateLimit] Redis error:', err);
    return applyFallback();
  }
}
