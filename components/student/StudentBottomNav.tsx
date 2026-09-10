'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Video, Award, Settings, User, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
    { name: 'Classes', href: '/dashboard/live', icon: Video },
    { name: 'Tasks', href: '/dashboard/assignments', icon: PlayCircle },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function StudentBottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/10 backdrop-blur-2xl border-t border-white/10 px-2 pb-safe pt-2 flex items-center justify-around shadow-2xl h-16"
            role="navigation"
            aria-label="Mobile navigation"
        >
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "relative flex flex-col items-center justify-center min-w-[64px] h-full transition-all active:scale-90 group",
                            isActive ? "text-emerald-400" : "text-white/40"
                        )}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <div className={cn(
                            "transition-all duration-300 transform",
                            isActive ? "scale-110" : "scale-100"
                        )}>
                            <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-tight mt-1 font-outfit italic leading-none">
                            {item.name}
                        </span>
                        {isActive && (
                            <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}

