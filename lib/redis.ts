// Redis client for production-grade caching
// Supports connection pooling, retry logic, and auto-reconnect

// Type-safe Redis module import
interface RedisPipeline {
  incr: (key: string) => RedisPipeline;
  ttl: (key: string) => RedisPipeline;
  exec: () => Promise<Array<[Error | null, number]> | null>;
}

interface RedisClient {
  get: (key: string) => Promise<string | null>;
  setex: (key: string, seconds: number, value: string) => Promise<unknown>;
  del: (...keys: string[]) => Promise<number>;
  ping: () => Promise<string>;
  dbsize: () => Promise<number>;
  info: (section?: string) => Promise<string>;
  on: (event: string, callback: (err?: Error) => void) => void;
  quit: () => Promise<void>;
  multi: () => RedisPipeline;
  expire: (key: string, seconds: number) => Promise<number>;
  incr: (key: string) => Promise<number>;
}

type RedisModule = {
  default: new (options: Record<string, unknown>) => RedisClient;
};

let Redis: RedisModule | null = null;
const isProd = process.env.NODE_ENV === 'production';

function maskIdentifier(value: string): string {
  if (!value) return 'unknown';
  if (value.length <= 6) return '***';
  return `${value.slice(0, 3)}***${value.slice(-2)}`;
}

function logRedisDebug(message: string) {
  if (!isProd) {
    console.log(message);
  }
}

// Try to load ioredis, fall back to null if not available
// This is wrapped to prevent Edge Runtime build errors
try {
  if (typeof (globalThis as Record<string, unknown>).EdgeRuntime !== 'string') {
     
    Redis = require('ioredis') as RedisModule;
  }
} catch {
  if (typeof (globalThis as Record<string, unknown>).EdgeRuntime !== 'string') {
    console.warn('[Redis] ioredis not installed or failed to load, caching will be disabled');
  }
}

// Configuration
const isConfigured = !!process.env.REDIS_URL && Redis !== null;

let redisClient: RedisClient | null = null;

/**
 * Get the Redis client singleton
 */
export const getRedisClient = (): RedisClient | null => {
  if (!isConfigured) {
    return null;
  }

  if (!redisClient && Redis) {
    redisClient = new Redis.default({
      url: process.env.REDIS_URL,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    redisClient.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err.message);
    });

    redisClient.on('connect', () => {
      logRedisDebug('[Redis] Connected successfully');
    });

    redisClient.on('reconnecting', () => {
      logRedisDebug('[Redis] Reconnecting...');
    });
  }

  return redisClient;
};

/**
 * Get cached dashboard data for a user
 */
export async function getCachedDashboard(userId: string): Promise<unknown | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const cached = await client.get(`dashboard:${userId}`);
    if (cached) {
      logRedisDebug(`[Redis] Cache HIT for user ${maskIdentifier(userId)}`);
      return JSON.parse(cached);
    }
    logRedisDebug(`[Redis] Cache MISS for user ${maskIdentifier(userId)}`);
    return null;
  } catch (error) {
    console.error('[Redis] Get error:', error);
    return null;
  }
}

/**
 * Set dashboard cache for a user
 */
export async function setDashboardCache(
  userId: string,
  data: unknown,
  ttlSeconds: number = 60
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.setex(`dashboard:${userId}`, ttlSeconds, JSON.stringify(data));
    logRedisDebug(`[Redis] Cache SET for user ${maskIdentifier(userId)}, TTL: ${ttlSeconds}s`);
    return true;
  } catch (error) {
    console.error('[Redis] Set error:', error);
    return false;
  }
}

/**
 * Invalidate dashboard cache for a user
 */
export async function invalidateDashboardCache(userId: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(`dashboard:${userId}`);
    logRedisDebug(`[Redis] Cache INVALIDATED for user ${maskIdentifier(userId)}`);
    return true;
  } catch (error) {
    console.error('[Redis] Invalidate error:', error);
    return false;
  }
}

/**
 * Generic cache wrapper
 */
export async function cacheData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const client = getRedisClient();

  // Return fresh data if Redis is not active
  if (!client) return await fetchFn();

  try {
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error(`[Redis] Error getting key ${key}:`, err);
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Cache it (don't await this to keep response fast, unless we strictly need confirmation)
  // Actually safe to await to ensure consistency or catch errors.
  try {
    if (data) {
      await client.setex(key, ttlSeconds, JSON.stringify(data));
    }
  } catch (err) {
    console.error(`[Redis] Error setting key ${key}:`, err);
  }

  return data;
}

/**
 * Invalidate cache for multiple users
 */
export async function invalidateMultipleDashboards(userIds: string[]): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const keys = userIds.map((id) => `dashboard:${id}`);
    await client.del(...keys);
    logRedisDebug(`[Redis] Cache INVALIDATED for ${userIds.length} users`);
    return true;
  } catch (error) {
    console.error('[Redis] Multi-invalidate error:', error);
    return false;
  }
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<{ healthy: boolean; latency?: number }> {
  const client = getRedisClient();
  if (!client) {
    return { healthy: false };
  }

  const start = Date.now();
  try {
    await client.ping();
    return { healthy: true, latency: Date.now() - start };
  } catch {
    return { healthy: false };
  }
}

/**
 * Get cache statistics for monitoring
 */
export async function getCacheStats(): Promise<{ keys: number; memory?: string } | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const keys = await client.dbsize();
    const info = await client.info('memory');
    const memoryMatch = info.match(/used_memory_human:(\S+)/);
    return {
      keys,
      memory: memoryMatch ? memoryMatch[1] : undefined,
    };
  } catch (error) {
    console.error('[Redis] Stats error:', error);
    return null;
  }
}

/**
 * Check if Redis is configured and available
 */
export function isRedisAvailable(): boolean {
  return isConfigured;
}

const redisService = {
  getClient: getRedisClient,
  getCached: getCachedDashboard,
  setCache: setDashboardCache,
  invalidate: invalidateDashboardCache,
  invalidateMultiple: invalidateMultipleDashboards,
  health: checkRedisHealth,
  stats: getCacheStats,
  isAvailable: isRedisAvailable,
};

export default redisService;
