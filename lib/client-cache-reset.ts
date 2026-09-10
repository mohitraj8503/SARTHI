/**
 * SARTHI System Auto-Healing & Full Cache Purge Utility
 * Clears LocalStorage, SessionStorage, Service Worker Caches, and Cookies,
 * then performs a hard cache-busting refresh or redirect.
 */
export async function performFullSARTHICacheReset(targetPath?: string) {
  if (typeof window === 'undefined') return;

  try {
    // 1. Clear LocalStorage
    try {
      localStorage.clear();
      console.log('[CacheReset] LocalStorage purged.');
    } catch (e) {
      console.warn('[CacheReset] LocalStorage clear notice:', e);
    }

    // 2. Clear SessionStorage
    try {
      sessionStorage.clear();
      console.log('[CacheReset] SessionStorage purged.');
    } catch (e) {
      console.warn('[CacheReset] SessionStorage clear notice:', e);
    }

    // 3. Clear Service Worker Cache Storage if available
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        console.log('[CacheReset] CacheStorage purged.');
      } catch (e) {
        console.warn('[CacheReset] CacheStorage clear notice:', e);
      }
    }

    // 4. Unregister active Service Workers if any
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        console.log('[CacheReset] Service Workers unregistered.');
      } catch (e) {
        console.warn('[CacheReset] Service Worker unregister notice:', e);
      }
    }

    // 5. Expire non-HttpOnly client cookies
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
        }
      }
      console.log('[CacheReset] Client cookies cleared.');
    } catch (e) {
      console.warn('[CacheReset] Cookie clear notice:', e);
    }
  } finally {
    // Hard cache-busted redirect/reload
    const dest = targetPath || window.location.pathname || '/';
    const timestamp = Date.now();
    window.location.href = `${dest}?tt_fix=${timestamp}`;
  }
}
