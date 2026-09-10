'use client';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error';

export const triggerHaptic = (type: HapticType = 'medium') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(40);
        break;
      case 'success':
        navigator.vibrate([10, 30, 10]);
        break;
      case 'error':
        navigator.vibrate([20, 50, 20, 50]);
        break;
      default:
        navigator.vibrate(20);
    }
  }
};
