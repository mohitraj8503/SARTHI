'use client';

import {
    LayoutDashboard,
    Users,
    FolderKanban,
    CheckCircle2,
    BookOpen,
    MessageSquare,
    Calendar,
    BarChart2,
    Activity,
    LogOut,
    ChevronRight,
    X,
    Settings,
    Menu,
    Mail,
    FileText
} from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';
import UserAvatar from '@/components/ui/UserAvatar';
import { useMentorTheme } from '@/components/mentor/MentorThemeContext';

const navItems = [
    { name: 'Command Center', href: '/mentor/dashboard', tab: 'dashboard', icon: LayoutDashboard },
    { name: 'My Interns', href: '/mentor/dashboard?tab=interns', tab: 'interns', icon: Users },
    { name: 'Submissions', href: '/mentor/dashboard?tab=submissions', tab: 'submissions', icon: FolderKanban },
    { name: 'Assignments', href: '/mentor/dashboard?tab=assignments', tab: 'assignments', icon: CheckCircle2 },
    { name: 'Review', href: '/mentor/dashboard?tab=review', tab: 'review', icon: BookOpen },
    { name: 'Email Portal', href: '/mentor/dashboard?tab=email', tab: 'email', icon: Mail },
    { name: 'Discussions', href: '/mentor/dashboard?tab=discussions', tab: 'discussions', icon: MessageSquare },
    { name: 'Audit Logs', href: '/mentor/dashboard?tab=logs', tab: 'logs', icon: Activity },
    { name: 'Settings', href: '/mentor/dashboard?tab=settings', tab: 'settings', icon: Settings },
];

export default function MentorSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'dashboard';
    const { signOut, user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { isDark, toggleDark } = useMentorTheme();

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
            {/* Hamburger Menu Button for Mobile */}
            <button 
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed left-4 top-4 z-[110] p-2.5 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white rounded-xl shadow-lg border border-white/10 lg:hidden hover:scale-105 active:scale-95 transition-all"
                aria-label="Toggle Menu"
            >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Dark Blur Overlay for Mobile when Sidebar is open */}
            {isMobileOpen && (
                <div 
                    onClick={() => setIsMobileOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden transition-all duration-300"
                />
            )}

            <aside 
                className={cn(
                    "bg-[rgba(10,30,15,0.60)] backdrop-blur-[32px] -webkit-backdrop-blur-[32px] flex flex-col h-full fixed left-0 top-0 z-[101] text-white border-r border-white/8 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    // Responsiveness translations and sizing
                    isMobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full lg:translate-x-0",
                    isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]",
                    "w-[260px]"
                )}
                role="complementary"
                aria-label="Mentor Sidebar"
            >
                {/* Subtle premium noise layer */}
                <div 
                    className="absolute inset-0 pointer-events-none z-[-1]" 
                    style={{ 
                        backgroundImage: 'url(/noise.png)', 
                        opacity: 0.015,
                        mixBlendMode: 'overlay'
                    }} 
                />

                {/* Collapse Toggle Button (Desktop Only) */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/18 shadow-none z-[102] hover:bg-white/20 transition-all hidden lg:flex"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <ChevronRight className={cn("w-4 h-4 text-white transition-transform duration-300", isCollapsed ? "rotate-0" : "rotate-180")} />
                </button>

            {/* Logo Area */}
            <div className={cn(
                "flex items-center border-b border-[rgba(255,255,255,0.05)] mb-2 transition-all duration-300",
                isCollapsed ? "px-0 justify-center pt-20 lg:pt-8 pb-4" : "px-6 justify-between pt-20 lg:pt-11 pb-5"
            )}>
                <Link 
                    href="/" 
                    className={cn("flex items-center transition-none", isCollapsed ? "justify-center" : "gap-3")} 
                    aria-label="SARTHI Home" 
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
                            <span className="text-[9px] font-black text-[#22C55E] uppercase tracking-[0.15em] leading-none mt-1.5 block">
                                MENTOR PORTAL
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 pt-10 pb-4 space-y-1.5 overflow-y-auto custom-scrollbar" aria-label="Main Navigation">
                {navItems.map((item) => {
                    const isActive = currentTab === item.tab;
                    const Icon = item.icon;

                    return (
                        <Link 
                            key={item.name} 
                            href={item.href}
                            onClick={(e) => {
                                setIsMobileOpen(false);
                                // Instantly switch tab client-side for immediate visual response
                                e.preventDefault();
                                const params = new URLSearchParams();
                                if (item.tab !== 'dashboard') {
                                    params.set('tab', item.tab);
                                }
                                const url = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
                                window.history.pushState({}, '', url);
                                
                                // Dispatch custom event or route state updater event if needed (NextJS searchParams listener handles this)
                                const navEvent = new PopStateEvent('popstate');
                                window.dispatchEvent(navEvent);
                            }}
                        >
                            <div 
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 transition-none group relative",
                                    isCollapsed ? "justify-center px-0" : "rounded-[10px]",
                                    isActive
                                        ? isCollapsed 
                                            ? "text-[#4ade80]" 
                                            : "bg-green-500/12 text-[#4ade80] border-l-4 border-l-[#22c55e] rounded-l-none rounded-r-[10px]"
                                        : "text-white/65 rounded-[10px]"
                                )}
                            >
                                <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive ? "text-[#4ade80]" : "text-white/40")} />
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
            </nav>

            {/* Profile Footer */}
            <div className={cn("p-3 mt-auto border-t border-white/8", isCollapsed && "px-2")}>

                {/* Day / Night Toggle — shown only when expanded */}
                {!isCollapsed && (
                    <div className="flex items-center justify-between px-1 mb-3">
                        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                            {isDark ? 'Dark' : 'Light'}
                        </span>

                        {/* Toggle pill — scaled down (approx 0.62x) recreation of Webflow Button 29 */}
                        <button
                            onClick={toggleDark}
                            aria-label="Toggle dark mode"
                            className="relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 overflow-hidden"
                            style={{
                                width: 72,
                                height: 32,
                                borderRadius: 16,
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background 0.8s cubic-bezier(0.4,0,0.2,1)',
                                background: isDark
                                    ? 'linear-gradient(180deg,#080818 0%,#0d1025 55%,#080818 100%)'
                                    : 'linear-gradient(180deg,#87CEEB 0%,#5BAEE8 45%,#4DA0E0 100%)',
                            }}
                        >
                            {/* ── STARS (dark mode) ── */}
                            {([
                                {t:6,  l:9, s:1.5, o:0.9},
                                {t:14, l:15, s:1,   o:0.7},
                                {t:4,  l:24, s:1.3, o:0.8},
                                {t:11, l:31, s:0.8, o:0.6},
                                {t:20, l:11, s:1,   o:0.7},
                                {t:24, l:21, s:1.3, o:0.5},
                                {t:17, l:5,  s:1,   o:0.6},
                                {t:26, l:30, s:1,   o:0.7},
                                {t:8,  l:38, s:0.8, o:0.4},
                            ] as {t:number;l:number;s:number;o:number}[]).map((star, i) => (
                                <span key={i} style={{
                                    position:'absolute', top:star.t, left:star.l,
                                    width:star.s, height:star.s,
                                    borderRadius:'50%', background:'white',
                                    opacity: isDark ? star.o : 0,
                                    transition:'opacity 0.5s ease',
                                    pointerEvents:'none'
                                }} />
                            ))}

                            {/* ── CLOUDS (light mode) ── */}
                            <div style={{
                                position:'absolute', bottom:6, left:5,
                                opacity: isDark ? 0 : 1,
                                transform: `translateX(${isDark ? -12 : 0}px)`,
                                transition:'opacity 0.5s ease, transform 0.7s cubic-bezier(0.4,0,0.2,1)',
                                pointerEvents:'none',
                            }}>
                                <div style={{width:27,height:9,borderRadius:6,background:'rgba(255,255,255,0.92)',boxShadow:'0 2px 8px rgba(255,255,255,0.6)'}} />
                                <div style={{width:19,height:6,borderRadius:5,background:'rgba(255,255,255,0.75)',marginTop:2,marginLeft:3}} />
                            </div>

                            {/* ── SUN ── */}
                            <div style={{
                                position:'absolute', top:2,
                                left: isDark ? -35 : 2,
                                width:28, height:28,
                                borderRadius:'50%',
                                background:'radial-gradient(circle at 42% 40%, #FFE566 0%, #FFD000 55%, #F5A800 100%)',
                                boxShadow: isDark ? 'none' : '0 0 10px rgba(255,210,0,0.85), 0 0 22px rgba(255,185,0,0.5), 0 0 38px rgba(255,160,0,0.25)',
                                transition:'left 0.65s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease',
                                zIndex:3,
                            }} />

                            {/* ── MOON ── */}
                            <div style={{
                                position:'absolute', top:2,
                                right: isDark ? 2 : -35,
                                width:28, height:28,
                                borderRadius:'50%',
                                background:'radial-gradient(circle at 40% 40%, #d1d9e0 0%, #a8b3be 55%, #8a96a8 100%)',
                                boxShadow: isDark
                                    ? '-6px -3px 0 0 #0d1025, 0 0 5px rgba(0,0,0,0.6)'
                                    : 'none',
                                transition:'right 0.65s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.5s ease 0.1s',
                                zIndex:3,
                            }}>
                                {/* Craters */}
                                <div style={{position:'absolute',top:6,left:5,width:5,height:5,borderRadius:'50%',background:'rgba(110,125,145,0.55)',opacity: isDark ? 1 : 0,transition:'opacity 0.3s ease'}} />
                                <div style={{position:'absolute',bottom:6,right:6,width:3,height:3,borderRadius:'50%',background:'rgba(110,125,145,0.45)',opacity: isDark ? 1 : 0,transition:'opacity 0.3s ease'}} />
                                <div style={{position:'absolute',top:15,left:11,width:2,height:2,borderRadius:'50%',background:'rgba(110,125,145,0.35)',opacity: isDark ? 1 : 0,transition:'opacity 0.3s ease'}} />
                            </div>
                        </button>
                    </div>
                )}

                {/* Profile card */}
                <div
                    className={cn(
                        "flex items-center transition-all duration-300",
                        isCollapsed
                            ? "justify-center bg-transparent border-none"
                            : "justify-between bg-white/[0.06] rounded-[20px] border border-white/10 p-3"
                    )}
                    role="region"
                    aria-label="User Profile"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <UserAvatar
                            user={user as any}
                            size={isCollapsed ? "sm" : "md"}
                            className="border-2 border-white/20 shrink-0 ring-0"
                        />
                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-[13px] font-bold text-white truncate max-w-[95px] tracking-tight leading-tight">
                                    {user?.name?.split(' ')[0] || 'Mentor'}
                                </span>
                                <span className="text-[10px] text-white/35 font-medium truncate max-w-[95px]">
                                    Mentor Portal
                                </span>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button
                            onClick={() => signOut?.()}
                            className="p-2 text-white/30 hover:text-white/60 transition-colors"
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
