'use client';

import { ReactNode, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { cn } from '@/lib/utils';
import { fontStacks } from '@/lib/font-stacks';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  FileText,
  BarChart3,
  Video,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  Mail
} from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider, useToast } from '@/components/ToastProvider';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import '@/app/(dashboard)/teacher/teacher-theme.css';
import { MANAGEMENT_ROLES } from '@/lib/admin/roles';
import dynamic from 'next/dynamic';
import { AdminProvider, useAdmin } from '@/lib/contexts/AdminContext';

// Dynamic Notifications
const NotificationBell = dynamic(() => import('@/components/teacher/NotificationBell'), { ssr: false });

const teacherMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher/dashboard', id: 'dashboard' },
  { icon: BookOpen, label: 'Course Studio', href: '/teacher/courses', id: 'courses' },
  { icon: Users, label: 'Student Portal', href: '/teacher/students', id: 'students' },
  { icon: Mail, label: 'Email Portal', href: '/teacher/community/email', id: 'email-broadcast' },
  { icon: FileText, label: 'Assessments', href: '/teacher/assignments', id: 'assignments' },
  { icon: Video, label: 'Video Vault', href: '/teacher/videos', id: 'videos' },
  { icon: Calendar, label: 'Seminars', href: '/teacher/seminars', id: 'seminars' },
  { icon: BarChart3, label: 'Analytics', href: '/teacher/analytics', id: 'analytics' },
  { icon: Settings, label: 'Settings', href: '/teacher/settings', id: 'settings' },
];

export function TeacherDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <ToastProvider>
        <Suspense fallback={<div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center animate-pulse" />}>
          <TeacherLayoutContent>{children}</TeacherLayoutContent>
        </Suspense>
      </ToastProvider>
    </AdminProvider>
  );
}

function TeacherLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setTheme } = useTheme();
  const { addToast } = useToast();
  const { breadcrumb, primaryAction } = useAdmin();

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  // Integrated Management-Gate (Security Protocol)
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(pathname));
      return;
    }

    const role = (user.role as string)?.toUpperCase();
    if (!MANAGEMENT_ROLES.includes(role)) {
      addToast({ message: "Management_Gate: Elevated instructor clearance required.", type: 'error' });
      router.push('/');
    }
  }, [user, authLoading, pathname, router, addToast]);

  const { data: dashboardData } = useQuery({
    queryKey: ['teacher-pulse-summary'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/dashboard');
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user && MANAGEMENT_ROLES.includes(user.role?.toUpperCase() || ''),
    staleTime: 60000 // 1 minute
  });

  const activeLearners = dashboardData?.pulse?.activeLearners || 0;

  if (authLoading) {
    return (
      <div
        className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center"
        style={{ ['--font-dm' as string]: fontStacks.adminSans }}
      >
        <div className="w-16 h-16 border-4 border-[#1A3C2E]/5 border-t-[#1A3C2E] rounded-full animate-spin shadow-inner" />
        <p className="text-[10px] font-black text-[#1A3C2E]/40 uppercase tracking-[0.3em] mt-8 italic">Synchronizing_Instructor_Protocol...</p>
      </div>
    );
  }

  if (!user || !MANAGEMENT_ROLES.includes(user.role?.toUpperCase() || '')) {
    return null; 
  }

  return (
    <ToastProvider>
      <div className={cn(
        "min-h-screen bg-[#FDFCFB] text-[#1A3C2E] flex antialiased selection:bg-[#1A3C2E]/10 transition-all duration-300",
      )}
      style={{ ['--font-dm' as string]: fontStacks.adminSans }}>
        {/* Mobile Overlay */}
        <AnimatePresence>
            {sidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-[#1A3C2E]/80 z-[100] backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </AnimatePresence>

        {/* Mobile Trigger */}
        <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed bottom-8 right-8 z-[110] w-14 h-14 bg-[#1A3C2E] text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
        >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* 🌿 INSTRUCTOR STUDIO SIDEBAR */}
        <nav className={cn(
            "fixed top-0 left-0 h-full w-[280px] bg-[#1A3C2E] border-r border-[#1A3C2E]/5 z-[110] transition-transform duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)",
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
            <div className="px-10 py-12 flex flex-col h-full">
                {/* Brand Identity */}
                <Link href="/teacher/dashboard" className="mb-14 group">
                    <span
                      className="text-[26px] font-bold text-white italic tracking-tighter block leading-none hover:text-[#E8B84B] transition-colors"
                      style={{ fontFamily: fontStacks.teacherSerif }}
                    >
                        SARTHI
                    </span>
                    <span className="text-[9px] font-black text-[#E8B84B] uppercase tracking-[0.25em] mt-2 block opacity-80">Teacher_Studio_v2</span>
                </Link>

                {/* Nav Stream */}
                <div className="flex-1 space-y-1.5 overflow-y-auto pr-2 scrollbar-hide">
                    {teacherMenuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-[18px] text-[13px] font-black transition-all duration-500 group",
                                    isActive 
                                        ? "bg-white text-[#1A3C2E] shadow-[0_15px_35px_rgba(0,0,0,0.1)] scale-[1.03]" 
                                        : "text-white/40 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn("w-4.5 h-4.5", isActive ? "text-[#1A3C2E]" : "opacity-40 group-hover:opacity-100")} />
                                <span className={cn("flex-1 italic tracking-tight", isActive ? "font-black" : "font-medium")}>{item.label}</span>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#1A3C2E]" />}
                            </Link>
                        );
                    })}
                </div>

                {/* Account Sentinel */}
                <div className="mt-10 pt-8 border-t border-white/5">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#E8B84B]/20 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white border border-white/10 flex items-center justify-center text-[#1A3C2E] font-black text-xs shadow-inner">
                                {user.name?.charAt(0) || 'T'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-white truncate">{user.name}</p>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.1em] truncate italic">{user.role}</p>
                            </div>
                        </div>
                        <button onClick={() => signOut()} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        {/* 🏙️ CORE CONTENT NEXUS */}
        <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen overflow-hidden">
            {/* Engine Header */}
            <header className="sticky top-0 z-[50] h-24 flex items-center px-8 lg:px-14 bg-white/80 backdrop-blur-xl border-b border-[#1A3C2E]/5">
                {/* Dynamic Navigation Path */}
                <div className="flex-1 hidden md:flex items-center gap-4">
                    <Link href="/teacher/dashboard" className="p-2.5 rounded-xl bg-[#1A3C2E]/5 text-[#1A3C2E] hover:bg-[#1A3C2E] hover:text-white transition-all shadow-sm">
                        <Home className="w-4 h-4" />
                    </Link>
                    <ChevronRight className="w-4 h-4 text-[#1A3C2E]/20" />
                    <div className="flex items-center gap-2">
                        {breadcrumb ? (
                            breadcrumb.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    {idx > 0 && <span className="text-[#1A3C2E]/20">/</span>}
                                    {item.href ? (
                                        <Link href={item.href} className="text-[11px] font-black text-[#1A3C2E]/40 uppercase tracking-widest hover:text-[#1A3C2E] transition-colors italic whitespace-nowrap">
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span className="text-[11px] font-black text-[#1A3C2E] uppercase tracking-widest italic truncate max-w-[250px]">
                                            {item.label}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <span className="text-[12px] font-black text-[#1A3C2E] uppercase tracking-[0.2em] italic">
                                Instructor_Hub / <span className="text-[#1A3C2E]/40 underline decoration-[#1A3C2E]/20 underline-offset-8 decoration-2">Overview</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Signal Belt */}
                <div className="flex items-center gap-6">
                    {/* Live Pulse Indicator */}
                    <div className="hidden sm:flex items-center bg-[#E8F5EE] border border-emerald-100 rounded-full px-5 py-2 group cursor-pointer hover:bg-emerald-50 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        <span className="text-[10px] font-black text-emerald-800 tracking-[0.15em] uppercase italic group-hover:scale-105 transition-transform">
                            {activeLearners} Active_Syncs
                        </span>
                    </div>

                    <div className="h-8 w-[1px] bg-[#1A3C2E]/5 mx-2" />

                    <NotificationBell />

                    <button 
                        className="p-3 rounded-2xl bg-white border border-[#E8E2D9] text-[#1A3C2E]/40 hover:text-[#1A3C2E] hover:border-[#1A3C2E] hover:shadow-xl transition-all shadow-sm group"
                        aria-label="Studio Setup Docs"
                    >
                        <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>

                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            className="hidden sm:flex items-center gap-3 px-8 py-4 bg-[#1A3C2E] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#1A3C2E]/10 italic"
                        >
                            {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
                            {primaryAction.label}
                        </button>
                    )}
                </div>
            </header>

            {/* Content Flux */}
            <main id="main-content" className="flex-1 p-8 lg:p-14 overflow-y-auto">
                <AdminErrorBoundary>
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        {children}
                    </div>
                </AdminErrorBoundary>
            </main>
        </div>
      </div>

      {/* Global CSS Inject */}
      <style jsx global>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(26, 60, 46, 0.05); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(26, 60, 46, 0.1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </ToastProvider>
  );
}

