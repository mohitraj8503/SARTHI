// PWA Analytics utilities for Google Analytics 4

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const pwaAnalytics = {
  // Track when PWA prompt is shown
  promptShown: (condition: string, device: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pwa_prompt_shown', {
        event_category: 'pwa',
        event_label: condition,
        custom_parameter_1: device,
      });
    }
  },

  // Track when PWA prompt is dismissed
  promptDismissed: (reason: string, timeShown: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pwa_prompt_dismissed', {
        event_category: 'pwa',
        event_label: reason,
        value: timeShown,
      });
    }
  },

  // Track when PWA install is started
  installStarted: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pwa_install_started', {
        event_category: 'pwa',
      });
    }
  },

  // Track when PWA install is completed
  installCompleted: (method: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pwa_install_completed', {
        event_category: 'pwa',
        event_label: method,
      });
    }
  },

  // Track when app is opened from home screen
  appOpened: (source: 'home_screen' | 'browser' | 'notification') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pwa_app_opened', {
        event_category: 'pwa',
        event_label: source,
      });
    }
  },

  // Track PWA session started
  sessionStarted: (source: 'home_screen' | 'browser') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pwa_session_started', {
        event_category: 'pwa',
        event_label: source,
      });
    }
  },

  // Track offline usage
  offlineUsage: (feature: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pwa_offline_usage', {
        event_category: 'pwa',
        event_label: feature,
      });
    }
  },

  // Track notification interactions
  notificationInteraction: (type: 'click' | 'dismiss' | 'view') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pwa_notification_interaction', {
        event_category: 'pwa',
        event_label: type,
      });
    }
  },

  // Track engagement metrics
  engagementUpdate: (score: number, pageViews: number, timeSpent: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'pwa_engagement_update', {
        event_category: 'pwa',
        value: score,
        custom_parameter_1: pageViews,
        custom_parameter_2: timeSpent,
      });
    }
  },
};

// Utility to detect if running as PWA
export const isPWA = (): boolean => {
  if (typeof window === 'undefined') return false;

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isInWebAppiOS = (window.navigator as any).standalone === true;

  return isStandalone || isInWebAppiOS;
};

// Track app launch source
export const trackAppLaunch = () => {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get('source') || (isPWA() ? 'home_screen' : 'browser');

  pwaAnalytics.sessionStarted(source as 'home_screen' | 'browser');
};
