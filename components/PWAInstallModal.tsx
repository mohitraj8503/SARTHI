'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Share, PlusSquare, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PWAInstallModal({ isOpen, onClose }: PWAInstallModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [showInstructionHighlight, setShowInstructionHighlight] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    triggerHaptic('impactMedium');
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          triggerHaptic('success');
          setInstalledSuccess(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('App install error:', err);
        setShowInstructionHighlight(true);
      }
    } else {
      setShowInstructionHighlight(true);
      setTimeout(() => {
        setShowInstructionHighlight(false);
      }, 4000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-md select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Modal Card - Apple Minimalist Theme */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[460px] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[28px] p-6 sm:p-7 shadow-[0_32px_80px_rgba(0,0,0,0.12)] border border-black/5 dark:border-white/10 z-10 overflow-hidden text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header Row */}
          <div className="flex items-start justify-between pb-5 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-3.5">
              {/* Apple-style Squircle Logo Container */}
              <div className="w-14 h-14 rounded-[16px] border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 shadow-sm flex items-center justify-center shrink-0 p-1 overflow-hidden">
                <Image
                  src="/sarthi-logo.png"
                  alt="SARTHI"
                  width={180}
                  height={180}
                  priority
                  className="w-full h-full object-contain rounded-[12px]"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                    SARTHI
                  </h3>
                  <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Official App
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-500 dark:text-zinc-400 font-medium">
                  Fast, offline-ready & native experience
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer shrink-0 mt-0.5"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success State */}
          {(installedSuccess || isStandalone) && (
            <div className="my-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-[12px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">App Installed</h4>
                <p className="text-[12px] text-emerald-700 dark:text-emerald-400">Running official SARTHI app.</p>
              </div>
            </div>
          )}



          {/* Primary CTA Button */}
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white font-semibold text-[13.5px] tracking-wider uppercase rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-5 mb-4"
          >
            <Download className="w-4 h-4 stroke-[2.2]" />
            <span>Install Our App</span>
          </button>

          {/* iOS / Safari Setup Instructions */}
          {isIOS && !isStandalone && (
            <div className={cn(
              "space-y-2.5 mb-4 p-3.5 rounded-2xl transition-all duration-300 border",
              showInstructionHighlight
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-md ring-2 ring-emerald-500/30 scale-[1.01]"
                : "bg-slate-50 dark:bg-zinc-800/40 border-slate-100 dark:border-zinc-800"
            )}>
              <h4 className="text-[11.5px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                <span>Install on iPhone / iPad (Safari)</span>
                {showInstructionHighlight && (
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-200/80 dark:bg-emerald-900/80 px-2 py-0.5 rounded-full">
                    Follow Steps Below 👇
                  </span>
                )}
              </h4>
              <ol className="space-y-1.5 text-[12px] text-slate-600 dark:text-zinc-400 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#1A3C2E] text-white text-[9px] font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Tap <Share className="w-3.5 h-3.5 text-blue-500 inline mx-0.5" /> <strong>Share</strong> in Safari.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#1A3C2E] text-white text-[9px] font-bold flex items-center justify-center shrink-0">2</span>
                  <span>Select <PlusSquare className="w-3.5 h-3.5 text-emerald-600 inline mx-0.5" /> <strong>Add to Home Screen</strong>.</span>
                </li>
              </ol>
            </div>
          )}

          {/* Android / Desktop Chrome Instructions */}
          {!isIOS && !isStandalone && (
            <div className="space-y-2.5 mb-4">
              <div className={cn(
                "p-3.5 rounded-2xl transition-all duration-300 border space-y-2.5",
                showInstructionHighlight
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-md ring-2 ring-emerald-500/30 scale-[1.01]"
                  : "bg-slate-50 dark:bg-zinc-800/40 border-slate-100 dark:border-zinc-800"
              )}>
                <h4 className="text-[11.5px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Install on Android / Chrome</span>
                  {showInstructionHighlight && (
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-200/80 dark:bg-emerald-900/80 px-2 py-0.5 rounded-full">
                      Follow Steps Below 👇
                    </span>
                  )}
                </h4>
                <ol className="space-y-1.5 text-[12px] text-slate-600 dark:text-zinc-400 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#1A3C2E] text-white text-[9px] font-bold flex items-center justify-center shrink-0">1</span>
                    <span>Tap <strong>⋮ (3 Dots)</strong> at top right of Chrome.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#1A3C2E] text-white text-[9px] font-bold flex items-center justify-center shrink-0">2</span>
                    <span>Select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          <div className="text-center pt-1">
            <button
              onClick={onClose}
              className="text-[12px] font-medium text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors tracking-wide uppercase"
            >
              Continue Browsing
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
