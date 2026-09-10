'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo, useCallback } from 'react'
import MobileHeader from '@/components/mobile/MobileHeader'
import CourseCard from '@/components/mobile/CourseCard'
import SkeletonCard from '@/components/mobile/SkeletonCard'
import { Search, Filter, BookOpen } from 'lucide-react'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'

export default function MobileCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayQuery, setDisplayQuery] = useState('');

  const debouncedSearch = useDebouncedCallback((val: string) => {
    setSearchQuery(val);
  }, 300);

  const handleSearchChange = (val: string) => {
    setDisplayQuery(val);
    debouncedSearch(val);
  };

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/student/my-courses');
        if (res.ok) {
          const json = await res.json();
          setCourses(json.courses || []);
        }
      } catch (err) {
        console.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'progress' && c.progress > 0 && c.progress < 100) || 
        (filter === 'completed' && c.progress === 100);
      
      const matchesSearch = 
        !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.instructor?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [courses, filter, searchQuery]);

  const filterItems = [
    { id: 'all', label: 'All' },
    { id: 'progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileHeader title="My Courses" />
      
      <main className="p-4 pb-24">
        {/* Search Bar */}
        <div className="relative mb-5 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-600 text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            value={displayQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search my library..." 
            className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-11 pr-4 text-base text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar touch-pan-x">
          {filterItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 border ${
                filter === item.id 
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-lg shadow-emerald-800/20' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Course List */}
        <div className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <CourseCard key={course.id} {...course} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <BookOpen size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {searchQuery ? 'No matching courses' : 'No courses found'}
              </h3>
              <p className="text-sm text-slate-500 mb-8 max-w-[200px]">
                {searchQuery 
                  ? `We couldn't find anything matching "${searchQuery}"` 
                  : "You haven't enrolled in any courses matching this filter."}
              </p>
              <button 
                onClick={() => window.location.href = '/courses'}
                className="h-12 px-8 bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-800/10 active:scale-95 transition-all"
              >
                Browse All Courses
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

