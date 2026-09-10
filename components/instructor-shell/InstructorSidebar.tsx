'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    LayoutGrid,
    BookOpen,
    Users,
    BarChart2,
    DollarSign,
    Settings,
    LogOut,
    ChevronRight,
    Zap,
    GraduationCap,
    Home,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const mainNav = [
    { name: 'Dashboard', href: '/instructor/dashboard', icon: LayoutGrid },
    { name: 'My Courses', href: '/instructor/courses', icon: BookOpen },
    { name: 'Students', href: '/instructor/students', icon: Users },
    { name: 'Analytics', href: '/instructor/analytics', icon: BarChart2 },
    { name: 'Earnings', href: '/instructor/earnings', icon: DollarSign },
    { name: 'Settings', href: '/instructor/settings', icon: Settings },
];

export function InstructorSidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar-bg border-r border-sidebar-border z-30 hidden lg:flex flex-col backdrop-blur-xl bg-opacity-80">
            {/* Brand Header */}
            <div className="h-20 flex items-center px-8">
                <Link href="/" className="flex items-center gap-3 font-bold text-foreground group transition-all active:scale-95">
                    <div className="w-10 h-10 relative flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <span className="text-xl font-black text-indigo-600">TT</span>
                    </div>
                    <span className="tracking-tight text-xl group-hover:text-indigo-600 transition-colors">SARTHI</span>
                </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
                {mainNav.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/instructor/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center gap-4 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300",
                                isActive
                                    ? "text-indigo-600 bg-white shadow-soft-blue"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="instructor-sidebar-active"
                                    className="absolute left-0 w-1.5 h-8 bg-indigo-600 rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                            <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-indigo-600" : "text-muted-foreground group-hover:text-foreground")} />
                            {item.name}
                        </Link>
                    );
                })}
                </div>

            {/* User Footer - with distinct instructor styling if needed (e.g. "Instructor Mode") */}
            <div className="p-6 border-t border-sidebar-border/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-md uppercase">
                        {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : (user?.role?.substring(0, 2) || 'IN')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Instructor'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || 'Instructor Account'}</p>
                    </div>
                </div>

                <button 
                    onClick={() => signOut()}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all group"
                >
                    <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}

