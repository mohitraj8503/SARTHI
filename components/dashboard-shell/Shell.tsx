'use client';

import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { TopNav } from './TopNav';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Heart, 
  Video, 
  Award, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

import { BottomNav } from './BottomNav';

interface ShellProps {
    children: ReactNode;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function Shell({ children, user }: ShellProps) {
    const { signOut } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-[var(--student-page-bg)] text-[var(--student-ink)] font-nunito selection:bg-[#E8C5A0]/30 overflow-visible transition-colors duration-500">
            {/* Skip Link for Keyboard Navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
                Skip to main content
            </a>

            {/* Live Region for Dynamic Content Announcements */}
            <div 
                aria-live="polite" 
                aria-atomic="true" 
                className="sr-only" 
                id="student-live-region"
            />

            {/* Subtle Texture Overlay - Lazy loaded */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/pinstripe-light.png')] mix-blend-multiply" />

            <Sidebar user={user} />

            {/* Main Content Area - Updated to 250px Margin */}
            <div className="lg:pl-[250px] flex flex-col min-h-screen transition-all duration-300 ease-in-out">
                <TopNav onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

                <main 
                    id="main-content"
                    role="main"
                    className={cn(
                        "flex-1 w-full relative z-10",
                        pathname === '/dashboard/messages' ? "h-[calc(100vh-80px)]" : "p-4 md:p-8 pt-6 w-full pb-28 lg:pb-8"
                    )}>
                    {/* Removed AnimatePresence for faster LCP */}
                    <div className="h-full">
                        {children}
                    </div>
                </main>

                <BottomNav />

                {pathname !== '/dashboard/messages' && (
                    <footer className="py-10 px-8 text-center text-[11px] text-[#5D705C] opacity-80 font-nunito uppercase tracking-widest font-bold mb-16 lg:mb-0">
                        <p>© 2026 SARTHI · Crafted for growth</p>
                    </footer>
                )}
            </div>

            {/* Mobile Sidebar Overlay & Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-[#0C110C]/80 backdrop-blur-md z-[150] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(e, { offset, velocity }) => {
                                if (offset.x < -100 || velocity.x < -500) {
                                    setIsSidebarOpen(false);
                                }
                            }}
                            className="fixed left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-[#1B4332] z-[160] lg:hidden flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="p-8 flex items-center justify-between border-b border-white/5">
                                <Link href="/" className="flex flex-col group transition-all active:scale-95">
                                    <span className="text-xl font-black text-white tracking-tighter italic group-hover:text-[#E8C5A0] transition-colors">SARTHI</span>
                                    <span className="text-[9px] font-black text-[#D4915C] uppercase tracking-[0.3em]">Portal</span>
                                </Link>
                                <button 
                                    onClick={() => setIsSidebarOpen(false)} 
                                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 active:bg-white/10 active:scale-95 transition-all"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Drawer Navigation */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                                <div className="space-y-3">
                                    <h3 className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 italic">Learning Hub</h3>
                                    <div className="grid gap-2">
                                        {[
                                            { name: 'Home', href: '/dashboard', icon: Home },
                                            { name: 'My Learning', href: '/dashboard/courses', icon: BookOpen },
                                            { name: 'Saved', href: '/dashboard/wishlist', icon: Heart },
                                            { name: 'Live Classes', href: '/dashboard/live', icon: Video },
                                            { name: 'My Badges', href: '/dashboard/certificates', icon: Award },
                                            { name: 'Settings', href: '/dashboard/settings', icon: Settings },
                                        ].map((item) => (
                                            <Link 
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-4 h-[56px] px-5 rounded-2xl transition-all active:scale-[0.98]",
                                                    pathname === item.href 
                                                        ? "bg-white text-[#1B4332] font-black italic shadow-xl" 
                                                        : "text-white/40 hover:bg-white/5"
                                                )}
                                            >
                                                <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-[#1B4332]" : "text-white/20")} />
                                                <span className="text-[14px] uppercase tracking-wide">{item.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-8 border-t border-white/5">
                                <button 
                                    onClick={() => signOut()}
                                    className="w-full h-[56px] rounded-2xl bg-red-500/10 text-red-400 font-black text-[11px] uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 active:bg-red-500 active:text-white transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    End Session
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

