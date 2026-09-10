/**
 * Client-Side Automatic Cache, Cookie, and Storage Purger & Health Manager
 * Executes every 4 hours to minimize client-side error rate, stale bundle crashes,
 * and outdated cache state across all user devices.
 */

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const CACHE_EPOCH_KEY = 'tt_cache_epoch';
const LAST_HEALTH_CHECK_KEY = 'tt_health_check_timestamp';

export function sanitizeClientCache(force: boolean = false): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const lastEpoch = parseInt(localStorage.getItem(CACHE_EPOCH_KEY) || '0', 10);
    const now = Date.now();

    if (force || !lastEpoch || now - lastEpoch > FOUR_HOURS_MS) {
      console.log('🧹 [CachePurger] Executing 4-Hour Client Cache & Storage Sanitation...');

      // 1. Purge Browser CacheStorage (Service Worker / SW HTTP Caches)
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name).catch(() => {});
          });
        }).catch(() => {});
      }

      // 2. Clear Temporary LocalStorage Items (Preserving Session Auth Tokens)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('tt_temp_') || key.startsWith('tt_cache_') || key.includes('draft_') || key.includes('stale_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // 3. Clear Expired/Stale Cookies (preserving auth session cookie)
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        // Clear only temporary analytics/cache cookies, keep auth tokens intact
        if (name.startsWith('tt_temp_') || name.startsWith('tt_cache_') || name.startsWith('guest_')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      }

      // 4. Update Epoch Timestamp
      localStorage.setItem(CACHE_EPOCH_KEY, now.toString());
      localStorage.setItem(LAST_HEALTH_CHECK_KEY, now.toString());
      return true;
    }
  } catch (err) {
    console.warn('[CachePurger] Cache sanitation error:', err);
  }

  return false;
}

/**
 * Self-healing automatic recovery for error boundaries.
 * Automatically clears cache and reloads transparently if a client hits an error screen.
 */
export function triggerSelfHealingRecovery(): void {
  if (typeof window === 'undefined') return;

  try {
    const recoveryAttempts = parseInt(sessionStorage.getItem('tt_recovery_count') || '0', 10);
    
    if (recoveryAttempts < 2) {
      sessionStorage.setItem('tt_recovery_count', (recoveryAttempts + 1).toString());
      sanitizeClientCache(true);

      const url = new URL(window.location.href);
      url.searchParams.set('tt_cb', Date.now().toString());
      window.location.replace(url.toString());
    }
  } catch (err) {
    window.location.reload();
  }
}
