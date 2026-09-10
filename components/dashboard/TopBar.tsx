'use client';

import { Bell, Search, Menu, X, Loader2, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useStudentDashboardData } from '@/hooks/useStudentDashboardData';
import UserAvatar from '@/components/ui/UserAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function TopBar({
  onMenuClick
}: {
  onMenuClick: () => void
}) {
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const { data, isLoading } = useStudentDashboardData();
  const user = data?.userProfile;
  const notifications = data?.notifications || [];

  useEffect(() => {
    setMounted(true);

    // Close dropdowns on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length >= 2) {
      setIsSearching(true);
      setShowSearchResults(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/courses?search=${encodeURIComponent(query)}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data.courses?.slice(0, 5) || []);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      if (signOut) {
        signOut();
      } else {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/?signedOut=true';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/?signedOut=true';
    }
  };

  const getFallbackAvatar = () => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'User'}&backgroundColor=ff5a1f`;
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-[1000] bg-background/80 backdrop-blur-md border-b border-border">
      <div className="px-4 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left: Menu button & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Menu className="w-6 h-6 text-foreground" aria-hidden="true" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent hidden sm:block">
              SARTHI
            </span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl relative hidden sm:block">
          <div className="relative">
            <label htmlFor="topbar-search" className="sr-only">Search courses and lessons</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <input
              id="topbar-search"
              type="text"
              aria-label="Search courses and lessons"
              placeholder="Search courses, lessons..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="w-full h-10 pl-10 pr-4 bg-muted border border-border rounded-full text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" aria-hidden="true" />
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && (searchResults.length > 0 || isSearching) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
              >
                {searchResults.map((course: any) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                  >
                    {course.thumbnail && (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover w-12 h-12"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-foreground truncate">{course.title}</p>
                      <p className="text-[12px] text-muted-foreground">{course.category}</p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-expanded={showNotifications}
              aria-haspopup="true"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread messages` : ''}`}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Bell className="w-6 h-6 text-foreground" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" aria-hidden="true">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  role="region"
                  aria-label="Notifications Panel"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-border">
                    <h3 className="font-bold text-foreground">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto" aria-live="polite">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" aria-hidden="true" />
                        <p className="text-[14px] font-medium text-muted-foreground">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification: any, index: number) => (
                        <div
                          key={notification.id || index}
                          role="listitem"
                          className={`p-4 border-b border-border last:border-0 hover:bg-muted transition-colors cursor-pointer ${!notification.read ? 'bg-primary/5' : ''
                            }`}
                        >
                          <p className="text-[14px] font-medium text-foreground">{notification.title}</p>
                          <p className="text-[12px] text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-2">{notification.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-border bg-muted/30">
                    <Link
                      href="/dashboard/notifications"
                      className="block text-center text-[13px] font-bold text-primary hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative overflow-visible" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              aria-label={`User menu for ${user?.name || 'Student'}`}
              className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <UserAvatar 
                user={{
                  ...user,
                  avatar_url: user?.avatar || user?.avatar_url
                }} 
                size="sm" 
              />
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-[9999]"
                >
                  <div className="p-4 border-b border-border">
                    <p className="font-bold text-foreground">{user?.name || 'User'}</p>
                    <p className="text-[13px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <span className="text-[14px] font-medium text-foreground">Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      <span className="text-[14px] font-medium">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

