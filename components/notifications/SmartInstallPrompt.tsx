'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, ShieldCheck, CheckCircle2, Sparkles, Share, Plus, HelpCircle, Monitor, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function SmartInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'desktop' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isTimerFinished, setIsTimerFinished] = useState(false);

  const checkShouldShow = useCallback(() => {
    if (typeof window === 'undefined') return false;

    // Do not show the prompt on mobile devices (Android / iOS)
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod/i.test(ua) || 
      (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isMobile) return false;

    // Do not show the download prompt if already running inside the native mobile app
    const isInsideApp = navigator.userAgent.includes('SARTHIApp');
    if (isInsideApp) {
      localStorage.setItem('sarthi_pwa_installed', 'true');
      return false;
    }

    const installed = localStorage.getItem('sarthi_pwa_installed') === 'true';
    if (installed) return false;

    // Don't show if dismissed in the last 24 hours (allows showing again later)
    const dismissedAt = localStorage.getItem('sarthi_install_prompt_dismissed_at');
    if (dismissedAt) {
      const hoursSinceDismissal = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
      if (hoursSinceDismissal < 24) return false;
    }

    // Don't show again in the same session to avoid annoying navigation popups
    const sessionShown = sessionStorage.getItem('sarthi_session_prompt_shown') === 'true';
    if (sessionShown) return false;

    return true;
  }, []);

  const triggerShowPrompt = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!checkShouldShow()) return;

    sessionStorage.setItem('sarthi_session_prompt_shown', 'true');
    setShowPrompt(true);
  }, [checkShouldShow]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).showTechtomorrowInstallPrompt = (device?: 'android' | 'ios' | 'desktop') => {
        if (device) setDeviceType(device);
        setShowPrompt(true);
      };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Detect if the app is already running in standalone mode (already installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (navigator as any).standalone === true;

    if (isStandalone) {
      localStorage.setItem('sarthi_pwa_installed', 'true');
      return;
    }

    // Force show using query parameter ?install=true or ?show-install=true
    const queryParams = new URLSearchParams(window.location.search);
    const forceShow = queryParams.get('install') === 'true' || queryParams.get('show-install') === 'true';
    
    if (forceShow) {
      const device = queryParams.get('device');
      if (device === 'android' || device === 'ios' || device === 'desktop') {
        if (isMounted) setDeviceType(device as any);
      } else {
        // Detect automatically
        const ua = navigator.userAgent.toLowerCase();
        let detectedDevice: 'android' | 'ios' | 'desktop' = 'desktop';
        if (/android/i.test(ua)) {
          detectedDevice = 'android';
        } else if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
          detectedDevice = 'ios';
        }
        if (isMounted) setDeviceType(detectedDevice);
      }
      if (isMounted) setShowPrompt(true);
      return;
    }

    // 2. Check if the prompt has already been shown/interacted with in this browser
    if (!checkShouldShow()) return;

    // 3. Asynchronously check if the app is already installed using getInstalledRelatedApps
    if (typeof navigator !== 'undefined' && 'getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps()
        .then((relatedApps: any[]) => {
          if (isMounted && relatedApps && relatedApps.length > 0) {
            localStorage.setItem('sarthi_pwa_installed', 'true');
            setShowPrompt(false);
          }
        })
        .catch((err: any) => {
          console.error('Error checking installed apps:', err);
        });
    }

    // 4. Device detection logic
    const ua = navigator.userAgent.toLowerCase();
    let detectedDevice: 'android' | 'ios' | 'desktop' = 'desktop';

    if (/android/i.test(ua)) {
      detectedDevice = 'android';
    } else if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      detectedDevice = 'ios';
    }

    if (isMounted) setDeviceType(detectedDevice);

    // 5. Start a 3-second timer to allow page load to settle
    const timer = setTimeout(() => {
      if (isMounted) setIsTimerFinished(true);
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [checkShouldShow]);

  // Separate useEffect to handle prompt trigger based on platform readiness
  useEffect(() => {
    if (!isTimerFinished || !deviceType || showPrompt) return;
    if (!checkShouldShow()) return;

    // On desktop, only trigger the custom prompt if deferredPrompt is actually available
    if (deviceType === 'desktop') {
      if (deferredPrompt) {
        triggerShowPrompt();
      }
    } else {
      triggerShowPrompt();
    }
  }, [isTimerFinished, deviceType, deferredPrompt, showPrompt, checkShouldShow, triggerShowPrompt]);

  // 6. Capture native PWA installation event for Desktop/Android browsers
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 7. Listen for native appinstalled event
  useEffect(() => {
    const handleAppInstalled = () => {
      localStorage.setItem('sarthi_pwa_installed', 'true');
      setShowPrompt(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sarthi_install_prompt_dismissed_at', Date.now().toString());
    }
    setShowPrompt(false);
  };

  const handleAndroidDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(10);
    
    // Simulate loading/preparing progress bar for premium experience
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Trigger direct APK download link
          window.location.href = 'https://github.com/mohitraj8503/sarthi-app/releases/download/v1.0.14/Tech-Tomorrow.apk';
          
          // Save status so they are not prompted again
          localStorage.setItem('sarthi_pwa_installed', 'true');

          // Complete and dismiss after a brief moment
          setTimeout(() => {
            setShowPrompt(false);
          }, 1000);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleDesktopInstall = async () => {
    if (deferredPrompt) {
      // Trigger native browser install prompt if event was captured
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        handleDismiss();
      }
    } else {
      // If no native PWA install prompt is available, just dismiss
      handleDismiss();
    }
  };

  if (!showPrompt || !deviceType) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
        
        {/* Backdrop Fade In */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="absolute inset-0 bg-transparent cursor-pointer"
        />

        {/* Dialog Panel - Styled like SARTHI AI chatbot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { type: 'spring', damping: 25, stiffness: 200 }
          }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[40px] bg-slate-900/90 border border-white/10 ring-1 ring-inset ring-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-2xl flex flex-col max-h-[95vh] md:max-h-[90vh]"
        >
          
          {/* Subtle Glowing Background Elements */}
          <div className="absolute inset-0 pointer-events-none rounded-[40px] overflow-hidden">
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent rounded-full blur-[60px] animate-pulse" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent rounded-full blur-[60px]" />
          </div>

          {/* HEADER - Styled exactly like StudentAIChat header */}
          <div className="p-6 pb-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl relative z-10 w-full">
            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.div 
                  animate={{ 
                    boxShadow: ["0 0 0px rgba(16,185,129,0)", "0 0 25px rgba(16,185,129,0.5)", "0 0 0px rgba(16,185,129,0)"] 
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-14 h-14 rounded-[18px] bg-white flex items-center justify-center border border-white/30 shadow-2xl relative z-10 overflow-hidden"
                >
                  <Image 
                    src="/sarthi-logo.png" 
                    alt="SARTHI Logo" 
                    width={128} 
                    height={128}
                    className="w-full h-full object-contain scale-[1.2]"
                    priority
                    unoptimized
                  />
                </motion.div>
                
                {/* Badge Overlay */}
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-lg p-1 border border-white z-20 shadow-xl">
                  <Sparkles className="text-white w-3 h-3" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-xl tracking-tight leading-none mb-1">
                  {deviceType === 'desktop' ? 'SARTHI Desktop App' : 'SARTHI Mobile App'}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.1em] opacity-90">
                    {deviceType === 'desktop' ? 'Desktop App • Offline Study' : 'Mobile App • Offline Study'}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              aria-label="Dismiss prompt"
              className="w-10 h-10 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all active:scale-90 flex items-center justify-center border border-white/10 backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CONTENT AREA - Scrollable inside dialog */}
          <div className="p-6 space-y-6 flex flex-col items-center w-full relative z-10 overflow-y-auto no-scrollbar max-h-[70vh]">
            
            {/* Welcome message bubble from SARTHI AI */}
            <div className="flex justify-start gap-3 w-full">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-white/20 overflow-hidden relative bg-white">
                <Image 
                  src="/sarthi-logo.png" 
                  alt="SARTHI" 
                  width={64} 
                  height={64}
                  className="w-full h-full object-contain scale-[1.2]"
                  unoptimized
                />
              </div>
              
              <div className="p-4 rounded-3xl text-[13px] leading-relaxed shadow-xl bg-white/10 text-gray-200 border border-white/10 rounded-tl-none backdrop-blur-md text-left flex-1">
                {deviceType === 'android' ? (
                  "Namaste! SARTHI mobile app install karlo taaki aap lectures download karke offline padh sako aur app ekdum fast chale. Bas niche click karo install karne ke liye!"
                ) : deviceType === 'ios' ? (
                  "Namaste! SARTHI mobile app install karne ke liye isko home screen par add karlo taaki lectures smoothly chalein aur bina internet ke padhne me aasaani ho."
                ) : (
                  "Namaste! SARTHI desktop app install karlo taaki direct taskbar ya dock se open karke offline lectures dekh sako."
                )}
              </div>
            </div>

            {/* Screen 1: Android Experience */}
            {deviceType === 'android' && (
              <div className="w-full space-y-5">
                {/* Features Checklist */}
                <div className="text-left bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3.5 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-semibold text-gray-200">Lectures download karo aur bina internet ke padho</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-semibold text-gray-200">App ekdum fast chalega bina kisi lag ke</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-semibold text-gray-200">Sare courses aur resources easily access karein</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-semibold text-gray-200">Direct notifications aur study alerts paayein</p>
                  </div>
                </div>

                {/* Progress bar if downloading */}
                {isDownloading && (
                  <div className="w-full space-y-2 text-left">
                    <div className="flex justify-between text-xs font-bold text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        Preparing APK file...
                      </span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Buttons Grid */}
                {!isDownloading && (
                  <div className="grid grid-cols-5 gap-3 w-full">
                    <button
                      onClick={handleAndroidDownload}
                      className="relative col-span-3 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full border border-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
                    >
                      <Download className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      App Download Karein
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="col-span-2 px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold rounded-full transition-all duration-200 active:scale-95 text-center"
                    >
                      Skip Karein
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Screen 2: iOS Experience */}
            {deviceType === 'ios' && (
              <div className="w-full space-y-5">
                {/* Animated Instructions Box */}
                <div className="text-left bg-white/5 border border-white/10 rounded-3xl p-5 space-y-5 w-full">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-200">Share Button par tap karein</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                        Safari toolbar ke bottom ya top par share icon <Share className="w-3.5 h-3.5 text-[#0EA5E9]" /> par click karein.
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/10" />

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-200">&quot;Add to Home Screen&quot; ko select karein</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                        Scroll karke menu me se <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add to Home Screen par click karein.
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/10" />

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-200">Confirm karke install karein</p>
                      <p className="text-[11px] text-gray-400">
                        Top-right corner me <span className="text-[#0EA5E9] font-bold">Add</span> tap karein aur app ready ho jayega.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Continue button */}
                <button
                  onClick={handleDismiss}
                  className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  Website par continue karein <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            )}

            {/* Screen 3: Desktop Experience */}
            {deviceType === 'desktop' && (
              <div className="w-full space-y-5">
                {/* Features Checklist */}
                <div className="text-left bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3.5 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-semibold text-gray-200">Taskbar ya desktop dock se direct open karein</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-semibold text-gray-200">Lectures aur resources offline access karein</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-semibold text-gray-200">Super fast response aur smoothly classes dekhein</p>
                  </div>
                </div>

                {/* Buttons Grid */}
                <div className="grid grid-cols-5 gap-3 w-full">
                  <button
                    onClick={handleDesktopInstall}
                    className="col-span-3 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full border border-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    App Install Karein
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="col-span-2 px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold rounded-full transition-all duration-200 active:scale-95 text-center"
                  >
                    Skip Karein
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Brand / Security Info & Tech Hub Footer */}
            <div className="flex flex-col items-center gap-4 w-full pt-2">
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Secure Connection</span>
              </div>
              
              <div className="flex items-center justify-center gap-4 opacity-30 w-full">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                <p className="text-[9px] text-white font-black uppercase tracking-[0.6em] whitespace-nowrap">
                  FUTURE TECH HUB
                </p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
