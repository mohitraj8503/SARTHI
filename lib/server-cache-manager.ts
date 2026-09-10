import { revalidatePath, revalidateTag } from 'next/cache';
import { logger, logError } from './logger';

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
let lastServerPurgeTimestamp = Date.now();

/**
 * Server-Side Cache Purger
 * Clears Next.js Data Cache, Layout Cache, and resets stale memory stores
 */
export async function purgeServerSideCache(): Promise<{ success: boolean; executedAt: string; message: string }> {
  const executedAt = new Date().toISOString();
  try {
    // 1. Revalidate all Layouts and Root Paths
    revalidatePath('/', 'layout');
    revalidatePath('/blogs', 'layout');
    revalidatePath('/mentor/dashboard', 'layout');
    revalidatePath('/dashboard/internship', 'layout');

    // 2. Revalidate global tags if defined
    try {
      revalidateTag('global');
      revalidateTag('blogs');
      revalidateTag('assignments');
    } catch (e) {}

    lastServerPurgeTimestamp = Date.now();
    logger.info('SERVER_CACHE_PURGE_SUCCESS', { executedAt });

    return {
      success: true,
      executedAt,
      message: 'Server-side cache and revalidation completed successfully.',
    };
  } catch (error: any) {
    await logError('SERVER_CACHE_PURGE_ERROR', { error: error.message, executedAt });
    return {
      success: false,
      executedAt,
      message: error.message || 'Server cache purge failed',
    };
  }
}

/**
 * Background 30-Minute Auto-Purge Guard
 * Ensures server-side cache is refreshed every 30 minutes on active requests
 */
export function checkAndPurgeServerCacheIfNeeded(): void {
  const now = Date.now();
  if (now - lastServerPurgeTimestamp > THIRTY_MINUTES_MS) {
    lastServerPurgeTimestamp = now;
    // Execute non-blocking background purge
    purgeServerSideCache().catch((err) => {
      console.error('[ServerCacheManager] Background purge failed:', err);
    });
  }
}
