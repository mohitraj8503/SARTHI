'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, LayoutDashboard, BookOpen, Bell, X, HelpCircle, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ProfileDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  notificationsCount?: number;
  profileCompletion?: number;
  signOut?: () => void;
}



export function ProfileDropdown({ user, notificationsCount, profileCompletion, signOut }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const ref = useRef<HTMLButtonElement>(null);

  const open = Boolean(anchorEl);
  const id = open ? 'profile-dropdown' : undefined;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setAnchorEl(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setAnchorEl(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    setAnchorEl(null);
  };

  const role = (user?.role as string)?.toUpperCase() || '';
  const dashboardUrl =
    role === 'ADMIN'
      ? '/admin'
      : ['TEACHER', 'INSTRUCTOR'].includes(role)
        ? '/teacher/dashboard'
        : '/dashboard';

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        onClick={handleClick}
        ref={ref}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="profile-menu"
        aria-label="Toggle user profile menu"
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black tracking-tighter text-white transition-all bg-[#1A3C2E] ring-2 ring-white/10 hover:ring-white/30 hover:scale-105 active:scale-95 group shadow-lg"
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name ?? 'User'}
            width={40}
            height={40}
            className="w-full h-full object-cover rounded-full"
            unoptimized={true}
          />
        ) : (
          <span className="flex items-center justify-center font-black">{user?.name?.[0]?.toUpperCase() ?? 'U'}</span>
        )}
        
        {/* Suggestion Pop-up Bubble (only if not onboarded) */}
        {!(user as any).onboarded && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 2, duration: 0.5, type: 'spring' }}
            className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-4 py-2 bg-white text-[#1A3C2E] border border-[#E8E2D9] rounded-xl shadow-[0_10px_30px_rgba(26,60,46,0.15)] whitespace-nowrap hidden sm:block"
          >
            <div className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              Set your profile
            </div>
            {/* Arrow */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-[6px] w-[12px] h-[12px] bg-white border-t border-r border-[#E8E2D9] rotate-45" />
          </motion.div>
        )}

        {/* Notification badge */}
        {notificationsCount && notificationsCount > 0 && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></div>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="profile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-[calc(100%+10px)] right-0 w-[260px] bg-white border border-[#E8E2D9] rounded-2xl shadow-[0_8px_40px_rgba(26,60,46,0.18)] p-2 z-[9991]"
            role="menu"
            aria-label="User Profile Menu"
          >
            {/* User info header */}
            <div className="px-3 py-4 flex flex-col items-center border-b border-[#F5F0E8] mb-1">
              <div className="w-11 h-11 rounded-full bg-[#1A3C2E] text-white flex items-center justify-center font-bold text-lg mb-3 overflow-hidden relative">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? 'User'}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                    unoptimized={user.image.startsWith('http')}
                  />
                ) : (
                  <span className="flex items-center justify-center">{user?.name?.[0]?.toUpperCase() ?? 'U'}</span>
                )}
              </div>
              <h4 className="text-[#1A3C2E] font-bold text-[15px]">
                {user?.name ?? 'User'}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : role === 'TEACHER'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-[#E8F5EE] text-[#2D6A4F]'
                  )}
                >
                  {user?.role ?? 'Student'}
                </span>
              </div>
              <p className="text-[#5D705C] text-xs mt-1.5">{user?.email}</p>
              
              {/* Profile completion indicator */}
              {profileCompletion !== undefined && profileCompletion < 100 && (
                <div className="mt-2 flex items-center space-x-2 text-xs">
                  <div className="h-0.5 w-[80px] bg-[#EAE6DF] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#D4956A] rounded-full transition-all duration-1000" 
                      style={{ width: `${profileCompletion}%` }} 
                    />
                  </div>
                  <span className="text-[#5D705C]">{profileCompletion}% complete</span>
                  {profileCompletion < 100 && (
                    <Link
                      href="/profile"
                      className="text-[D4956A] hover:underline font-medium ml-1"
                      onClick={handleClose}
                    >
                      Complete now
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Nav links */}
            <div className="py-1" role="none">
              {[
                { href: dashboardUrl, icon: <LayoutDashboard className="w-4 h-4 text-[#5D705C]" />, label: 'Go to Dashboard' },
                { href: '/dashboard/settings', icon: <Settings className="w-4 h-4 text-[#5D705C]" />, label: 'Settings' },
              ].map(({ href, icon, label }, index) => (
                <Link
                  key={`${href}-${index}`}
                  href={href}
                  onClick={handleClose}
                  role="menuitem"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#1A3C2E] hover:bg-[#F5F0E8] transition-colors"
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="mt-1 pt-1 border-t border-[#F5F0E8]" role="none">
              <button
                onClick={() => {
                  signOut?.();
                  handleClose();
                }}
                role="menuitem"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#E74C3C] hover:bg-[#FFF0F0] transition-colors text-left no-transform"
                style={{ minHeight: '40px' }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

