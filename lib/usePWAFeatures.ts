'use client';

import { useState, useEffect } from 'react';
import { isPWA } from './pwaAnalytics';

export function usePWAFeatures() {
  const [isInPWA, setIsInPWA] = useState(false);
  const [pwaDiscount, setPwaDiscount] = useState(0);

  useEffect(() => {
    setIsInPWA(isPWA());

    // Check for PWA discount eligibility
    if (isPWA()) {
      // PWA users get 5% discount as mentioned in requirements
      setPwaDiscount(5);
    }
  }, []);

  const applyPWADiscount = (price: number): number => {
    if (isInPWA && pwaDiscount > 0) {
      return price * (1 - pwaDiscount / 100);
    }
    return price;
  };

  const getPWABenefits = () => {
    if (!isInPWA) return [];

    return [
      '5% discount on all courses',
      'Offline course access',
      'Push notifications for updates',
      'Faster loading times',
      'Home screen quick access',
    ];
  };

  return {
    isInPWA,
    pwaDiscount,
    applyPWADiscount,
    pwaBenefits: getPWABenefits(),
  };
}
