'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AutoDownloadTrigger() {
  const searchParams = useSearchParams();
  const shouldDownload = searchParams.get('download') === 'true';

  useEffect(() => {
    if (shouldDownload) {
      // Small delay to ensure content is fully loaded
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldDownload]);

  return null;
}

