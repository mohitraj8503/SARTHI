'use client';

import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

export default function DashboardHeader() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Notifications logic
  const { data: notifications } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/notifications/unread');
      const json = await res.json();
      return json.success ? json.data : { count: 0 };
    },
    refetchInterval: 30000,
  });

  // Search debounced logic
  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=teacher`);
        const json = await res.json();
        const results = json.success ? json.data.results || [] : [];

        setSearchResults(results);

        setIsSearchOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);
  
  return (
    <header className="flex items-center justify-between h-20 mb-8 relative z-[100]">
      <div className="flex-1 flex items-center gap-6">
        <div className="relative w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsSearchOpen(true)}
            onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
            placeholder="Search students, courses, or insights..." 
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
          />

          {/* Search Results Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => window.location.href = result.link || result.url}
                  className="w-full text-left px-6 py-4 hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors"
                >
                  <p className="text-xs font-black text-slate-900">{result.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{result.subtitle}</p>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.location.href = '/teacher/notifications'}
          className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center relative hover:bg-slate-50 transition-all"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {notifications?.count > 0 && (
            <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center">
              {notifications.count > 9 ? '9+' : notifications.count}
            </span>
          )}
        </button>


        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none mb-1">{user?.name || 'Instructor'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Teacher Studio</p>
          </div>
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 relative">
             <Image 
               src={user?.image || user?.avatar_url || (user?.name === 'Mohit Raj' ? '/images/instructors/mohit-raj-speaker.jpg' : `https://ui-avatars.com/api/?name=${user?.name}`)} 
               alt={user?.name || "User profile"} 
               width={48}
               height={48}
               className="w-full h-full object-cover"
               unoptimized={(user?.image || user?.avatar_url)?.startsWith('http') || !user?.image}
             />
          </div>
        </div>
      </div>
    </header>
  );
}

