'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Smartphone } from 'lucide-react';
import { usePWAFeatures } from '@/lib/usePWAFeatures';

export default function PWABenefitsBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { isInPWA, pwaBenefits } = usePWAFeatures();

  // Only show for PWA users who haven't dismissed it
  const shouldShow = isInPWA && !dismissed && !localStorage.getItem('pwa_benefits_dismissed');

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa_benefits_dismissed', 'true');
  };

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Welcome to SARTHI App!</p>
              <p className="text-xs opacity-90">
                Enjoy exclusive PWA benefits including {pwaBenefits[0]?.toLowerCase()}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

