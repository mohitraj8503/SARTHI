'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Tv,
  BadgeCheck,
  PlaySquare,
  MessageSquare,
  Bell,
  GraduationCap,
  Settings,
  Command,
  LogOut,
  Home,
  ChevronLeft,
  PenTool,
  Award,
  Info
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';
import UserAvatar from '@/components/ui/UserAvatar';

const NAV_ITEMS = [
  // 📚 Main Section
  { label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard', href: '/dashboard', type: 'tab', group: 'main' },
  { label: 'Courses', icon: BookOpen, key: 'my-courses', href: '/dashboard?tab=my-courses', type: 'tab', group: 'main' },
  
  // 🎤 Schedule Section
  { label: 'Schedule', icon: Tv, key: 'live', href: '/dashboard/live', type: 'route', group: 'main' },
  
  // ✍️ Articles Section
  { label: 'Articles', icon: PenTool, key: 'my-articles', href: '/dashboard/blogs', type: 'route', group: 'main' },
  { label: 'About Us', icon: Info, key: 'about-us', href: '/about', type: 'route', group: 'main' },
  
  // 👤 Account Section
  { label: 'Achievements', icon: Award, key: 'grades', href: '/dashboard/grades', type: 'route', group: 'account' },
  { label: 'Settings', icon: Settings, key: 'settings', href: '/dashboard/settings', type: 'route', group: 'account' },
];

export default function Sidebar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentTab = searchParams.get('tab');
  const { user } = useAuth();

  const renderNavGroup = (groupName: string, items: typeof NAV_ITEMS) => (
    <div className="space-y-1">
      <h4 className="px-4 text-[10px] font-black text-white/30 tracking-[0.2em] mb-3 uppercase">
        {groupName}
      </h4>
      {items.map((item) => {
        const isActive = item.type === 'tab'
          ? currentTab === item.key || (item.key === 'dashboard' && !currentTab && pathname === '/dashboard')
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`
              flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] transition-all duration-300 relative group/item nav-item-glass
              ${isActive
                ? 'active text-white font-bold'
                : 'text-white/40 hover:text-white font-medium'
              }
            `}
          >
            {isActive && (
              <div className="absolute left-0 w-1 h-5 bg-[#D4956A] rounded-r-full shadow-[0_0_8px_rgba(212,149,106,0.5)]" />
            )}
            <item.icon className={`w-[18px] h-[18px] transition-all duration-300 ${isActive ? 'text-[#D4956A] scale-110' : 'text-white/30 group-hover/item:text-white'}`} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="hidden lg:flex flex-col w-[280px] h-screen fixed left-0 top-0 z-30 px-6 py-10 transition-all duration-500 overflow-hidden sidebar-nav group/sidebar">
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-30" />
      
      <div className="mb-10 pl-2">
        <Link href="/" className="flex items-center gap-3 group transition-all active:scale-95">
          <div className="relative w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-lg border border-white/10 overflow-hidden">
            <Image 
              src="/images/sarthi_logo.jpg" 
              alt="SARTHI" 
              width={32} 
              height={32} 
              className="object-contain"
            />
          </div>
          <span className="text-[18px] font-outfit font-bold text-white tracking-tight leading-none">
            SARTHI
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
        {renderNavGroup('Main Menu', NAV_ITEMS.filter(i => i.group === 'main'))}
        
        {renderNavGroup('Account', NAV_ITEMS.filter(i => i.group === 'account'))}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="flex items-center gap-4 bg-white/5 hover:bg-white/10 p-3.5 rounded-[20px] transition-all duration-300 border border-white/5 group/user cursor-pointer">
          <UserAvatar user={user} size="sm" />
          <div className="flex-1 overflow-hidden">
            <p className="text-[12px] font-bold text-white truncate">{user?.name || 'Student'}</p>
            <p className="text-[9px] font-medium text-white/30 truncate uppercase tracking-widest">
              My Profile
            </p>
          </div>
          <LogOut className="w-4 h-4 text-white/20 group-hover/user:text-red-400 transition-colors" />
        </div>
      </div>
    </aside>
  );
}

