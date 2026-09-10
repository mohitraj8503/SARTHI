'use client';

import {
    LayoutDashboard,
    Users,
    CreditCard,
    LogOut,
    Search,
    X,
    ChevronRight
} from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';
import UserAvatar from '@/components/ui/UserAvatar';
import { useSidebarStore } from '@/hooks/use-sidebar-store';

const navItems = [
    { name: 'Overview', href: '/marketing/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/marketing/dashboard/students', icon: Users },
    { name: 'Payments', href: '/marketing/dashboard/payments', icon: CreditCard },
];

export default function MarketingSidebar({ user: propUser }: { user?: any }) {
    const pathname = usePathname();
    const { signOut, user: authUser } = useAuth();
    const user = authUser || propUser;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isOpen, close } = useSidebarStore();

    // Sync sidebar width with layout via CSS variable
    React.useEffect(() => {
        const updateWidth = () => {
            if (window.innerWidth < 1024) {
                document.documentElement.style.setProperty('--sidebar-width', '0px');
            } else {
                const width = isCollapsed ? '72px' : '260px';
                document.documentElement.style.setProperty('--sidebar-width', width);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [isCollapsed]);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300"
                    onClick={close}
                    aria-hidden="true"
                />
            )}

            <aside 
                className={cn(
                    "bg-[rgba(10,30,15,0.60)] backdrop-blur-[32px] -webkit-backdrop-blur-[32px] flex flex-col h-full fixed left-0 top-0 z-[101] text-white border-r border-white/8 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    isCollapsed ? "w-[72px]" : "w-[260px]",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
                role="complementary"
                aria-label="Marketing Sidebar"
            >
                {/* Collapse Toggle Button */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/18 shadow-none z-[102] hover:bg-white/20 transition-all hidden lg:flex"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <ChevronRight className={cn("w-4 h-4 text-white transition-transform duration-300", isCollapsed ? "rotate-0" : "rotate-180")} />
                </button>

                {/* Logo Area */}
                <div className={cn(
                    "py-8 flex items-center border-b border-white/5 mb-2 transition-all duration-300",
                    isCollapsed ? "px-0 justify-center h-[80px]" : "px-6 justify-between h-[80px]"
                )}>
                    <Link 
                        href="/marketing/dashboard" 
                        className={cn("flex items-center transition-none", isCollapsed ? "justify-center" : "gap-3")} 
                        onClick={close}
                    >
                        <div className={cn(
                            "bg-white rounded-xl flex items-center justify-center relative shrink-0 transition-all duration-300",
                            isCollapsed ? "w-9 h-9 p-1" : "w-10 h-10 p-1.5"
                        )}>
                            <Image 
                                src="/sarthi-logo.png" 
                                alt="TT Logo" 
                                width={40}
                                height={40}
                                priority
                                quality={100}
                                className="w-full h-full object-contain" 
                            />
                        </div>
                        {!isCollapsed && (
                            <div className="logo-text overflow-hidden whitespace-nowrap pr-2">
                                <span className="text-base font-black text-white tracking-tighter block font-outfit italic uppercase leading-none">
                                    SARTHI
                                </span>
                                <span className="text-[9px] font-black text-[#f97316] uppercase tracking-[0.15em] leading-none mt-1.5 block">
                                    PARTNER PORTAL
                                </span>
                            </div>
                        )}
                    </Link>
                    
                    {/* Mobile Close Button */}
                    <button 
                        onClick={close}
                        className="lg:hidden w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 transition-none active:scale-95"
                        aria-label="Close menu"
                    >
                        <X className="w-6 h-6 text-white/60" />
                    </button>
                </div>

                <div className={cn("px-8 mb-6", isCollapsed && "px-3")}>
                    <div className="relative flex justify-center">
                        <label htmlFor="sidebar-search" className="sr-only">Search</label>
                        <Search className={cn("text-white/40", isCollapsed ? "w-4 h-4" : "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5")} aria-hidden="true" />
                        {!isCollapsed && (
                            <input 
                                id="sidebar-search"
                                type="text" 
                                placeholder="Search portal..."
                                className="w-full bg-white/[0.05] border border-white/10 rounded-[10px] pl-9 pr-4 py-2 text-xs text-white placeholder-white/35 outline-none focus:bg-white/[0.08] focus:border-green-500/30 transition-all"
                            />
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar" aria-label="Main Navigation">
                    <div className={isCollapsed ? "flex flex-col items-center" : ""}>
                        {!isCollapsed && <h2 className="px-4 text-[10px] font-black text-white/35 uppercase tracking-[1.5px] mb-4" id="main-menu-heading">Menu</h2>}
                        <div className="space-y-1" role="list" aria-labelledby="main-menu-heading">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined} onClick={close}>
                                        <div 
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 transition-none group relative cursor-pointer",
                                                isCollapsed ? "justify-center px-0" : "rounded-[10px]",
                                                isActive
                                                    ? "bg-green-500/12 text-[#4ade80] border-l-4 border-l-[#22c55e] rounded-l-none rounded-r-[10px]"
                                                    : "text-white/65 rounded-[10px] hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <Icon className={cn("w-[18px] h-[18px] text-[16px] shrink-0", isActive ? "text-[#4ade80]" : "text-white/40 group-hover:text-white/70")} aria-hidden="true" />
                                            {!isCollapsed && <span className="text-sm font-medium nav-label">{item.name}</span>}
                                            {isCollapsed && (
                                                <div className="absolute left-[70px] bg-[rgba(10,30,15,0.90)] text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none border border-white/15 z-[999] shadow-xl">
                                                    {item.name}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                <div className={cn("p-4 mt-auto mb-4 border-t border-white/5", isCollapsed && "px-0")}>
                    <div 
                        className={cn(
                            "flex items-center transition-all duration-300",
                            isCollapsed ? "justify-center bg-transparent border-none" : "justify-between bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/5 p-4"
                        )}
                        role="region"
                        aria-label="User Profile"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <UserAvatar 
                                user={user as any} 
                                size={isCollapsed ? "sm" : "md"} 
                                className="border-2 border-green-500/50 shrink-0"
                            />
                            {!isCollapsed && (
                                <div className="flex flex-col overflow-hidden user-name text-left">
                                    <span className="text-[13px] font-black text-white truncate max-w-[90px] tracking-tight">
                                        {user?.name?.split(' ')[0] || 'Partner'}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full active-dot shadow-none" aria-hidden="true" />
                                        <span className="text-[8px] font-black text-[#22c55e] uppercase tracking-[0.2em]">Active</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!isCollapsed && (
                            <button 
                                onClick={() => signOut?.()}
                                className="p-2 text-white/40 transition-none hover:text-white"
                                title="Logout"
                                aria-label="Sign Out"
                            >
                                <LogOut className="w-4 h-4" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
