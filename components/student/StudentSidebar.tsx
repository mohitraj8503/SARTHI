'use client';

import {
    LayoutDashboard,
    BookOpen,
    Settings,
    LogOut,
    Search,
    ChevronDown,
    ChevronRight,
    Award,
    Calendar,
    Newspaper,
    CheckCircle2,
    FolderKanban,
    Info,
    MessageSquare,
    Users,
    X,
    Menu
} from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';
import UserAvatar from '@/components/ui/UserAvatar';
import { useSidebarStore } from '@/hooks/use-sidebar-store';

interface SidebarProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        avatar_url?: string | null;
        avatar_version?: number | null;
        role?: string | null;
        studentId?: string | null;
    };
}

export default function StudentSidebar({ user: propUser }: { user?: SidebarProps['user'] }) {
    const pathname = usePathname();
    const { signOut, user: authUser } = useAuth();
    const user = authUser || propUser;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { isOpen, close } = useSidebarStore();
    const [searchQuery, setSearchQuery] = useState('');

    const isMain = (user as any)?.platformSegment === 'MAIN';

    const coreNav = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
    ];

    const learningNav = [
        { name: 'Live Classes', href: '/dashboard/live', icon: Calendar },
        { name: 'Assignments', href: '/dashboard/assignments', icon: CheckCircle2 },
        ...(isMain ? [{ name: 'Internship', href: '/dashboard/internship', icon: FolderKanban }] : []),
        { name: 'Achievements', href: '/dashboard/grades', icon: Award },
    ];

    const communityNav = [
        { name: 'Community Chat', href: '/dashboard/messages', icon: MessageSquare },
        { name: 'Articles & Blogs', href: '/dashboard/blogs', icon: Newspaper },
        ...(isMain ? [{ name: 'Ambassador', href: '/dashboard/ambassador', icon: Users }] : []),
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    // Sync sidebar width with layout via CSS variable
    React.useEffect(() => {
        const updateWidth = () => {
            if (window.innerWidth < 1024) {
                document.documentElement.style.setProperty('--sidebar-width', '0px');
            } else {
                const width = isCollapsed ? '72px' : '280px';
                document.documentElement.style.setProperty('--sidebar-width', width);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [isCollapsed]);

    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST';

    const rawSearchItems = [
        { title: 'Overview Dashboard', category: 'Navigation', href: '/dashboard', icon: LayoutDashboard, keywords: 'overview home telemetry metrics vision stats' },
        { title: 'My Enrolled Courses', category: 'Navigation', href: '/dashboard/courses', icon: BookOpen, keywords: 'courses learning catalog video modules lessons library' },
        { title: 'Live Classes & Broadcasts', category: 'Navigation', href: '/dashboard/live', icon: Calendar, keywords: 'live classes schedule broadcast studio instructor session meeting zoom' },
        { title: 'Assignments & Missions', category: 'Navigation', href: '/dashboard/assignments', icon: CheckCircle2, keywords: 'assignments tasks missions homework submissions deadlines due' },
        { title: 'Internship Workspace', category: 'Navigation', href: '/dashboard/internship', icon: FolderKanban, keywords: 'internship scholar portal checkin tasks mentor offer letter' },
        { title: 'Achievements & XP Ranks', category: 'Navigation', href: '/dashboard/grades', icon: Award, keywords: 'achievements grades xp level streak badges certificate rewards' },
        { title: 'Community Chat & Faculty', category: 'Navigation', href: '/dashboard/messages', icon: MessageSquare, keywords: 'community chat messages faculty mentor support discussion' },
        { title: 'Articles & Blogs Studio', category: 'Navigation', href: '/dashboard/blogs', icon: Newspaper, keywords: 'articles blogs posts writing publications author' },
        { title: 'Student Ambassador Drive', category: 'Navigation', href: '/dashboard/ambassador', icon: Users, keywords: 'ambassador campus referral code drive rewards share' },
        { title: 'Account Settings & Profile', category: 'Navigation', href: '/dashboard/settings', icon: Settings, keywords: 'settings account profile password security academic college' },
        { title: 'AI & Deep Learning for NWP', category: 'Course', href: '/courses/ai-ml-numerical-weather-prediction', icon: BookOpen, keywords: 'nwp weather numerical ai machine learning pinns imd' },
        { title: 'Doppler Weather Radar (DWR) Operations', category: 'Course', href: '/courses/doppler-weather-radar-nowcasting', icon: BookOpen, keywords: 'radar doppler nowcasting reflectivity dwr' },
        { title: 'Satellite Meteorology: INSAT-3D/3DR', category: 'Course', href: '/courses/satellite-meteorology-insat-3d', icon: BookOpen, keywords: 'satellite insat imagery multispectral sounder' },
        { title: 'Join Today\'s Live Class', category: 'Action', href: '/dashboard/live', icon: Calendar, keywords: 'join live now live class' },
        { title: 'Submit Outstanding Assignment', category: 'Action', href: '/dashboard/assignments', icon: CheckCircle2, keywords: 'submit task assignment' },
        { title: 'Claim Daily Check-in XP', category: 'Action', href: '/dashboard/internship', icon: Award, keywords: 'checkin xp reward' },
    ];

    const searchItems = !isMain 
        ? rawSearchItems.filter(item => item.href !== '/dashboard/internship' && item.href !== '/dashboard/ambassador')
        : rawSearchItems;

    const filteredSearchResults = searchQuery.trim() === '' ? [] : searchItems.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            item.title.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.keywords.toLowerCase().includes(query)
        );
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] lg:hidden transition-opacity duration-300"
                    onClick={close}
                    aria-hidden="true"
                />
            )}

            <aside 
                className={cn(
                    "w-[280px] bg-[#1B4332] flex flex-col h-full fixed left-0 top-0 z-[130] text-white transition-all duration-300 ease-in-out border-r border-white/5",
                    isCollapsed ? "lg:w-[72px]" : "lg:w-[280px]",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
                role="navigation"
                aria-label="Student Navigation"
            >
                {/* Desktop Collapse Toggle */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-10 w-6 h-6 bg-[#1B4332] rounded-full flex items-center justify-center border border-white/20 shadow-md z-[140] hover:bg-[#2D6A4F] transition-all hidden lg:flex text-white"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-300", isCollapsed ? "rotate-0" : "rotate-180")} />
                </button>

                {/* Logo Area */}
                <div className={cn(
                    "py-10 transition-all duration-300 flex items-center",
                    isCollapsed ? "px-4 justify-center" : "px-8 justify-between"
                )}>
                    <Link href="/" className="group flex items-center gap-3 transition-transform active:scale-95" onClick={close}>
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg shrink-0">
                            <Image src="/sarthi-logo.png" alt="TT" width={28} height={28} className="w-full h-full object-contain" />
                        </div>
                        {!isCollapsed && (
                            <div>
                                <span className="text-xl font-black text-white tracking-tight block leading-tight">
                                    SARTHI
                                </span>
                                <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] leading-none mt-1 block">
                                    STUDENT PORTAL
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Mobile Close Button */}
                    <button onClick={close} className="lg:hidden p-2 text-white/70 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Sidebar Search */}
                {!isCollapsed && (
                    <div className="px-6 mb-8 relative">
                        <div className="relative group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input 
                                type="text" 
                                placeholder="Search workspace..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/10 border border-white/15 focus:border-emerald-400 rounded-xl pl-11 pr-8 py-3 text-sm font-semibold text-white placeholder:text-white/40 focus:outline-none transition-all font-sans"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Instant Search Suggestions Popover */}
                        {searchQuery.trim().length > 0 && (
                            <div className="absolute left-6 right-6 top-full mt-2 z-[250] bg-[#143D2B] border border-emerald-500/30 rounded-2xl p-2 shadow-2xl backdrop-blur-xl max-h-[380px] overflow-y-auto space-y-1 custom-scrollbar">
                                {filteredSearchResults.length > 0 ? (
                                    filteredSearchResults.map((item, idx) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <Link
                                                key={item.title + idx}
                                                href={item.href}
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    close();
                                                }}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-800/50 transition-all text-left group/item border border-transparent hover:border-emerald-500/20"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all shrink-0">
                                                    <ItemIcon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-white tracking-tight line-clamp-1 group-hover/item:text-emerald-300 transition-colors">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-[9px] font-black text-emerald-400/80 uppercase tracking-widest">
                                                        {item.category}
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover/item:text-white group-hover/item:translate-x-0.5 transition-all" />
                                            </Link>
                                        );
                                    })
                                ) : (
                                    <div className="py-6 px-4 text-center space-y-1">
                                        <p className="text-xs font-bold text-white/80">No results for &quot;{searchQuery}&quot;</p>
                                        <p className="text-[10px] text-white/40 font-medium">Try &quot;courses&quot;, &quot;live&quot;, &quot;assignments&quot;, or &quot;settings&quot;</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar" aria-label="Main Navigation">
                    {/* Core Section */}
                    <div>
                        {!isCollapsed && (
                            <h2 className="px-4 text-xs font-black text-emerald-400/80 uppercase tracking-widest mb-4">
                                Core Control
                            </h2>
                        )}
                        <div className="space-y-1">
                            {coreNav.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={item.href} href={item.href} onClick={close}>
                                        <div className={cn(
                                            "flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative",
                                            isCollapsed && "justify-center px-0",
                                            isActive
                                                ? "bg-[#2D6A4F] text-white font-bold"
                                                : "text-white/70 hover:bg-white/5 hover:text-white font-bold"
                                        )}>
                                            {isActive && (
                                                <div className="absolute left-0 w-1.5 h-6 bg-emerald-400 rounded-r-full" />
                                            )}
                                            <item.icon className={cn(
                                                "w-5 h-5 transition-colors shrink-0",
                                                isActive ? "text-emerald-400" : "text-white/50 group-hover:text-white"
                                            )} />
                                            {!isCollapsed && <span className="text-base font-bold">{item.name}</span>}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Learning Section */}
                    <div>
                        {!isCollapsed && (
                            <h2 className="px-4 text-xs font-black text-emerald-400/80 uppercase tracking-widest mb-4">
                                Learning & Tracks
                            </h2>
                        )}
                        <div className="space-y-1">
                            {learningNav.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                return (
                                    <Link key={item.href} href={item.href} onClick={close}>
                                        <div className={cn(
                                            "flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative",
                                            isCollapsed && "justify-center px-0",
                                            isActive
                                                ? "bg-[#2D6A4F] text-white font-bold"
                                                : "text-white/70 hover:bg-white/5 hover:text-white font-bold"
                                        )}>
                                            {isActive && (
                                                <div className="absolute left-0 w-1.5 h-6 bg-emerald-400 rounded-r-full" />
                                            )}
                                            <item.icon className={cn(
                                                "w-5 h-5 transition-colors shrink-0",
                                                isActive ? "text-emerald-400" : "text-white/50 group-hover:text-white"
                                            )} />
                                            {!isCollapsed && <span className="text-base font-bold">{item.name}</span>}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Community Section */}
                    <div>
                        {!isCollapsed && (
                            <h2 className="px-4 text-xs font-black text-emerald-400/80 uppercase tracking-widest mb-4">
                                Community & Profile
                            </h2>
                        )}
                        <div className="space-y-1">
                            {communityNav.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                return (
                                    <Link key={item.href} href={item.href} onClick={close}>
                                        <div className={cn(
                                            "flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative",
                                            isCollapsed && "justify-center px-0",
                                            isActive
                                                ? "bg-[#2D6A4F] text-white font-bold"
                                                : "text-white/70 hover:bg-white/5 hover:text-white font-bold"
                                        )}>
                                            {isActive && (
                                                <div className="absolute left-0 w-1.5 h-6 bg-emerald-400 rounded-r-full" />
                                            )}
                                            <item.icon className={cn(
                                                "w-5 h-5 transition-colors shrink-0",
                                                isActive ? "text-emerald-400" : "text-white/50 group-hover:text-white"
                                            )} />
                                            {!isCollapsed && <span className="text-base font-bold">{item.name}</span>}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* User Profile Bottom Box */}
                <div className="p-6 border-t border-white/10">
                    <div className={cn(
                        "flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all group",
                        isCollapsed && "justify-center p-0 hover:bg-transparent"
                    )}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 bg-emerald-800 flex items-center justify-center text-xs font-bold text-white relative">
                            <UserAvatar user={user as any} size="sm" className="w-full h-full object-cover" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-black text-white truncate leading-none mb-1">
                                    {user?.name || 'Student Learner'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-400 font-mono font-black border border-emerald-400/20 uppercase">
                                        {user?.studentId || 'STUDENT'}
                                    </span>
                                </div>
                            </div>
                        )}
                        {!isCollapsed && (
                            <button 
                                onClick={() => signOut?.()} 
                                className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                                title="Sign out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                `}</style>
            </aside>
        </>
    );
}

