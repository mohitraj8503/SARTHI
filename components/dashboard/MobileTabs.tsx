'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Home,
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  MessageSquare,
  Trophy,
  Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Primary bottom tabs - All accessible from mobile
const BOTTOM_TABS = [
  { label: 'Home', icon: Home, key: 'home', href: '/' },
  { label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard', href: '/dashboard?tab=dashboard' },
  { label: 'My Courses', icon: BookOpen, key: 'my-courses', href: '/dashboard?tab=my-courses' },
  { label: 'Assignments', icon: FileText, key: 'assignments', href: '/dashboard?tab=assignments' },
  { label: 'Q&A', icon: MessageSquare, key: 'qa', href: '/dashboard?tab=qa' },
  { label: 'Achievements', icon: Trophy, key: 'achievements', href: '/dashboard?tab=achievements' },
  { label: 'Settings', icon: Settings, key: 'settings', href: '/dashboard?tab=settings' },
];

export default function MobileTabs() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0B0F19] border-t border-slate-200 dark:border-white/5 z-40 pb-safe">
      <nav className="flex items-center justify-around h-[64px] overflow-x-auto no-scrollbar" role="tablist" aria-label="Main navigation">
        {BOTTOM_TABS.map((item) => {
          const isActive = currentTab === item.key;
          
          return (
            <Link
              key={item.key}
              href={item.href}
              replace={item.key !== 'home'}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.key}`}
              id={`tab-${item.key}`}
              tabIndex={isActive ? 0 : -1}
              className="flex flex-col items-center justify-center px-3 py-2 min-w-[60px] h-full gap-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <div className={`relative p-1 rounded-xl transition-all ${isActive ? 'text-black dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                 <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                 {isActive && (
                    <motion.div 
                        layoutId="activeTabIndicatorMobile"
                        className="absolute inset-0 bg-slate-100 dark:bg-white/10 -z-10 rounded-xl" 
                        aria-hidden="true"
                    />
                 )}
              </div>
              <span className={`text-[9px] font-bold truncate max-w-[60px] ${isActive ? 'text-black dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

