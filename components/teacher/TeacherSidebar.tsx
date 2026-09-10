'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Video, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  ChevronDown,
  FileText,
  Zap,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface NavItem {
  name: string;
  icon: React.ElementType;
  href: string;
  id: string;
  subItems?: { name: string; href: string; id: string }[];
}

export default function TeacherSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(() => {
    if (pathname.includes('/courses')) return 'studio';
    if (pathname.includes('/students')) return 'community';
    return null;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mainNav: NavItem[] = [
    { name: 'Overview', icon: LayoutDashboard, href: '/teacher/dashboard', id: 'dashboard' },
  ];

  const secondaryNav: NavItem[] = [
    {
      name: 'Studio Tools',
      id: 'studio',
      icon: BookOpen,
      href: '/teacher/courses',
      subItems: [
        { name: 'My Courses', href: '/teacher/courses', id: 'courses' },
        { name: 'Video Vault', href: '/teacher/videos', id: 'videos' },
        { name: 'Assessments', href: '/teacher/assignments', id: 'assignments' },
        { name: 'Submissions', href: '/teacher/submissions', id: 'submissions' },
      ]
    },
    {
      name: 'Community',
      id: 'community',
      icon: Users,
      href: '/teacher/students',
      subItems: [
        { name: 'Student Portal', href: '/teacher/students', id: 'students' },
        { name: 'Email Broadcast', href: '/teacher/community/email', id: 'email-broadcast' },
        { name: 'Seminars', href: '/teacher/seminars', id: 'seminars' },
      ]
    },
    { name: 'Analytics', id: 'analytics', icon: BarChart3, href: '/teacher/analytics' },
    { name: 'Settings', id: 'settings', icon: Settings, href: '/teacher/settings' },
  ];

  const toggleMenu = (id: string) => {
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced sidebar search
  React.useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        if (json.success && json.data?.results) {
          setSearchResults(json.data.results);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error('Sidebar search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'TR';

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1B4332] z-[110] flex items-center justify-between px-4 text-white border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
             <Image src="/sarthi-logo.png" alt="TT" width={20} height={20} className="w-full h-full object-contain" />
           </div>
           <span className="font-bold text-sm tracking-tight">Teacher Studio</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-[120] backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={cn(
        "w-[280px] bg-[#1B4332] flex flex-col h-full fixed left-0 top-0 z-[130] text-white transition-transform duration-300 border-r border-white/5",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )} role="navigation">
      {/* Logo Area */}
      <div className="py-10 px-8">
          <Link href="/" className="group flex items-center gap-3 transition-transform active:scale-95">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg">
                <Image src="/sarthi-logo.png" alt="TT" width={28} height={28} className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight block leading-tight">
                    SARTHI
                </span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] leading-none mt-1 block">
                    TEACHER STUDIO
                </span>
              </div>
          </Link>
      </div>

      {/* Sidebar Search */}
      <div className="px-6 mb-8 relative">
          <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                  type="text" 
                  placeholder="Quick search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="w-full bg-white/10 border border-white/15 focus:border-emerald-400 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-white placeholder-white/40 focus:outline-none transition-all font-sans"
              />
          </div>
          {/* Dropdown suggestions */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-6 right-6 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-[100] max-h-60 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    window.location.href = result.url || result.link;
                    setIsSearchOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-850 border-b border-zinc-800 last:border-b-0 transition-colors flex flex-col"
                >
                  <span className="text-xs font-bold text-white truncate">{result.title}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-tight">{result.type || 'result'}</span>
                </button>
              ))}
            </div>
          )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-6 no-scrollbar teacher-scrollbar">
        <div>
          <h2 className="px-4 text-xs font-black text-emerald-400/80 uppercase tracking-widest mb-4">Core Control</h2>
          <div className="space-y-1">
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.id} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={cn(
                    "flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-[#2D6A4F] text-white font-bold"
                      : "text-white/70 hover:bg-white/5 hover:text-white font-bold"
                  )}>
                    {isActive && <div className="absolute left-0 w-1.5 h-6 bg-emerald-400 rounded-r-full" />}
                    <item.icon className={cn("w-5 h-5 transition-colors shrink-0", isActive ? "text-emerald-400" : "text-white/50 group-hover:text-white")} />
                    <span className="text-base font-bold">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="px-4 text-xs font-black text-emerald-400/80 uppercase tracking-widest mb-4">Management</h2>
          <div className="space-y-1">
            {secondaryNav.map((item) => {
              const isExpanded = expandedMenu === item.id;
              const hasActiveSubItem = item.subItems?.some(sub => pathname.startsWith(sub.href));
              const isActive = pathname === item.href;

              if (!item.subItems) {
                return (
                  <Link key={item.id} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={cn(
                      "flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative",
                      isActive
                        ? "bg-[#2D6A4F] text-white font-bold"
                        : "text-white/70 hover:bg-white/5 hover:text-white font-bold"
                    )}>
                      {isActive && <div className="absolute left-0 w-1.5 h-6 bg-emerald-400 rounded-r-full" />}
                      <item.icon className={cn("w-5 h-5 transition-colors shrink-0", isActive ? "text-emerald-400" : "text-white/50 group-hover:text-white")} />
                      <span className="text-base font-bold">{item.name}</span>
                    </div>
                  </Link>
                );
              }

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative",
                      isExpanded || hasActiveSubItem 
                        ? "text-white bg-white/10 font-bold" 
                        : "text-white/70 hover:bg-white/5 hover:text-white font-bold"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 transition-colors shrink-0", isExpanded || hasActiveSubItem ? "text-white" : "text-white/50 group-hover:text-white")} />
                    <span className="text-base font-bold">{item.name}</span>
                    <ChevronDown className={cn("ml-auto w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")} />
                  </button>
                  
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    isExpanded ? "max-h-96 opacity-100 py-1" : "max-h-0 opacity-0"
                  )}>
                    <div className="ml-8 border-l border-white/10 pl-4 space-y-1 mt-1">
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link key={subItem.id} href={subItem.href} onClick={() => setIsMobileMenuOpen(false)}>
                            <div className={cn(
                              "block px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200",
                              isSubActive 
                                ? "text-emerald-400 bg-white/10" 
                                : "text-white/60 hover:text-white hover:bg-white/10"
                            )}>
                              {subItem.name}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile Bottom */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all group">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 bg-emerald-800 flex items-center justify-center text-xs font-bold text-white relative">
            <Image 
              src={user?.image || '/images/instructors/mohit-raj-speaker.jpg'} 
              alt={user?.name || 'Mohit Raj'} 
              width={40} 
              height={40} 
              className="w-full h-full object-cover" 
              unoptimized={!!user?.image && user.image.startsWith('http')}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-black text-white truncate leading-none mb-1">{user?.name || 'Mohit Raj'}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-400 font-mono font-black border border-emerald-400/20">
                {user?.teacherId || 'TEACHER'}
              </span>
            </div>
          </div>
          <button onClick={() => signOut()} className="p-1.5 text-white/20 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .teacher-scrollbar::-webkit-scrollbar { width: 4px; }
        .teacher-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </aside>
    </>
  );
}

