'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { Search as SearchIcon, ChevronRight, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCourses } from '@/hooks/useCourses';

// Simple debounce hook if not exists
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('interest') || '';
  const levelParam = searchParams?.get('level') || '';

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounceValue(query, 300);

  const { data: courses, isLoading } = useCourses();

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!debouncedQuery && !levelParam) return [];

    const q = debouncedQuery.toLowerCase();

    // Strict match (Both text and level)
    const strictMatches = courses.filter((course) => {
      const matchText =
        !q ||
        course.title?.toLowerCase().includes(q) ||
        course.description?.toLowerCase().includes(q) ||
        course.category?.toLowerCase().includes(q);
      const matchLevel = !levelParam || course.level?.toLowerCase() === levelParam.toLowerCase();
      return matchText && matchLevel;
    });

    if (strictMatches.length > 0) return strictMatches;

    // Fallback: Match text OR level if strict failed
    return courses.filter((course) => {
      const matchText =
        q &&
        (course.title?.toLowerCase().includes(q) ||
          course.description?.toLowerCase().includes(q) ||
          course.category?.toLowerCase().includes(q));
      const matchLevel = levelParam && course.level?.toLowerCase() === levelParam.toLowerCase();
      return matchText || matchLevel;
    });
  }, [courses, debouncedQuery, levelParam]);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-brand-dark tracking-tight">Search Catalog</h1>
          <p className="text-gray-500">Find the perfect course to upgrade your skills.</p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <SearchIcon className="w-6 h-6 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for Python, Marketing, Design..."
            className="w-full pl-14 pr-6 py-6 rounded-[2rem] border-2 border-transparent bg-white shadow-xl shadow-brand-dark/5 focus:border-brand-orange focus:outline-none text-lg font-bold text-brand-dark transition-all"
            autoFocus
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-6 flex items-center">
              <Loader2 className="w-5 h-5 text-brand-orange animate-spin" />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-6 pt-8">
          {debouncedQuery && filteredCourses.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                <SearchIcon className="w-8 h-8" />
              </div>
              <p className="text-xl font-bold text-gray-600">
                No results found for &quot;{debouncedQuery}&quot;
              </p>
              <p className="text-gray-400">
                Try searching for something else like &quot;React&quot; or &quot;Design&quot;
              </p>
            </div>
          )}

          {!debouncedQuery && (
            <div className="text-center py-12 opacity-50">
              <p className="text-lg font-bold text-gray-400">Start typing to search...</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <Link
                href={`/courses/${course.id}`}
                key={course.id}
                className="group bg-white rounded-[2rem] p-4 flex gap-6 hover:shadow-xl transition-all border border-gray-100 hover:border-brand-orange/30"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 relative shrink-0">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <BookOpen className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 py-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange bg-brand-orange/5 px-2 py-1 rounded-md">
                      {course.category || 'Course'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-brand-dark leading-tight group-hover:text-brand-orange transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs font-bold text-gray-400 mt-2 flex items-center gap-1">
                    View Details <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

