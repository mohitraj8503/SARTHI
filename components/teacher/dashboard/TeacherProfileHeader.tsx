'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  Video, 
  Calendar, 
  BarChart3, 
  CheckCircle, 
  Users, 
  IndianRupee,
  Loader2,
  X,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import GoLiveButton from './GoLiveButton';
import Link from 'next/link';
import Image from 'next/image';

interface TeacherProfileHeaderProps {
  teacher: {
    name: string;
    email: string;
    image?: string;
    title: string;
  };
  stats: {
    activeCourses: number;
    totalStudents: number;
    earningsToday: number;
  };
  isLoading?: boolean;
}

export default function TeacherProfileHeader({ teacher, stats, isLoading }: TeacherProfileHeaderProps) {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${searchQuery}&type=teacher`);
          const data = await res.json();
          setSearchResults(data);
        } catch (err) {
          console.error('Search failed:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search') as HTMLInputElement;
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white border-b border-slate-100 px-10 py-8 sticky top-0 z-50 animate-pulse">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <div className="flex items-center justify-between gap-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-slate-100" />
              <div className="space-y-2">
                <div className="h-6 w-32 bg-slate-100 rounded-lg" />
                <div className="h-4 w-48 bg-slate-50 rounded-lg" />
              </div>
            </div>
            <div className="flex-1 max-w-2xl h-14 bg-slate-50 rounded-2xl" />
            <div className="flex gap-4">
              <div className="w-40 h-14 bg-slate-50 rounded-2xl" />
              <div className="w-14 h-14 bg-slate-50 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-slate-100 px-10 py-8 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Top Row: Profile & Search */}
        <div className="flex items-center justify-between gap-12">
          {/* Teacher Profile Section */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition-all overflow-hidden border-4 border-white relative">
                {teacher.image ? (
                  <Image 
                    src={teacher.image} 
                    alt={teacher.name} 
                    width={80}
                    height={80}
                    className="w-full h-full object-cover" 
                    unoptimized={teacher.image.startsWith('http')}
                  />
                ) : (
                  teacher.name[0]
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{teacher.name}</h2>
                <span className="bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                  Senior Instructor
                </span>
              </div>
              <p className="text-sm font-bold text-slate-500">{teacher.title}</p>
              <p className="text-xs font-medium text-slate-400">{teacher.email}</p>
            </div>
          </div>

          {/* Search Architecture */}
          <div className="flex-1 max-w-2xl relative" ref={searchRef}>
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                id="global-search"
                type="text"
                placeholder="Search students, courses, or media content... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-16 pr-14 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/20 transition-all"
              />
              {isSearching && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                </div>
              )}
              {searchQuery && !isSearching && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults && (
              <div className="absolute top-full left-0 w-full mt-4 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-6 max-h-[500px] overflow-y-auto">
                  {Object.entries(searchResults).map(([category, items]: [string, any]) => (
                    items.length > 0 && (
                      <div key={category} className="mb-6 last:mb-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          {category}
                        </p>
                        <div className="space-y-2">
                          {items.map((item: any) => (
                            <Link 
                              key={item.id}
                              href={item.link}
                              className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                {category === 'courses' ? <BookOpen className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.subtitle}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                  {Object.values(searchResults).every((arr: any) => arr.length === 0) && (
                    <div className="py-12 text-center">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found matching &quot;{searchQuery}&quot;</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <GoLiveButton />
            
            <Link href="/teacher/calendar" className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
              <Calendar className="w-6 h-6" />
            </Link>
            
            <Link href="/teacher/analytics" className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
              <BarChart3 className="w-6 h-6" />
            </Link>
          </div>
        </div>

        {/* Bottom Row: Quick Stats */}
        <div className="flex items-center gap-12 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Active Courses</p>
              <p className="text-lg font-black text-slate-900">{stats.activeCourses}</p>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-slate-100" />

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Students</p>
              <p className="text-lg font-black text-slate-900">{stats.totalStudents.toLocaleString()}</p>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-slate-100" />

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Earnings Today</p>
              <p className="text-lg font-black text-slate-900">₹{stats.earningsToday.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

