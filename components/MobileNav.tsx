'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Radio, User } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { motion } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

const getMobileIcon = (label: string) => {
  switch (label) {
    case 'Home':
      return Home;
    case 'Courses':
      return BookOpen;
    case 'Classes':
      return Radio;
    case 'Profile':
      return User;
    default:
      return Home;
  }
};

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Courses', href: '/courses', icon: BookOpen },
    { label: 'AI', href: '/ai', isPrimary: true },
    { label: 'Classes', href: '/seminars', icon: Radio, hasBadge: true },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  // Show mobile bottom navigation on all public pages, hiding only on auth/dashboard/fullscreen exam routes
  const isExcludedRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/dashboard') ||
    pathname.includes('/assessment') ||
    pathname.includes('/register') ||
    pathname === '/payment-receipt-demo';

  const shouldShow = !isExcludedRoute;

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!shouldShow || isFullscreen) return null;

  return (
    <>
      {/* Desktop Floating AI Button - Solid black background with pulsing green aura */}
      <div className="hidden lg:block fixed right-8 bottom-8 z-[1000]">
        <div className="absolute inset-0 rounded-full bg-[#16A34A]/20 blur-md pointer-events-none animate-pulse" />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Open AI Assistant"
          className="relative w-[64px] h-[64px] bg-black rounded-full flex items-center justify-center text-white shadow-[0_12px_28px_rgba(0,0,0,0.4)] border-[4px] border-white cursor-pointer active:scale-95 transition-all duration-300 group overflow-hidden"
          onClick={() => {
            triggerHaptic('medium');
            window.dispatchEvent(new CustomEvent('open-ai-assistant'));
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#16A34A]/10 to-transparent pointer-events-none" />
          <span className="font-black tracking-wider text-[17px] text-white relative z-10 select-none drop-shadow-[0_0_8px_rgba(34,197,94,0.95)]">
            AI
          </span>
        </motion.button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {pathname !== '/payment-receipt-demo' && (
        <div className="lg:hidden fixed left-0 right-0 bottom-8 z-[1000] w-full pointer-events-none flex justify-center px-4">
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="pointer-events-auto w-full max-w-[420px] h-[72px] bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[32px] flex justify-between items-center px-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent" />

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = getMobileIcon(item.label);

              if (item.isPrimary) {
                return (
                  <div key={item.label} className="relative w-[70px] h-full flex flex-col items-center justify-end pb-2 z-20">
                    <div className="absolute top-[-30px] w-[68px] h-[68px] rounded-full bg-[#16A34A]/10 blur-md pointer-events-none animate-pulse" />

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Open AI Assistant"
                      className="absolute top-[-24px] w-[58px] h-[58px] bg-white rounded-full flex items-center justify-center text-slate-900 shadow-[0_8px_20px_rgba(0,0,0,0.2)] border-[3px] border-black active:scale-95 transition-all duration-300 group overflow-hidden"
                      onClick={() => {
                        triggerHaptic('medium');
                        window.dispatchEvent(new CustomEvent('open-ai-assistant'));
                      }}
                    >
                      <img
                        src="/sarthi-logo.png"
                        alt="SARTHI Logo"
                        className="w-9 h-9 object-contain relative z-10"
                      />
                    </motion.button>
                    <span className="text-[10px] font-black text-[#1A3C2E] opacity-80 tracking-tight leading-none">
                      {item.label}
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={item.label === 'Profile' ? false : undefined}
                  onClick={() => triggerHaptic('light')}
                  className={cn(
                    "flex-1 h-full flex flex-col items-center justify-center relative group active:scale-90 transition-transform duration-200",
                    isActive ? 'text-[#1A3C2E]' : 'text-[#7a9a7a]'
                  )}
                >
                  <div className="flex flex-col items-center justify-center gap-[4px] relative">
                    <motion.div
                      animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <Icon className={cn(
                        "w-[22px] h-[22px] transition-all",
                        isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'
                      )} />
                      {item.hasBadge && (
                        <span className="absolute -top-1 -right-1 flex h-[8px] w-[8px]">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-[8px] w-[8px] bg-red-500 border-[2px] border-white"></span>
                        </span>
                      )}
                    </motion.div>
                    
                    <span className={cn(
                      "text-[10px] leading-none tracking-tight transition-all",
                      isActive ? 'font-black opacity-100' : 'font-medium opacity-70'
                    )}>
                      {item.label}
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="w-[4px] h-[4px] bg-[#1A3C2E] rounded-full absolute -bottom-3"
                        transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </motion.nav>
        </div>
      )}
    </>
  );
}
