'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    BarChart3,
    Settings,
    LogOut,
    Bell,
    Menu,
    CreditCard,
    FileText,
    Activity,
    MessageSquare,
    Server,
    X,
    Zap,
    ChevronRight,
    Home,
    Trophy,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { ToastProvider, useToast } from '@/components/ToastProvider';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import './admin-theme.css';
import dynamic from 'next/dynamic';
import { AdminProvider, useAdmin } from '@/lib/contexts/AdminContext';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { MANAGEMENT_ROLES } from '@/lib/admin/roles';
import { cn } from '@/lib/utils';
import { fontStacks } from '@/lib/font-stacks';

// Dynamic imports for better Performance (LCP/TBT)
const AdminGlobalSearch = dynamic(() => import('@/components/admin/AdminGlobalSearch').then(mod => mod.AdminGlobalSearch), {
    ssr: false,
    loading: () => <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
});

const NotificationsDrawer = dynamic(() => import('@/components/admin/NotificationsDrawer').then(mod => mod.NotificationsDrawer), {
    ssr: false
});

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', id: 'dashboard' },
    { icon: Users, label: 'Students', href: '/admin/students', id: 'students' },
    { icon: Zap, label: 'Induction', href: '/admin/inductions', id: 'inductions' },
    { icon: GraduationCap, label: 'Teachers', href: '/admin/teachers', id: 'teachers' },
    { icon: BookOpen, label: 'Courses', href: '/admin/courses', id: 'courses' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics', id: 'analytics' },
    { icon: CreditCard, label: 'Payments', href: '/admin/payments', id: 'payments' },
    { icon: FileText, label: 'Seminars', href: '/admin/seminars', id: 'seminars' },
    { icon: Trophy, label: 'Challenges', href: '/admin/challenges', id: 'challenges' },
    { icon: Activity, label: 'Activity Feed', href: '/admin/activity', id: 'activity' },
    { icon: Server, label: 'System Health', href: '/admin/monitoring', id: 'monitoring' },
    { icon: MessageSquare, label: 'Support', href: '/admin/support', id: 'support' },
    { icon: Settings, label: 'Settings', href: '/admin/settings', id: 'settings' },
];

function NetworkStatusIndicator() {
    const [isOnline, setIsOnline] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            addToast({ message: 'Core system synchronized. Realtime_Active', type: 'success' });
        };
        const handleOffline = () => {
            setIsOnline(false);
            addToast({ message: 'Synchronous_Failure: Offline mode engaged.', type: 'error' });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [addToast]);

    return (
        <div className={cn(
            "hidden lg:flex items-center rounded-full px-4 py-2 border transition-all duration-500",
            isOnline ? "bg-[#1A3C2E]/5 border-[#1A3C2E]/10 text-[#1C2B4A]/60" : "bg-red-50 border-red-100 text-red-600"
        )}>
            <div className={cn(
                "w-1.5 h-1.5 rounded-full mr-2.5",
                isOnline ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500"
            )} />
            <span className="text-[9px] font-black tracking-[0.2em] uppercase italic">
                {isOnline ? 'System_Active' : 'Offline_Mode'}
            </span>
        </div>
    );
}

import { Suspense } from 'react';

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminProvider>
            <Suspense fallback={
                <div className="min-h-screen bg-[#F0F2F8] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#1C2B4A]/10 border-t-[#1C2B4A] rounded-full animate-spin" />
                </div>
            }>
                <AdminLayoutContent>{children}</AdminLayoutContent>
            </Suspense>
        </AdminProvider>
    );
}

// Role hierarchies are centrally imported from @/lib/admin/roles

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const { setTheme } = useTheme();
    const { primaryAction, breadcrumb, isLoading } = useAdmin();
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading: authLoading, signOut } = useAuth();
    const { addToast } = useToast();

    useKeyboardShortcuts();

    useEffect(() => {
        setMounted(true);
        setTheme('light');
    }, [setTheme]);

    // Role-based Access Control Guard (Consolidated)
    useEffect(() => {
        if (pathname === '/admin/login' || authLoading) return;
        
        if (!user) {
            router.push('/login?redirect=/admin');
            return;
        }

        const role = (user.role as string)?.toUpperCase();
        if (!MANAGEMENT_ROLES.includes(role)) {
            addToast({ message: "Security_Protocol: Elevated clearance required for nexus access.", type: 'error' });
            router.push('/');
        }
    }, [user, authLoading, pathname, router, addToast]);

    const { data: paymentsData } = useQuery({
        queryKey: ['admin-pending-payments'],
        queryFn: async () => {
            const res = await fetch('/api/admin/payments/pending-count');
            if (!res.ok) return { count: 0 };
            return res.json();
        },
        enabled: !!user && MANAGEMENT_ROLES.includes(user.role?.toUpperCase() || '')
    });

    const pendingPayments = paymentsData?.count || 0;

    if (pathname === '/admin/login') return <ToastProvider>{children}</ToastProvider>;

    if (authLoading && mounted) {
        return (
            <div
                className="min-h-screen bg-[#F0F2F8] flex flex-col items-center justify-center font-dm"
                style={{ ['--font-dm' as string]: fontStacks.adminSans }}
            >
                <div className="w-16 h-16 border-4 border-[#1C2B4A]/5 border-t-[#1C2B4A] rounded-full animate-spin shadow-inner" />
                <p className="text-[10px] font-black text-[#1C2B4A]/40 uppercase tracking-[0.4em] mt-8 italic">
                    Initializing_Secure_Kernel...
                </p>
            </div>
        );
    }

    if (!user || !MANAGEMENT_ROLES.includes(user.role?.toUpperCase() || '')) {
        return null; // Let the useEffect redirect or the fallback unauthorized view handle it
    }

    if (!mounted) return null;

    return (
        <ToastProvider>
            <div className={cn(
                "bg-[#F0F2F8] min-h-screen flex antialiased font-dm selection:bg-[#1C2B4A]/10 transition-colors duration-500",
            )}
            style={{ ['--font-dm' as string]: fontStacks.adminSans }}>
                {/* Mobile Overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#1C2B4A]/90 z-[100] backdrop-blur-md lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Mobile Menu Trigger */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden fixed bottom-10 right-10 z-[110] w-14 h-14 bg-[#1C2B4A] text-white rounded-[20px] flex items-center justify-center shadow-[0_20px_50px_rgba(28,43,74,0.3)] hover:scale-110 active:scale-95 transition-all"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* SIDEBAR ARCHITECTURE */}
                <nav className={cn(
                    "fixed top-0 left-0 h-full w-[280px] bg-[#1C2B4A] border-r border-white/5 z-[110] transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)",
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}>
                    {/* Header: Portal Brand */}
                    <div className="px-8 py-10 flex items-center justify-between">
                        <Link href="/admin" className="space-y-1">
                            <span className="text-[20px] font-black text-white italic tracking-tighter block uppercase">Admin Dashboard</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Operational_v2.4</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Stream */}
                    <div className="px-5 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] admin-scrollbar">
                        <div className="px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 mt-2 italic">Sector_Map</div>
                        {menuItems.map((item) => {
                            const isActive = item.href === '/admin'
                                ? (pathname === '/admin' || pathname === '/admin/dashboard')
                                : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "group flex items-center gap-4 px-5 py-4 rounded-[18px] text-[13px] font-black transition-all duration-500",
                                        isActive 
                                            ? "bg-white text-[#1C2B4A] shadow-[0_15px_35px_rgba(255,255,255,0.08)] scale-[1.02]" 
                                            : "text-white/40 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", isActive ? "text-[#1C2B4A]" : "opacity-40 group-hover:opacity-100 transition-opacity")} />
                                    <span className="flex-1 italic tracking-tight">{item.label}</span>
                                    {isActive && <div className="w-1 h-1 rounded-full bg-[#1C2B4A]" />}
                                    {item.id === 'payments' && pendingPayments > 0 && (
                                        <div className="w-5 h-5 bg-red-500 rounded-lg flex items-center justify-center text-[9px] text-white font-black shadow-lg shadow-red-500/20">
                                            {pendingPayments}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer: Identification */}
                    <div className="absolute bottom-10 left-5 right-5 space-y-4">
                        <div className="mx-2 p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#E2E8F4] flex items-center justify-center text-[#1C2B4A] font-black text-xs shadow-sm">
                                    {user.name?.charAt(0) || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black text-white truncate">{user.name}</p>
                                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em] truncate italic">{user.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="w-full py-3 bg-white/5 hover:bg-red-500 hover:text-white rounded-lg text-[10px] font-black text-white/40 uppercase tracking-widest transition-all italic flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-3 h-3" />
                                Termination_Sequence
                            </button>
                        </div>
                    </div>
                </nav>

                {/* MAIN_CORE_SHELL */}
                <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen overflow-hidden">
                    {/* Top Engine Header */}
                    <header className="sticky top-0 z-[50] h-16 lg:h-24 flex items-center justify-between px-4 md:px-8 lg:px-12 bg-[#F0F2F8]/80 backdrop-blur-xl border-b border-white/40">
                        {/* Left side: Hamburger on mobile, Breadcrumbs on desktop */}
                        <div className="flex-1 flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2.5 rounded-xl bg-white border border-[#E2E8F4] text-[#1C2B4A]/60 hover:text-[#1C2B4A] transition-all active:scale-90"
                                aria-label="Open sidebar"
                            >
                                <Menu className="w-4 h-4" />
                            </button>
                            
                            {/* Dynamic Breadcrumbs (Responsive Kernal) */}
                            <div className="hidden md:flex items-center gap-4">
                                <Link href="/admin" className="p-2.5 rounded-xl bg-[#1C2B4A]/5 text-[#1C2B4A] hover:bg-[#1C2B4A] hover:text-white transition-all">
                                    <Home className="w-4 h-4" />
                                </Link>
                                <ChevronRight className="w-4 h-4 text-[#1C2B4A]/20" />
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {breadcrumb ? (
                                        breadcrumb.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                {idx > 0 && <span className="text-[#1C2B4A]/20">/</span>}
                                                {item.href ? (
                                                    <Link href={item.href} className="text-[11px] font-black text-[#1C2B4A]/40 uppercase tracking-widest hover:text-[#1C2B4A] transition-colors whitespace-nowrap italic">
                                                        {item.label}
                                                    </Link>
                                                ) : (
                                                    <span className="text-[11px] font-black text-[#1C2B4A] uppercase tracking-widest italic truncate max-w-[200px]">
                                                        {item.label}
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-[12px] font-black text-[#1C2B4A] uppercase tracking-[0.2em] italic">
                                            Main Dashboard / <span className="text-[#1C2B4A]/40 underline decoration-[#1C2B4A]/20 underline-offset-8">Dashboard</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Utility Belt */}
                        <div className="flex items-center gap-4 sm:gap-6">
                            <AdminGlobalSearch />
                            <NetworkStatusIndicator />
                            <div className="hidden sm:block h-8 w-[1px] bg-[#1C2B4A]/5 mx-2" />
                            
                            {/* Alert Matrix */}
                            <button
                                onClick={() => setNotifOpen(true)}
                                className="relative p-2.5 sm:p-3 rounded-2xl bg-white border border-[#E2E8F4] text-[#1C2B4A]/40 hover:text-[#1C2B4A] hover:border-[#1C2B4A] hover:shadow-xl hover:shadow-[#1C2B4A]/5 transition-all group"
                            >
                                <Bell className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12" />
                                <span className="absolute top-2 right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-[#F0F2F8]" />
                            </button>

                            {/* Dynamic Action Protocol */}
                            {primaryAction && (
                                <button
                                    onClick={primaryAction.onClick}
                                    className="hidden sm:flex items-center gap-3 px-8 py-3.5 bg-[#1C2B4A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#1C2B4A]/20 italic"
                                >
                                    {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
                                    {primaryAction.label}
                                </button>
                            )}
                        </div>
                        <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
                    </header>

                    {/* Content Portal */}
                    <main id="main-content" className="flex-1 p-4 md:p-8 lg:p-12 w-full max-w-[1920px] mx-auto overflow-y-auto">
                        <AdminErrorBoundary>
                            {isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-60">
                                    <div className="w-12 h-12 border-4 border-[#1C2B4A]/5 border-t-[#1C2B4A] rounded-full animate-spin mb-6" />
                                    <p className="text-[10px] font-black text-[#1C2B4A] uppercase tracking-[0.5em] italic">Synthesizing_Stream...</p>
                                </div>
                            ) : children}
                        </AdminErrorBoundary>
                    </main>

                    {/* Page Loader Bar */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ width: 0 }} animate={{ width: '100%' }} exit={{ width: '100%', opacity: 0 }}
                                className="fixed top-0 left-0 h-1 bg-[#1C2B4A] z-[1000] shadow-[0_0_8px_#1C2B4A]"
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            <style jsx global>{`
                .admin-scrollbar::-webkit-scrollbar { width: 4px; }
                .admin-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .admin-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
            `}</style>
        </ToastProvider>
    );
}

