

const QUERY_CACHE = new Map<string, { data: unknown, timestamp: number }>();
const MAX_CACHE_SIZE = 100; // Limit cache size to save RAM on 3GB Hostinger plan
const CACHE_TTL = 1000 * 30; // 30 second cache — projects must always be fresh
let CIRCUIT_BREAKER_ACTIVE = false;
let LAST_DB_ERROR_TIME = 0;

/**
 * Helper to manage cache size (Basic LRU eviction)
 */
function updateCache(key: string, data: unknown) {
  if (QUERY_CACHE.size >= MAX_CACHE_SIZE) {
    const oldestKey = QUERY_CACHE.keys().next().value;
    if (oldestKey) QUERY_CACHE.delete(oldestKey);
  }
  QUERY_CACHE.set(key, { data, timestamp: Date.now() });
}

/**
 * Clears the resiliency cache for a specific key or entirely.
 */
export function clearResiliencyCache(key?: string) {
  if (key) {
    QUERY_CACHE.delete(key);
  } else {
    QUERY_CACHE.clear();
  }
}

export type ResilientResult<T> = {
  success: boolean;
  data: T | null;
  error?: string;
  isCached?: boolean;
}

/**
 * Executes a Prisma block with a retry mechanism for connection errors.
 * Also implements a "Stale-While-Offline" cache to prevent site crashes if DB is down.
 */
export async function withResiliency<T>(
  operation: () => Promise<T>,
  cacheKey?: string,
  maxRetries = 1 // Reduced retries to save connection slots
): Promise<ResilientResult<T>> {
  // Circuit Breaker: If DB failed recently, use cache immediately
  if (CIRCUIT_BREAKER_ACTIVE && cacheKey) {
    const ageSinceFailure = Date.now() - LAST_DB_ERROR_TIME;
    if (ageSinceFailure < 30000) { // 30 second cooldown
      const cached = QUERY_CACHE.get(cacheKey);
      if (cached) {
        console.warn(`⚡ CIRCUIT BREAKER: Using cached data for ${cacheKey}`);
        return { success: true, data: cached.data as T, isCached: true };
      }
    } else {
      CIRCUIT_BREAKER_ACTIVE = false;
    }
  }

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('DATABASE_OPERATION_TIMEOUT')), 5000)
        )
      ]) as T;

      // Update cache if successful using the memory-safe helper
      if (cacheKey && result !== null && result !== undefined) {
        updateCache(cacheKey, result);
      }
      
      CIRCUIT_BREAKER_ACTIVE = false;
      return { success: true, data: result };
    } catch (error: unknown) {
      const dbError = error as { message?: string; code?: string };
      
      const isTimeout = dbError.message === 'DATABASE_OPERATION_TIMEOUT';
      const isConnectionLimit = dbError.message?.includes('max_connections_per_hour');
      const isConnectionError =
        isTimeout ||
        isConnectionLimit ||
        dbError.message?.includes('reach database') ||
        dbError.message?.includes('Timed out') ||
        dbError.message?.includes('Authentication failed') ||
        dbError.message?.includes('not valid') ||
        dbError.message?.includes('Access denied') ||
        dbError.message?.includes('Error validating datasource') ||
        dbError.message?.includes('Invalid `prisma') ||
        dbError.code === 'P1001' ||
        dbError.code === 'P1013';

      if (isConnectionError || isConnectionLimit) {
        CIRCUIT_BREAKER_ACTIVE = true;
        LAST_DB_ERROR_TIME = Date.now();
      }

      if (cacheKey && (isConnectionError || isTimeout || isConnectionLimit)) {
        const cached = QUERY_CACHE.get(cacheKey);
        if (cached) {
          const age = Date.now() - cached.timestamp;
          if (age < CACHE_TTL) {
            console.warn(`🕒 DB OFFLINE/SLOW - Using cached data for: ${cacheKey} (Age: ${Math.round(age/1000)}s)`);
            return { success: true, data: cached.data as T, isCached: true };
          }
        }
      }

      if (isConnectionError && i < maxRetries && !isConnectionLimit) {
        console.warn(`⏳ [Resiliency] DB attempt ${i + 1}/${maxRetries + 1} failed. Retrying in 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      if (isTimeout || isConnectionLimit) {
        // This is an expected, handled fallback path. Logging it as an error
        // makes Next.js display a development error overlay even though callers
        // receive a safe failure envelope (and can render cached/mock content).
        console.warn(`⚠️ DB ${isTimeout ? 'timeout' : 'connection limit'} - Returning failure envelope.`);
        return { success: false, data: null, error: isTimeout ? 'TIMEOUT' : 'CONNECTION_LIMIT' };
      }

      const isAuthError = 
        dbError.message?.includes('Authentication failed') ||
        dbError.message?.includes('not valid') ||
        dbError.message?.includes('Access denied') ||
        (dbError.code === 'P1001' && dbError.message?.includes('Authentication'));
      
      if (isAuthError) {
        console.error("❌ DB Auth Error - check environment keys:", dbError.message);
        return { success: false, data: null, error: 'AUTH_ERROR' };
      }
      
      if (isConnectionError) return { success: false, data: null, error: 'CONNECTION_ERROR' };
      
      return { success: false, data: null, error: dbError.message || 'UNKNOWN_ERROR' };
    }
  }
  return { success: false, data: null, error: 'MAX_RETRIES_EXCEEDED' };
}
