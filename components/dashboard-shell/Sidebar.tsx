'use client';

import {
    LayoutDashboard,
    BookOpen,
    Video,
    PlayCircle,
    GraduationCap,
    Award,
    Settings,
    LogOut,
    Heart
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

import { useAuth } from '@/components/AuthProvider';

const learningNavItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Learning', href: '/dashboard/courses', icon: BookOpen },
    { name: 'Certifications', href: '/dashboard/certification-exams', icon: Award },
    { name: 'Saved', href: '/dashboard/wishlist', icon: Heart },
    { name: 'Live Classes', href: '/dashboard/live', icon: Video },
    { name: 'My Badges', href: '/dashboard/certificates', icon: GraduationCap },
];

const accountNavItems = [
    { name: 'Achievements', href: '/dashboard/grades', icon: Award },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string | null;
    };
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const { signOut } = useAuth();

    return (
        <aside className="w-[250px] bg-[var(--student-sidebar-bg)] hidden lg:flex flex-col h-full fixed left-0 top-0 z-40 text-white shadow-2xl transition-all duration-300 border-r border-[#1E261E]" role="navigation" aria-label="Student dashboard navigation">
            {/* Logo Area */}
            <div className="h-auto py-10 px-6 mb-2 flex flex-col gap-1 text-left">
                <Link href="/" className="group transition-all active:scale-95 inline-block w-fit">
                    <span className="text-[18px] font-bold text-white tracking-tight group-hover:text-[#E8C5A0] transition-colors block">
                        SARTHI
                    </span>
                </Link>
                <span className="text-[10px] font-bold text-[#D4956A] uppercase tracking-[2.5px] leading-none cursor-default w-fit">
                    STUDENT PORTAL
                </span>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-8 student-scrollbar pt-2">
                {/* Learning Section */}
                <div>
                    <p className="px-3 text-[9px] font-bold text-[#8BA898] uppercase tracking-[0.14em] mb-4 opacity-80 font-outfit">Learning</p>
                    <div className="space-y-1">
                        {learningNavItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                            const Icon = item.icon;
                            return (
                                <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined}>
                                    <div className={cn(
                                        "flex items-center gap-3.5 px-[14px] py-[11px] rounded-[8px] transition-all duration-300 group relative",
                                        isActive
                                            ? "bg-[rgba(255,255,255,0.13)] text-white border-l-[3px] border-[#E8C5A0]"
                                            : "text-[#8BA898] hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
                                    )}>
                                        <Icon className={cn(
                                            "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                                            isActive ? "text-white" : "text-[#8BA898] group-hover:text-white"
                                        )} />
                                        <span className={cn(
                                            "text-[13px] font-medium tracking-wide font-nunito",
                                            isActive && "font-bold"
                                        )}>{item.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Account Section */}
                <div>
                    <p className="px-3 text-[9px] font-bold text-[#8BA898] uppercase tracking-[0.14em] mb-4 opacity-80 font-outfit">Account</p>
                    <div className="space-y-1">
                        {accountNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined}>
                                    <div className={cn(
                                        "flex items-center gap-3.5 px-[14px] py-[11px] rounded-[8px] transition-all duration-300 group relative",
                                        isActive
                                            ? "bg-[rgba(255,255,255,0.13)] text-white border-l-[3px] border-[#D4956A]"
                                            : "text-[#8BA898] hover:bg-[rgba(255,255,255,0.06)] hover:text-white"
                                    )}>
                                        <Icon className={cn(
                                            "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                                            isActive ? "text-white" : "text-[#8BA898] group-hover:text-white"
                                        )} />
                                        <span className={cn(
                                            "text-[13px] font-medium tracking-wide font-nunito",
                                            isActive && "font-bold"
                                        )}>{item.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="p-4 mx-4 border-t border-[rgba(255,255,255,0.05)] mt-auto mb-4">
                <button
                    onClick={() => signOut()}
                    aria-label="Sign out"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#8BA898] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all text-[12px] font-bold uppercase tracking-wider group"
                >
                    <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

