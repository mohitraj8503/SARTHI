'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEngagementScoring } from './useEngagementScoring';
import { pwaAnalytics } from './pwaAnalytics';

interface PWAPromptState {
  show: boolean;
  dismissed: boolean;
  installed: boolean;
}

export function usePWAPrompt() {
  const [state, setState] = useState<PWAPromptState>({
    show: false,
    dismissed: false,
    installed: false,
  });

   
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { shouldShowPrompt, trackInteraction } = useEngagementScoring();

  // Check if already installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
       
      const isInWebAppiOS = (window.navigator as any).standalone === true;


      if (isStandalone || isInWebAppiOS) {
        setState(prev => ({ ...prev, installed: true }));
        return;
      }

      // Check localStorage for previous installation
      const installed = localStorage.getItem('pwa_installed') === 'true';
      setState(prev => ({ ...prev, installed }));
    };

    checkInstalled();
  }, []);

  // Listen for beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if we should show the prompt
      if (shouldShowPrompt() && !state.dismissed && !state.installed) {
        // Add delay to not be intrusive
        setTimeout(() => {
          setState(prev => ({ ...prev, show: true }));
          // Track prompt shown
          pwaAnalytics.promptShown('engagement_based', navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop');
        }, 3000); // 3 seconds delay
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [shouldShowPrompt, state.dismissed, state.installed]);

  // Handle install
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    trackInteraction();
    pwaAnalytics.installStarted();

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      // Track installation
      localStorage.setItem('pwa_installed', 'true');
      setState(prev => ({ ...prev, installed: true, show: false }));

      pwaAnalytics.installCompleted('bottom_sheet_modal');
    }

    setDeferredPrompt(null);
  }, [deferredPrompt, trackInteraction]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setState(prev => ({ ...prev, show: false, dismissed: true }));

    // Store dismissal time
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());

    pwaAnalytics.promptDismissed('user_dismissed', 0); // Could track time shown
  }, []);

  // Show prompt on demand (for testing or manual trigger)
  const showPrompt = useCallback(() => {
    if (!state.installed && !state.dismissed) {
      setState(prev => ({ ...prev, show: true }));
    }
  }, [state.installed, state.dismissed]);

  return {
    show: state.show,
    installed: state.installed,
    handleInstall,
    handleDismiss,
    showPrompt,
  };
}
