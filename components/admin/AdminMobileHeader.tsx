'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import UserAvatar from '@/components/ui/UserAvatar';
import { useSidebarStore } from '@/hooks/use-sidebar-store';
import Image from 'next/image';

export default function AdminMobileHeader() {
    const { user } = useAuth();
    const { open } = useSidebarStore();

    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-[50] bg-white text-slate-800 px-4 h-16 flex items-center justify-between border-b border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
                <button
                    onClick={open}
                    aria-label="Open navigation menu"
                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center active:scale-90 transition-all border border-slate-200 hover:bg-slate-100 text-slate-600"
                >
                    <Menu className="w-5 h-5" />
                </button>
                
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center p-1 relative">
                        <Image 
                            src="/sarthi-logo.png" 
                            alt="TT Logo" 
                            width={32}
                            height={32}
                            className="w-full h-full object-contain animate-fade-in" 
                        />
                    </div>
                    <div>
                        <span className="text-sm font-bold tracking-tight text-slate-800 block">SARTHI</span>
                        <span className="text-[8px] font-bold text-orange-600 uppercase tracking-widest leading-none block">Admin</span>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <Link 
                    href="/admin/settings"
                    className="active:scale-95 transition-all"
                >
                    <UserAvatar 
                        user={user} 
                        size="sm" 
                        className="border border-slate-200 shadow-sm"
                    />
                </Link>
            </div>
        </div>
    );
}
