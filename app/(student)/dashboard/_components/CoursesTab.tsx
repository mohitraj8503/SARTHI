'use client';

import React, { useState } from 'react';
import { 
    BookOpen, PlayCircle, CheckCircle, Clock, Search, 
    MoreVertical, Play, ArrowRight, ArrowUpRight, Sparkles, Trophy,
    TrendingUp, Star, Filter, LayoutGrid, List
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CoursesTabProps {
    enrolledCourses: any[];
}

export default function CoursesTab({ enrolledCourses = [] }: CoursesTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All Courses');

    // Stats calculation
    const totalEnrolled = enrolledCourses.length;
    const inProgress = enrolledCourses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length;
    const completed = enrolledCourses.filter(c => (c.progress || 0) === 100).length;
    const totalHours = "12h"; 

    const filteredCourses = enrolledCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             course.instructor?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (activeTab === 'In Progress') return matchesSearch && (course.progress || 0) > 0 && (course.progress || 0) < 100;
        if (activeTab === 'Completed') return matchesSearch && (course.progress || 0) === 100;
        if (activeTab === 'Bookmarks') return matchesSearch && course.isBookmarked;
        return matchesSearch;
    });

    return (
        <div className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-6 lg:space-y-12 bg-[#FAF9F6] lg:bg-transparent min-h-screen relative overflow-hidden">
            {/* Mobile Mesh Gradient Background */}
            <div className="lg:hidden absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-[#174F3A]/5 via-transparent to-transparent pointer-events-none -z-10" />
            <div className="lg:hidden absolute top-[10%] -left-20 w-64 h-64 bg-[#D4915C]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            {/* Mobile Search Bar - Always Visible */}
            <div className="md:hidden">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-4 focus:ring-[#174F3A]/5 outline-none transition-all text-base font-medium"
                    />
                </div>
            </div>

            {/* Header Section */}
            <header className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-8">
                <div className="space-y-1 relative">
                    <div className="lg:hidden absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#174F3A] rounded-r-full" />
                    <h1 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter font-outfit italic uppercase leading-none flex items-center gap-4">
                        My <span className="text-[#174F3A]">Courses</span>
                        <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-transparent rounded-full mt-2 hidden md:block" />
                    </h1>
                    <p className="text-[#174F3A]/60 font-bold text-[10px] lg:text-xs uppercase tracking-[0.2em] mt-2">
                        Everything you are learning in one place
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search your library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-4 focus:ring-[#174F3A]/5 outline-none transition-all text-sm font-medium"
                        />
                    </div>
                    <Link
                        href="/courses"
                        className="px-6 lg:px-8 py-4 bg-[#174F3A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#174F3A]/10 hover:scale-105 transition-all flex items-center gap-2 min-h-[48px]"
                    >
                        Explore More <ArrowRight size={14} />
                    </Link>
                </div>
            </header>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                <StatsCard title="ENROLLED" value={totalEnrolled} icon={BookOpen} color="#22C55E" />
                <StatsCard title="ACTIVE" value={inProgress} icon={PlayCircle} color="#3B82F6" />
                <StatsCard title="FINISHED" value={completed} icon={Trophy} color="#F59E0B" />
                <StatsCard title="BOOKMARKS" value={enrolledCourses.filter(c => c.isBookmarked).length} icon={Star} color="#8B5CF6" />
            </div>

            {/* Mobile-Optimized Filter Hub */}
            <div className="flex flex-col gap-4 lg:gap-6 border-b border-gray-100 pb-6 lg:pb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 lg:gap-3 bg-gray-50 p-1.5 rounded-[2rem] border border-gray-100 overflow-x-auto no-scrollbar max-w-full">
                        {['All Courses', 'In Progress', 'Completed', 'Bookmarks'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-5 lg:px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-h-[44px] active:scale-95",
                                    activeTab === tab
                                        ? "bg-[#174F3A] text-white shadow-lg shadow-[#174F3A]/20"
                                        : "text-gray-400 hover:text-gray-600 hover:bg-white"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-[#174F3A] transition-all min-h-[44px] min-w-[44px]" aria-label="Grid view">
                            <LayoutGrid size={20} />
                        </button>
                        <button className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-[#174F3A] transition-all min-h-[44px] min-w-[44px]" aria-label="Filter options">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Course Grid */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                    {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="py-16 lg:py-32 text-center space-y-6 lg:space-y-8 bg-white rounded-[2rem] lg:rounded-[3rem] border border-gray-100 shadow-sm max-w-4xl mx-auto p-6 lg:p-8">
                    <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <BookOpen className="w-8 h-8 lg:w-12 lg:h-12 text-gray-200" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight">Your catalog is quiet</h3>
                        <p className="text-gray-400 max-w-md mx-auto font-medium text-sm lg:text-base px-4">
                            {activeTab === 'Bookmarks'
                                ? "You haven't bookmarked any courses yet."
                                : "You haven't enrolled in any courses for this category yet."}
                        </p>
                    </div>
                    <Link href="/courses" className="inline-flex items-center gap-3 px-8 lg:px-10 py-4 lg:py-5 bg-[#174F3A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[3px] hover:scale-105 transition-all shadow-xl shadow-[#174F3A]/20 min-h-[48px]">
                        Start Learning <Sparkles className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}

function CourseCard({ course }: { course: any }) {
    const [isBookmarked, setIsBookmarked] = useState(course.isBookmarked);
    const [showMenu, setShowMenu] = useState(false);
    const progress = course.progress || 0;
    
    const toggleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await fetch('/api/student/courses/bookmark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: course.id })
            });
            const data = await res.json();
            if (data.success) {
                setIsBookmarked(data.bookmarked);
                setShowMenu(false);
            }
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
        }
    };

    return (
        <article className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#174F3A]/5 transition-all duration-500 flex flex-col relative" role="article" aria-labelledby={`course-${course.id}-title`}>
            {/* Thumbnail */}
            <div className="relative aspect-[16/10] overflow-hidden m-3 lg:m-4 rounded-[2rem]">
                <Image
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800'}
                    alt={`Course thumbnail for ${course.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Bookmark Badge */}
                {isBookmarked && (
                    <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30 text-white" aria-label="Bookmarked course">
                        <Star size={14} fill="currentColor" />
                    </div>
                )}

                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">
                        {course.category || 'Module'}
                    </div>
                    <Link href={`/courses/${course.slug || course.id}/learn`} className="p-3 bg-white rounded-full text-[#174F3A] shadow-xl" aria-label={`Start learning ${course.title}`}>
                        <Play size={16} fill="currentColor" />
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 lg:px-8 pb-6 lg:pb-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center relative">
                            {course.instructorImage ? (
                                <Image src={course.instructorImage} alt={`Photo of ${course.instructor || 'instructor'}`} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#174F3A]/5 flex items-center justify-center text-[#174F3A] font-bold text-[10px]">
                                    {course.instructor?.[0] || 'M'}
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{course.instructor || 'Lead Mentor'}</span>
                    </div>

                <h3 id={`course-${course.id}-title`} className="text-lg lg:text-xl font-black text-gray-900 line-clamp-2 leading-tight mb-4 lg:mb-6 group-hover:text-[#174F3A] transition-colors">
                    {course.title}
                </h3>

                <div className="mt-auto space-y-4 lg:space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[2px]">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-[#174F3A]">{progress}%</span>
                        </div>
                        <div className="h-2 lg:h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#174F3A] rounded-full transition-all duration-1000 group-hover:scale-x-105 origin-left"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <Link
                        href={`/courses/${course.slug || course.id}/learn`}
                        className={cn(
                            "w-full py-4 lg:py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[3px] flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 shadow-xl min-h-[48px]",
                            progress === 100
                                ? "bg-gray-50 text-gray-400 border border-gray-100 shadow-none"
                                : "bg-[#174F3A] text-white shadow-[#174F3A]/20 hover:shadow-[#174F3A]/40 hover:bg-[#1B4332]"
                        )}
                        aria-label={progress === 100 ? `Course ${course.title} completed` : progress > 0 ? `Continue learning ${course.title}` : `Start learning ${course.title}`}
                    >
                        {progress === 100 ? 'COURSE COMPLETED' : (progress > 0 ? 'CONTINUE JOURNEY' : 'START JOURNEY')}
                        <ArrowUpRight size={14} />
                    </Link>
                </div>
            </div>
        </article>
    );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
    return (
        <div 
            className="bg-white/80 backdrop-blur-xl p-6 lg:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white relative overflow-hidden group hover:-translate-y-2 transition-all duration-500"
            style={{ borderTop: `6px solid ${color}` }}
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-gray-50/50 -mr-12 -mt-12 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all" />
            <div className="flex items-center gap-4 lg:gap-6 relative z-10">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-[2rem] flex items-center justify-center shadow-lg bg-white" aria-hidden="true">
                    <Icon className="w-6 h-6 lg:w-8 lg:h-8" style={{ color }} />
                </div>
                <div>
                    <h3 className="text-2xl lg:text-4xl font-black text-gray-900 leading-none tracking-tighter font-outfit italic">{value}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{title}</p>
                </div>
            </div>
        </div>
    );
}

/* Mobile-First Optimizations */
<style jsx>{`
    @media (max-width: 768px) {
        .course-card {
            border-radius: 16px;
            margin: 0;
        }

        .course-thumbnail {
            margin: 12px;
            border-radius: 16px;
        }

        .course-content {
            padding: 16px;
        }

        .course-title {
            font-size: 16px;
            margin-bottom: 12px;
        }

        .course-description {
            font-size: 14px;
            margin-bottom: 16px;
        }

        .course-meta {
            padding-bottom: 16px;
            margin-bottom: 16px;
        }

        .course-button {
            padding: 14px 20px;
            font-size: 12px;
            min-height: 48px;
        }

        .progress-bar {
            height: 4px;
        }

        /* Touch-friendly interactions */
        .course-card {
            -webkit-tap-highlight-color: transparent;
        }

        .filter-tabs {
            scrollbar-width: none;
            -ms-overflow-style: none;
        }

        .filter-tabs::-webkit-scrollbar {
            display: none;
        }

        /* Better mobile grid */
        .courses-grid {
            gap: 16px;
        }

        /* Improve readability */
        .instructor-name {
            font-size: 11px;
        }

        /* Reduce motion for mobile performance */
        @media (prefers-reduced-motion: reduce) {
            .course-card {
                transition: none;
            }

            .course-thumbnail img {
                transition: none;
            }
        }
    }

    /* Safe area adjustments */
    @supports (padding: max(0px)) {
        @media (max-width: 768px) {
            .courses-container {
                padding-bottom: max(16px, env(safe-area-inset-bottom));
            }
        }
    }
`}</style>
