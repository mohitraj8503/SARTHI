'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Video, Award, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
    { name: 'Live', href: '/dashboard/live', icon: Video },
    { name: 'Badges', href: '/dashboard/certificates', icon: Award },
    { name: 'Account', href: '/dashboard/settings', icon: Settings },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[140] lg:hidden bg-[#F7F4EF]/90 backdrop-blur-2xl border-t border-[#EAE6DF]/50 px-2 py-1 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-around max-w-md mx-auto h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-300 relative",
                                isActive ? "text-[#1B4332]" : "text-[#5D705C] opacity-60 hover:opacity-100"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-all",
                                isActive && "bg-[#1B4332]/5 scale-110"
                            )}>
                                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-tighter",
                                isActive ? "opacity-100" : "opacity-0 scale-75"
                            )}>
                                {item.name}
                            </span>
                            
                            {isActive && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1B4332] rounded-full blur-[2px]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

