'use client';

import { useEffect } from 'react';
import { trackAppLaunch } from '@/lib/pwaAnalytics';

export default function AppLaunchTracker() {
  useEffect(() => {
    // Track app launch on component mount
    trackAppLaunch();
  }, []);

  return null; // This component doesn't render anything
}

