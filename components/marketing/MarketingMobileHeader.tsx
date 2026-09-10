'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import UserAvatar from '@/components/ui/UserAvatar';
import { useSidebarStore } from '@/hooks/use-sidebar-store';

export default function MarketingMobileHeader({ user: propUser }: { user?: any }) {
    const { user: authUser } = useAuth();
    const user = authUser || propUser;
    const { open } = useSidebarStore();

    return (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-[120] bg-white/40 backdrop-blur-2xl text-slate-900 px-4 xs:px-6 h-20 flex items-center justify-between border-b border-black/5 shadow-xl">
            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={open}
                    aria-label="Open navigation menu"
                    className="w-10 h-10 xs:w-12 xs:h-12 rounded-xl xs:rounded-2xl bg-black/5 flex items-center justify-center active:scale-90 transition-all border border-black/10 hover:bg-black/10 relative z-[130]"
                >
                    <Menu className="w-5 h-5 xs:w-6 xs:h-6 text-slate-900" />
                </button>
                
                <Link href="/marketing/dashboard" className="group text-left">
                    <span className="text-base xs:text-xl sm:text-2xl font-black tracking-tighter block font-outfit uppercase italic leading-none text-slate-950">SARTHI</span>
                    <span className="text-[8px] xs:text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] block mt-0.5 xs:mt-1">Partner Portal</span>
                </Link>
            </div>

            <div className="flex items-center gap-2 xs:gap-3">
                <UserAvatar 
                    user={user} 
                    size="md" 
                    className="border-2 border-white shadow-md w-8 h-8 xs:w-10 xs:h-10"
                />
            </div>
        </div>
    );
}
