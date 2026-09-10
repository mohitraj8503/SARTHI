'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, X, Star, Clock, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { debounce } from 'lodash';

interface Course {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    category: string;
    level: string;
    rating: number;
    reviewCount: number;
    instructor: {
       name: string;
       image: string | null;
       bio: string | null;
    };
    totalLessons: number;
    enrolledCount: number;
    price: number;
    isFree: boolean;
    totalDuration: number; // in minutes
}

export default function ExploreClient({ initialCourses }: { initialCourses: Course[] }) {
   const [courses, setCourses] = useState<Course[]>(initialCourses);
   const [loading, setLoading] = useState(false);
   const [search, setSearch] = useState('');
   const [category, setCategory] = useState<string[]>([]);
   const [level, setLevel] = useState<string[]>([]);
   const [duration, setDuration] = useState<string[]>([]);
   const [rating, setRating] = useState<string[]>([]);
   const [isFilterOpen, setIsFilterOpen] = useState(false);
   const [enrolling, setEnrolling] = useState<string | null>(null);

   const categories = ['Development', 'Design', 'Business', 'Marketing', 'Data Science', 'AI & ML'];
   const levels = ['Beginner', 'Intermediate', 'Advanced'];
   const durations = ['<1h', '1-3h', '3-6h', '6-10h', '>10h'];
   const ratings = ['4.5+', '4.0+', '3.5+', '3.0+'];

   const fetchCourses = useCallback(async (currentSearch: string, currentCategories: string[], currentLevels: string[], currentDurations: string[], currentRatings: string[]) => {
      setLoading(true);
      try {
         const params = new URLSearchParams();
         if (currentSearch) params.append('search', currentSearch);
         if (currentCategories.length > 0) params.append('category', currentCategories.join(','));
         if (currentLevels.length > 0) params.append('level', currentLevels.join(','));
         if (currentDurations.length > 0) params.append('duration', currentDurations.join(','));
         if (currentRatings.length > 0) params.append('rating', currentRatings.join(','));

         const res = await fetch(`/api/courses?${params.toString()}`);
         if (res.ok) {
            const data = await res.json();
            setCourses(Array.isArray(data?.courses) ? data.courses : []);
         }
      } catch (error) {
         console.error('Failed to fetch courses:', error);
      } finally {
         setLoading(false);
      }
   }, []);

   const debouncedFetch = useMemo(
      () => debounce((s: string, c: string[], l: string[], d: string[], r: string[]) => fetchCourses(s, c, l, d, r), 500),
      [fetchCourses]
   );

   useEffect(() => {
      debouncedFetch(search, category, level, duration, rating);
      return () => debouncedFetch.cancel();
   }, [search, category, level, duration, rating, debouncedFetch]);

   const toggleFilter = (item: string, current: string[], setter: (val: string[]) => void) => {
      if (current.includes(item)) {
         setter(current.filter(i => i !== item));
      } else {
         setter([...current, item]);
      }
   };

   const handleEnroll = async (courseId: string) => {
      setEnrolling(courseId);
      try {
         const res = await fetch('/api/courses/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId }),
         });
         if (res.ok) {
            alert('Enrolled successfully!');
         } else {
            const data = await res.json();
            alert(data.message || 'Failed to enroll');
         }
      } catch (error) {
         console.error('Enroll error:', error);
         alert('Failed to enroll');
      } finally {
         setEnrolling(null);
      }
   };

   const activeFiltersCount = category.length + level.length + duration.length + rating.length;

   return (
      <div className="space-y-8 p-6">
         {/* Search and Filters */}
         <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
               <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
            </div>
            <button
               onClick={() => setIsFilterOpen(!isFilterOpen)}
               className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
               <Filter className="w-5 h-5" />
               Filters
               {activeFiltersCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{activeFiltersCount}</span>
               )}
            </button>
         </div>

         {/* Filters Panel */}
         {isFilterOpen && (
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                     onClick={() => {
                        setCategory([]);
                        setLevel([]);
                        setDuration([]);
                        setRating([]);
                     }}
                     className="text-blue-500 hover:text-blue-700"
                  >
                     Clear All
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                     <h4 className="font-medium mb-3">Category</h4>
                     {categories.map((c) => (
                        <label key={c} className="flex items-center gap-2 mb-2 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={category.includes(c)}
                              onChange={() => toggleFilter(c, category, setCategory)}
                              className="rounded"
                           />
                           <span>{c}</span>
                        </label>
                     ))}
                  </div>
                  <div>
                     <h4 className="font-medium mb-3">Difficulty</h4>
                     {levels.map((l) => (
                        <label key={l} className="flex items-center gap-2 mb-2 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={level.includes(l)}
                              onChange={() => toggleFilter(l, level, setLevel)}
                              className="rounded"
                           />
                           <span>{l}</span>
                        </label>
                     ))}
                  </div>
                  <div>
                     <h4 className="font-medium mb-3">Duration</h4>
                     {durations.map((d) => (
                        <label key={d} className="flex items-center gap-2 mb-2 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={duration.includes(d)}
                              onChange={() => toggleFilter(d, duration, setDuration)}
                              className="rounded"
                           />
                           <span>{d}</span>
                        </label>
                     ))}
                  </div>
                  <div>
                     <h4 className="font-medium mb-3">Rating</h4>
                     {ratings.map((r) => (
                        <label key={r} className="flex items-center gap-2 mb-2 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={rating.includes(r)}
                              onChange={() => toggleFilter(r, rating, setRating)}
                              className="rounded"
                           />
                           <span>{r}</span>
                        </label>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* Courses Grid */}
         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                     <div className="h-48 bg-gray-200 rounded mb-4"></div>
                     <div className="h-4 bg-gray-200 rounded mb-2"></div>
                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
               ))}
            </div>
         ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {courses.map((course) => (
                  <div key={course.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                     <Link href={`/courses/${course.id}`}>
                        <div className="relative h-48">
                           {course.thumbnail ? (
                              <Image
                                 src={course.thumbnail}
                                 alt={course.title}
                                 fill
                                 className="object-cover"
                              />
                           ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                 <User className="w-12 h-12 text-gray-400" />
                              </div>
                           )}
                        </div>
                     </Link>
                     <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600">{course.rating.toFixed(1)}</span>
                           </div>
                           <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{Math.floor(course.totalDuration / 60)}h {course.totalDuration % 60}m</span>
                           </div>
                        </div>
                        <Link href={`/courses/${course.id}`}>
                           <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-blue-600">{course.title}</h3>
                        </Link>
                        <p className="text-sm text-emerald-600 font-bold mb-2">SARTHI Originals</p>
                        <div className="flex items-center justify-between">
                           <span className="text-lg font-bold text-green-600">
                               {course.isFree ? 'Free' : `$${course.price}`}
                           </span>
                           <button
                              onClick={() => handleEnroll(course.id)}
                              disabled={enrolling === course.id}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                           >
                              {enrolling === course.id ? 'Enrolling...' : 'Enroll'}
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-12">
               <p className="text-gray-500">No courses found matching your criteria.</p>
            </div>
         )}
      </div>
   );
}

