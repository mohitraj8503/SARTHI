'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

import UserAvatar from '@/components/ui/UserAvatar';
import NotificationBell from '@/components/NotificationBell';
import { useSidebarStore } from '@/hooks/use-sidebar-store';

export default function StudentMobileHeader({ user: propUser }: { user?: any }) {
    const { user: authUser } = useAuth();
    const user = authUser || propUser;
    const { open } = useSidebarStore();

    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-[110] bg-[#1B4332] text-white px-4 h-16 flex items-center justify-between border-b border-white/10 shadow-md">
            <div className="flex items-center gap-3">
                <button
                    onClick={open}
                    aria-label="Open navigation menu"
                    className="p-2 text-white hover:text-emerald-400 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm shrink-0">
                        <Image src="/sarthi-logo.png" alt="TT" width={20} height={20} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <span className="font-bold text-sm tracking-tight block leading-tight text-white">SARTHI</span>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Student Portal</span>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <NotificationBell />
                
                <Link 
                    href="/dashboard/settings"
                    className="active:scale-95 transition-all"
                    title="Account Settings"
                >
                    <UserAvatar 
                        user={user} 
                        size="sm" 
                        className="border border-white/20 shadow-sm"
                    />
                </Link>
            </div>
        </div>
    );
}


