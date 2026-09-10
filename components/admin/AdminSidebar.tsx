'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Wallet, 
  Settings, 
  Headphones, 
  ChevronDown,
  ChevronRight, 
  LogOut,
  Activity,
  UserCircle,
  Search,
  Radio,
  Mail,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useSidebarStore } from '@/hooks/use-sidebar-store';

interface NavItem {
  name: string;
  icon: React.ElementType;
  href: string;
  id: string;
  subItems?: { name: string; href: string; id: string }[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();
  const { isOpen, close } = useSidebarStore();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(() => {
    if (pathname.includes('/users') || pathname.includes('/students') || pathname.includes('/teachers') || pathname.includes('/blog-writers')) return 'users';
    if (pathname.includes('/courses') || pathname.includes('/certificate-studio') || pathname.includes('/admin/certificates') || pathname.includes('/inductions')) return 'content';
    if (pathname.includes('/payments') || pathname.includes('/teacher-applications')) return 'finance';
    if (pathname.includes('/settings') || pathname.includes('/manage-passwords')) return 'system';
    return null;
  });

  const mainNav: NavItem[] = [
    { name: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard', id: 'dashboard' },
    { name: 'Live Operations', icon: Radio, href: '/admin/live', id: 'live-ops' },
    { name: 'Email Portal', icon: Mail, href: '/admin/dashboard?tab=email', id: 'email' },
  ];

  const compressedNav: NavItem[] = [
    {
      name: 'Users',
      id: 'users',
      icon: Users,
      href: '/admin/users',
      subItems: [
        { name: 'Students', href: '/admin/students', id: 'students' },
        { name: 'Teachers', href: '/admin/teachers', id: 'teachers' },
        { name: 'Ambassadors', href: '/admin/student-ambassadors', id: 'ambassadors' },
      ]
    },
    {
      name: 'Content',
      id: 'content',
      icon: BookOpen,
      href: '/admin/courses',
      subItems: [
        { name: 'Courses', href: '/admin/courses', id: 'courses' },
        { name: 'Moderation', href: '/admin/moderation', id: 'moderation' },
        { name: 'Blogs', href: '/admin/blogs', id: 'blogs' },
        { name: 'Certificates', href: '/certificate-studio', id: 'certificates' },
        { name: 'Inductions', href: '/admin/inductions', id: 'inductions' },
      ]
    },
    {
      name: 'Finance',
      id: 'finance',
      icon: Wallet,
      href: '/admin/payments',
      subItems: [
        { name: 'Payments', href: '/admin/payments', id: 'payments' },
        { name: 'Applications', href: '/admin/teacher-applications', id: 'applications' },
      ]
    },
    {
      name: 'System',
      id: 'system',
      icon: Settings,
      href: '/admin/settings',
      subItems: [

        { name: 'Settings', href: '/admin/settings', id: 'settings' },
        { name: 'Manager Access', href: '/admin/manage-passwords', id: 'managers' },
      ]
    },
    { name: 'Support', id: 'support', icon: Headphones, href: '/admin/support' },
  ];

  const [searchQuery, setSearchQuery] = useState('');

  const adminSearchItems = [
    { title: 'Admin Overview & Telemetry', category: 'Control', href: '/admin/dashboard', icon: LayoutDashboard, keywords: 'overview dashboard analytics stats metrics control' },
    { title: 'Live Operations Studio', category: 'Control', href: '/admin/live', icon: Radio, keywords: 'live operations streaming sessions broadcasts broadcast' },
    { title: 'Broadcast Email Portal', category: 'Control', href: '/admin/dashboard?tab=email', icon: Mail, keywords: 'email broadcast newsletter notification mailing' },
    { title: 'Student Roster & Directory', category: 'Users', href: '/admin/students', icon: Users, keywords: 'students learners roster users list verify profile' },
    { title: 'Teacher & Instructor Roster', category: 'Users', href: '/admin/teachers', icon: Users, keywords: 'teachers faculty instructors mentors roster' },
    { title: 'Campus Ambassadors', category: 'Users', href: '/admin/student-ambassadors', icon: Users, keywords: 'ambassadors referrals campus partners' },
    { title: 'Course Management Catalog', category: 'Content', href: '/admin/courses', icon: BookOpen, keywords: 'courses syllabus modules curriculum catalog' },
    { title: 'Content & Review Moderation', category: 'Content', href: '/admin/moderation', icon: BookOpen, keywords: 'moderation reviews flag reports comments' },
    { title: 'Blog Writer Access & Posts', category: 'Content', href: '/admin/blogs', icon: BookOpen, keywords: 'blogs articles writer studio posts author' },
    { title: 'Certificate Studio & Verification', category: 'Content', href: '/certificate-studio', icon: BookOpen, keywords: 'certificates verification studio badges awards' },
    { title: 'Induction Programs', category: 'Content', href: '/admin/inductions', icon: BookOpen, keywords: 'induction onboarding cohort batch' },
    { title: 'Payments & Revenue Ledger', category: 'Finance', href: '/admin/payments', icon: Wallet, keywords: 'payments finance revenue orders transaction invoice' },
    { title: 'Teacher Applications & Approvals', category: 'Finance', href: '/admin/teacher-applications', icon: Wallet, keywords: 'teacher applications faculty hiring approve' },
    { title: 'System Configuration & Settings', category: 'System', href: '/admin/settings', icon: Settings, keywords: 'settings system config keys setup' },
    { title: 'Manager Access & Passwords', category: 'System', href: '/admin/manage-passwords', icon: Settings, keywords: 'managers passwords access roles security' },
    { title: 'Support Desk & Tickets', category: 'Support', href: '/admin/support', icon: Headphones, keywords: 'support help desk tickets issues' },
  ];

  const filteredSearchResults = searchQuery.trim() === '' ? [] : adminSearchItems.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.keywords.toLowerCase().includes(query)
    );
  });

  const toggleMenu = (id: string) => {
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'MP';

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
          "w-[280px] bg-[#1B4332] flex flex-col h-full fixed left-0 top-0 z-[101] text-white border-r border-white/5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )} 
        role="navigation"
      >
      {/* Logo Area */}
      <div className="py-10 px-8">
          <Link href="/" className="group flex items-center gap-3 transition-transform active:scale-95">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-lg relative">
                <Image 
                  src="/sarthi-logo.png" 
                  alt="TT Logo" 
                  width={40}
                  height={40}
                  className="w-full h-full object-contain" 
                />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight block leading-tight">
                    SARTHI
                </span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] leading-none mt-1 block">
                    ADMIN CONSOLE
                </span>
              </div>
          </Link>
      </div>

      {/* Sidebar Search */}
      <div className="px-6 mb-8 relative">
          <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input 
                  type="text" 
                  placeholder="Quick search admin..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#2D6A4F]/40 border border-white/10 focus:border-emerald-400 rounded-xl pl-11 pr-8 py-3 text-sm font-semibold text-white placeholder-white/50 focus:outline-none transition-all font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
          </div>

          {/* Instant Admin Search Suggestions Popover */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute left-6 right-6 top-full mt-2 z-[250] bg-[#1B4332] border border-emerald-400/30 rounded-2xl p-2 shadow-2xl backdrop-blur-xl max-h-[380px] overflow-y-auto space-y-1 custom-scrollbar">
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
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#2D6A4F] transition-all text-left group/item border border-transparent hover:border-emerald-400/20"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 group-hover/item:bg-emerald-400 group-hover/item:text-slate-900 transition-all shrink-0">
                        <ItemIcon className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white tracking-tight line-clamp-1 group-hover/item:text-emerald-400 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">
                          {item.category}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover/item:text-white group-hover/item:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })
              ) : (
                <div className="py-6 px-4 text-center space-y-1">
                  <p className="text-sm font-bold text-white/80">No results for &quot;{searchQuery}&quot;</p>
                  <p className="text-xs text-white/40 font-medium">Try &quot;students&quot;, &quot;courses&quot;, &quot;payments&quot;, or &quot;settings&quot;</p>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-6 no-scrollbar admin-scrollbar">
        <div>
          <h2 className="px-4 text-xs font-black text-emerald-400/80 uppercase tracking-widest mb-4">Core Control</h2>
          <div className="space-y-1.5">
            {mainNav.map((item) => {
              const tab = searchParams.get('tab');
              let isActive = false;
              if (item.id === 'email') {
                isActive = pathname === '/admin/dashboard' && tab === 'email';
              } else if (item.id === 'dashboard') {
                isActive = (pathname === '/admin/dashboard' && tab !== 'email') || pathname === '/admin';
              } else {
                isActive = pathname === item.href;
              }
              return (
                <Link 
                  key={item.id} 
                  href={item.href} 
                  onClick={() => {
                    close();
                  }}
                >
                  <div className={cn(
                    "flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative font-bold text-base",
                    isActive
                      ? "bg-[#2D6A4F] text-white shadow-sm"
                      : "text-white/75 hover:bg-[#2D6A4F]/50 hover:text-white"
                  )}>
                    {isActive && <div className="absolute left-0 w-1.5 h-7 bg-emerald-400 rounded-r-full" />}
                    <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-emerald-400" : "text-white/60 group-hover:text-white")} />
                    <span className="text-base font-bold">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="px-4 text-xs font-black text-emerald-400/80 uppercase tracking-widest mb-4">Management</h2>
          <div className="space-y-1.5">
            {compressedNav.map((item) => {
              const isExpanded = expandedMenu === item.id;
              const hasActiveSubItem = item.subItems?.some(sub => pathname.startsWith(sub.href));
              const isActive = pathname === item.href || (!item.subItems && pathname === item.href);

              if (!item.subItems) {
                return (
                  <Link key={item.id} href={item.href} prefetch={true}>
                    <div className={cn(
                      "flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative font-bold text-base",
                      isActive
                        ? "bg-[#2D6A4F] text-white shadow-sm"
                        : "text-white/75 hover:bg-[#2D6A4F]/50 hover:text-white"
                    )}>
                      {isActive && <div className="absolute left-0 w-1.5 h-7 bg-emerald-400 rounded-r-full" />}
                      <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-emerald-400" : "text-white/60 group-hover:text-white")} />
                      <span className="text-base font-bold">{item.name}</span>
                    </div>
                  </Link>
                );
              }

              return (
                <div key={item.id} className="space-y-1.5">
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative font-bold text-base",
                      isExpanded || hasActiveSubItem 
                        ? "bg-[#2D6A4F]/80 text-white" 
                        : "text-white/75 hover:bg-[#2D6A4F]/50 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 transition-colors", isExpanded || hasActiveSubItem ? "text-emerald-400" : "text-white/60 group-hover:text-white")} />
                    <span className="text-base font-bold">{item.name}</span>
                    <ChevronDown className={cn("ml-auto w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")} />
                  </button>
                  
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    isExpanded ? "max-h-96 opacity-100 py-1" : "max-h-0 opacity-0"
                  )}>
                    <div className="ml-8 border-l-2 border-white/10 pl-4 space-y-1 mt-1">
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link key={subItem.id} href={subItem.href} prefetch={true} onClick={close}>
                            <div className={cn(
                              "block px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200",
                              isSubActive 
                                ? "text-emerald-400 bg-[#2D6A4F]/60" 
                                : "text-white/70 hover:text-white hover:bg-[#2D6A4F]/30"
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
        <div className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-[#2D6A4F]/50 cursor-pointer transition-all group">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/20 bg-[#2D6A4F] flex items-center justify-center text-xs font-black text-white relative">
            {user?.image || user?.avatar_url ? (
              <Image 
                src={user.image || user.avatar_url || ''} 
                alt={user?.name || 'Admin'} 
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-black text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-emerald-400 truncate uppercase font-black tracking-wider">{user?.role?.replace(/_/g, ' ') || 'Admin'}</p>
          </div>
          <button onClick={() => signOut()} className="p-2 text-white/60 hover:text-rose-400 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .admin-scrollbar::-webkit-scrollbar { width: 4px; }
        .admin-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .admin-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,145,92,0.2); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </aside>
    </>
  );
}
