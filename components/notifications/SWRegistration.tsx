'use client'
import { useEffect } from 'react'

export function SWRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Service workers require secure context (HTTPS or localhost)
      if (!window.isSecureContext && !window.location.host.includes('localhost')) {
        console.warn('Skipping Service Worker cleanup: insecure context (non-HTTPS LAN IP).');
        return;
      }

      // 1. Unregister any existing service workers to clear legacy/buggy versions
      // This fixes the "no-response" errors from old Workbox workers intercepting /api/realtime
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('Legacy SW unregistered');
        }
      });
    }
  }, [])

  return null
}

