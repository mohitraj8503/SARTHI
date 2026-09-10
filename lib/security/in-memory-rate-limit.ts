interface InMemoryRateLimitBucket {
  count: number;
  resetAt: number;
}

type RateLimitStore = Map<string, InMemoryRateLimitBucket>;

const MAX_BUCKETS = 5000;
const CLEANUP_INTERVAL_MS = 30 * 1000;

interface GlobalRateLimitState {
  __ttRateLimitStore?: RateLimitStore;
  __ttRateLimitLastCleanup?: number;
}

function getRateLimitState() {
  return globalThis as typeof globalThis & GlobalRateLimitState;
}

function getStore(): RateLimitStore {
  const state = getRateLimitState();
  if (!state.__ttRateLimitStore) {
    state.__ttRateLimitStore = new Map<string, InMemoryRateLimitBucket>();
  }
  return state.__ttRateLimitStore;
}

function cleanupExpiredBuckets(now: number) {
  const state = getRateLimitState();
  const lastCleanup = state.__ttRateLimitLastCleanup ?? 0;
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  state.__ttRateLimitLastCleanup = now;

  const store = getStore();
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }

  if (store.size > MAX_BUCKETS) {
    const overflow = store.size - MAX_BUCKETS;
    const keys = store.keys();
    for (let i = 0; i < overflow; i++) {
      const next = keys.next();
      if (next.done) break;
      store.delete(next.value);
    }
  }
}

export function checkInMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const store = getStore();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      success: true,
      remaining: Math.max(0, limit - 1),
      reset: resetAt,
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    success: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    reset: existing.resetAt,
  };
}

export function resetInMemoryRateLimit(key?: string) {
  const store = getStore();
  if (key) {
    store.delete(key);
  } else {
    store.clear();
  }
}

