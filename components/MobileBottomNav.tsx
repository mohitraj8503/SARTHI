'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, GraduationCap, PlayCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const [isCenterTapped, setIsCenterTapped] = useState(false);

    // Only show on mobile and dashboard-related pages
    const isDashboardPage = pathname?.startsWith('/dashboard') || pathname === '/profile';

    if (!isDashboardPage) return null;

    const navigationItems = [
        { href: '/dashboard', label: 'Home', icon: Home },
        { href: '/dashboard/courses', label: 'Courses', icon: GraduationCap },
        { isPlaceholder: true }, // Placeholder for floating logo
        { href: '/dashboard/live', label: 'Classes', icon: PlayCircle },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    const handleCenterTap = () => {
        setIsCenterTapped(true);
        setTimeout(() => setIsCenterTapped(false), 600);
    };

    return (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-[100] lg:hidden flex justify-center pointer-events-none select-none">
            <motion.nav
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 260 }}
                className="relative w-full max-w-[400px] h-16 bg-white/75 dark:bg-zinc-950/70 border border-white/20 dark:border-white/10 rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-[24px] px-3 flex items-center justify-between pointer-events-auto"
                role="navigation"
                aria-label="Mobile navigation"
            >
                {navigationItems.map((item, index) => {
                    if (item.isPlaceholder) {
                        return (
                            <div key="center-placeholder" className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                                {/* Glowing halo */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.15, 1],
                                        opacity: [0.3, 0.6, 0.3],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute inset-0 rounded-full bg-[#16A34A]/5 dark:bg-[#16A34A]/10 blur-md pointer-events-none"
                                />

                                <button
                                    onClick={handleCenterTap}
                                    className="absolute -top-5 z-20 flex flex-col items-center justify-center cursor-pointer focus:outline-none"
                                >
                                    <motion.div
                                        animate={isCenterTapped ? {
                                            scale: [0.9, 1.15, 1],
                                            rotate: [0, -10, 8, 0]
                                        } : {
                                            y: [0, -3, 0]
                                        }}
                                        transition={isCenterTapped ? {
                                            type: 'spring',
                                            damping: 10,
                                            stiffness: 200
                                        } : {
                                            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                                        }}
                                        className="w-14 h-14 rounded-full bg-white/40 dark:bg-black/35 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center hover:scale-[1.04] active:scale-[0.96] transition-transform duration-300 relative overflow-hidden"
                                    >
                                        {/* Radial soft glow */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#16A34A]/[0.05] to-transparent dark:from-[#16A34A]/[0.08]" />
                                        
                                        {/* Circular subtle ripple if tapped */}
                                        {isCenterTapped && (
                                            <motion.span
                                                initial={{ scale: 0, opacity: 0.5 }}
                                                animate={{ scale: 2.2, opacity: 0 }}
                                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                                className="absolute w-6 h-6 rounded-full bg-[#16A34A]/15 pointer-events-none"
                                            />
                                        )}

                                        <span className="font-black tracking-wider text-[16px] text-[#16A34A] dark:text-[#22C55E] select-none">
                                            AI
                                        </span>
                                    </motion.div>
                                    <span className="text-[9.5px] font-bold mt-1.5 leading-none tracking-wide text-gray-400 dark:text-zinc-500">
                                        AI
                                    </span>
                                </button>
                            </div>
                        );
                    }

                    const { href, label, icon: Icon } = item;
                    const isActive = pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "relative flex flex-col items-center justify-center min-w-[56px] h-full transition-all active:scale-95 group select-none cursor-pointer flex-1"
                            )}
                            aria-current={isActive ? 'page' : undefined}
                            aria-label={label}
                        >
                            <motion.div
                                animate={isActive ? { scale: 1.0, y: -4 } : { scale: 0.9, y: 0 }}
                                transition={{ type: 'spring', damping: 12, stiffness: 250 }}
                                className={cn(
                                    "transition-colors duration-300 relative z-10",
                                    isActive ? "text-[#16A34A] dark:text-[#22C55E]" : "text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-zinc-300"
                                )}
                            >
                                <Icon className="w-5 h-5 stroke-[2.2px]" />
                            </motion.div>

                            <motion.span
                                initial={{ opacity: 0, y: 6 }}
                                animate={isActive ? { opacity: 1, y: -1 } : { opacity: 0, y: 6 }}
                                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                                className={cn(
                                    "text-[9.5px] font-bold mt-0.5 leading-none tracking-wide transition-colors duration-300 absolute bottom-3 z-10",
                                    isActive ? "text-[#16A34A] dark:text-[#22C55E]" : "text-transparent"
                                )}
                            >
                                {label}
                            </motion.span>

                            {/* Active Tab Highlight Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    transition={{ type: 'spring', damping: 15, stiffness: 220 }}
                                    className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[#16A34A] dark:bg-[#22C55E] shadow-[0_0_8px_rgba(22,197,94,0.6)] z-0"
                                />
                            )}
                        </Link>
                    );
                })}
            </motion.nav>
        </div>
    );
}