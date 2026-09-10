'use client';

import { useEffect } from 'react';
import { sanitizeClientCache } from '@/lib/cache-purger';

export default function CacheSanitizer() {
  useEffect(() => {
    // Run 4-hour cache & storage sanitation on mount
    sanitizeClientCache();

    // Set recurring timer check every 15 minutes
    const interval = setInterval(() => {
      sanitizeClientCache();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
