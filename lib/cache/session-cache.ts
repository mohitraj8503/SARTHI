import { findSessionByAnyId as rawFindSessionByAnyId } from '../session-utils';
import redisService from '../redis';

const SESSION_CACHE_TTL = 300; // 5 minutes

/**
 * Cached version of session lookup to prevent database melting
 * during high-frequency chat or attendance events.
 */
export async function findSessionByAnyIdCached(identifier: string) {
  if (!identifier) return null;

  const client = redisService.getClient();
  if (!client) return rawFindSessionByAnyId(identifier);

  const cacheKey = `session:lookup:${identifier}`;
  
  try {
    // 1. Check Redis Cache
    const cached = await client.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Fallback to DB
    const result = await rawFindSessionByAnyId(identifier);

    // 3. Cache the result if found
    if (result) {
      await client.setex(cacheKey, SESSION_CACHE_TTL, JSON.stringify(result));
    }

    return result;
  } catch (error) {
    console.warn(`[Cache] Redis lookup failed for ${identifier}, falling back to DB:`, error);
    return rawFindSessionByAnyId(identifier);
  }
}

/**
 * Invalidates a specific session cache entry (call this when session status changes)
 */
export async function invalidateSessionCache(identifier: string) {
  const client = redisService.getClient();
  if (!client) return;
  const cacheKey = `session:lookup:${identifier}`;
  await client.del(cacheKey);
}
