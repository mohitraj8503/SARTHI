'use client';

import { Search, SlidersHorizontal, User, Star, Loader2, BookOpen, ArrowRight, ChevronDown, TrendingUp, DollarSign, Clock, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ExploreCourse } from '@/types/dashboard';

export default function TabExplore({ data: propData }: { data?: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  
  const [search, setSearch] = useState(q);
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSortOpen && !(event.target as Element).closest('.sort-dropdown')) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  const { data: fetchedData, isLoading, error } = useQuery<{ courses: ExploreCourse[] }>({
    queryKey: ['explore_courses', q, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('tab', 'explore');
      if (q) params.set('q', q);
      if (category !== 'All') params.set('category', category);
      
      const res = await fetch(`/api/student/dashboard?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch catalog');
      return res.json();
    },
    enabled: !propData || (q !== '' || category !== 'All')
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set('q', search);
    else params.delete('q');
    if (category !== 'All') params.set('category', category);
    else params.delete('category');
    router.push(`/dashboard?${params.toString()}`);
  };

  const courses = propData?.courses || fetchedData?.courses || [];
  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch = q === '' ||
        course.title.toLowerCase().includes(q.toLowerCase()) ||
        course.instructor.toLowerCase().includes(q.toLowerCase());
      const matchesCategory = category === 'All' || course.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.students || 0) - (a.students || 0);
        case 'price-low':
          const aPrice = a.price ? parseFloat(a.price.replace(/[^\d.]/g, '')) : 0;
          const bPrice = b.price ? parseFloat(b.price.replace(/[^\d.]/g, '')) : 0;
          return aPrice - bPrice;
        case 'price-high':
          const aPriceHigh = a.price ? parseFloat(a.price.replace(/[^\d.]/g, '')) : 0;
          const bPriceHigh = b.price ? parseFloat(b.price.replace(/[^\d.]/g, '')) : 0;
          return bPriceHigh - aPriceHigh;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:
          return 0; // Assume courses are already in newest order
      }
    });

  const categories = ['All', 'Development', 'Design', 'Business', 'Finance', 'Marketing', 'Photography'];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Clock },
    { value: 'popular', label: 'Popular', icon: TrendingUp },
    { value: 'price-low', label: 'Price: Low-High', icon: DollarSign },
    { value: 'price-high', label: 'Price: High-Low', icon: DollarSign },
    { value: 'rating', label: 'Top Rated', icon: Award },
  ];

  if (isLoading) {
    return (
        <div className="space-y-8">
          {/* Skeleton Header */}
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="h-14 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          {/* Skeleton Categories */}
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-xl animate-pulse px-5 py-2.5 w-20"></div>
            ))}
          </div>

          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-[20px] overflow-hidden min-h-[580px] w-full max-w-[380px] mx-auto animate-pulse">
                <div className="h-[240px] bg-gray-200"></div>
                <div className="p-8 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-12 bg-gray-200 rounded-lg w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Hero Section */}
      <div className="space-y-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
          <BookOpen className="w-4 h-4 text-green-600" />
          <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Explore Courses</span>
        </div>

        {/* Main Heading */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            MASTER PRODUCTION-GRADE <span className="text-green-600">SKILLS</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Join India&apos;s most practical, project-based learning ecosystem designed for career transformation.
          </p>
        </div>

        {/* Search Bar & Controls */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full h-14 pl-12 pr-6 bg-white border-2 border-transparent rounded-xl text-base focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 font-medium text-gray-900 placeholder:text-gray-400 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="h-14 px-6 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 hover:text-gray-900 flex items-center gap-3 text-sm font-bold shadow-sm transition-all border border-gray-200"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* Sorting Dropdown */}
            <div className="relative sort-dropdown">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="h-14 px-6 bg-white border border-gray-200 rounded-xl text-gray-700 hover:text-gray-900 flex items-center gap-3 text-sm font-bold shadow-sm hover:shadow-md transition-all"
              >
                <span>Sort by: {sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Sort Menu */}
              {isSortOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                          sortBy === option.value ? 'bg-green-50 text-green-700' : 'text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Filter Sidebar */}
      {isFilterOpen && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-900">Filter by Category</h3>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Subject Area</h4>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                      category === cat
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-300 group-hover:border-green-400'
                    }`}>
                      {category === cat && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className={`font-medium transition-colors ${
                      category === cat ? 'text-green-700' : 'text-gray-700 group-hover:text-green-600'
                    }`}>
                      {cat}
                    </span>
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={category === cat}
                      onChange={() => setCategory(cat)}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h4>
              <div className="space-y-3">
                {[
                  { label: '$0 - $5,000', value: '0-5000' },
                  { label: '$5,000 - $10,000', value: '5000-10000' },
                  { label: '$10,000+', value: '10000+' }
                ].map((range) => (
                  <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-green-400 transition-all">
                      {/* Placeholder for now - can implement price filtering later */}
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setCategory('All');
                  setIsFilterOpen(false);
                }}
                className="w-full py-3 px-6 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Pills (when sidebar is closed) */}
      {!isFilterOpen && (
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-xl border transition-all text-[13px] font-bold whitespace-nowrap flex-shrink-0 ${cat === category ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20' : 'bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Results Count */}
      {q && (
          <div className="text-sm font-medium text-muted-foreground">
              Found {filteredCourses.length} results for &quot;<span className="text-foreground font-bold">{q}</span>&quot;
          </div>
      )}

      {/* Course Grid */}
      <AnimatePresence mode="popLayout">
        {filteredCourses.length > 0 ? (
            <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
            {filteredCourses.map((course) => (
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={course.id}
                    className="group bg-white border border-gray-200 rounded-[20px] overflow-hidden hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-300 hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer min-h-[580px] w-full max-w-[380px] mx-auto"
                    onClick={() => router.push(`/courses/${course.slug || course.id}`)}
                >
                    {/* Course Image */}
                    <div className="h-[240px] bg-gray-100 relative overflow-hidden rounded-t-[20px]">
                        {course.thumbnail ? (
                            <Image
                                src={course.thumbnail}
                                alt={course.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-50">
                                <BookOpen className="w-16 h-16 text-green-400" />
                            </div>
                        )}
                        {/* Badge */}
                        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Advanced
                        </div>
                        {/* Level Badge */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-gray-700 border border-gray-200 shadow-sm">
                            {course.level || 'All Levels'}
                        </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-8 flex-1 flex flex-col">
                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-green-600 transition-colors line-clamp-2">
                        {course.title}
                        </h3>

                        {/* Instructor */}
                        <p className="text-sm text-gray-600 font-medium mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> {course.instructor || 'Unknown Instructor'}
                        </p>

                        {/* Description Preview */}
                        <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                        Complete mastery of essential skills for modern professionals...
                        </p>

                        {/* Divider */}
                        <div className="border-t border-gray-200 mb-6"></div>

                        {/* Price and Button */}
                        <div className="mt-auto flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-black text-gray-900">₹{course.price || 'Free'}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/courses/${course.slug || course.id}`);
                                  }}
                                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-600/20 flex items-center gap-2"
                                >
                                    ENROLL NOW <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
            </motion.div>
        ) : (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
            >
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No courses found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">We couldn&apos;t find anything matching &quot;{q}&quot;. Try using different keywords.</p>
                <button 
                onClick={() => { setSearch(''); setCategory('All'); router.push('/dashboard?tab=explore'); }} 
                className="mt-6 text-sm font-bold text-primary hover:underline"
                >
                    Clear search
                </button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

