import { prisma } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis';

const CACHE_TTL = 300; // 5 minutes

export class DashboardCache {
  private static memoryCache = new Map<string, { data: any, expiresAt: number }>();

  static async getOrSet(key: string, fetchFn: () => Promise<any>, ttl = CACHE_TTL) {
    // 1. Try memory cache first
    const cached = this.memoryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const redis = getRedisClient();

    // 2. Try Redis if available
    try {
      if (redis) {
        const redisData = await redis.get(`dashboard:${key}`);
        if (redisData) {
          const parsed = JSON.parse(redisData);
          this.memoryCache.set(key, { data: parsed, expiresAt: Date.now() + (ttl * 1000) });
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[DashboardCache] Redis failed:', e);
    }

    // 3. Fetch fresh data
    const data = await fetchFn();

    // 4. Update both caches
    const expiresAt = Date.now() + (ttl * 1000);
    this.memoryCache.set(key, { data, expiresAt });
    
    try {
      if (redis) {
        await redis.setex(`dashboard:${key}`, ttl, JSON.stringify(data));
      }
    } catch (e) {}

    return data;
  }

  static invalidate(key?: string) {
    const redis = getRedisClient();
    if (key) {
      this.memoryCache.delete(key);
      if (redis) redis.del(`dashboard:${key}`).catch(() => {});
    } else {
      this.memoryCache.clear();
    }
  }
}
