'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
    BookOpen, PlayCircle, Trophy, Clock, Search, 
    ArrowRight, Sparkles, Filter, LayoutGrid, MoreVertical,
    Play, ArrowUpRight, Award, Share2, RotateCcw, 
    Download, Link as LinkIcon, Trash2, Star
} from 'lucide-react';
import Image from 'next/image';
import ConnectionError from '@/components/dashboard/ConnectionError';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';

export default function MyCoursesPage() {
    const [data, setData] = useState({ 
        stats: { enrolled: 0, active: 0, completed: 0, timeStudied: 0 }, 
        courses: [] 
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All Courses');

    const fetchCoursesData = async () => {
        try {
            setLoading(true);
            setError(false);
            const response = await fetch('/api/student/my-courses', { 
                cache: 'no-store',
                headers: { 'Accept': 'application/json' }
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid response format.');
            }

            const json = await response.json();
            if (!response.ok || !json.success) {
                throw new Error(json.error || 'Failed to fetch.');
            }
            setData(json.data);
        } catch (err) {
            console.error('Courses Page Error:', err);
            setError(true);
            setData({ stats: { enrolled: 0, active: 0, completed: 0, timeStudied: 0 }, courses: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoursesData();

        // Real-time Update: Re-fetch when user refocuses the tab
        const handleFocus = () => {
            console.log('📚 Courses Refocus: Syncing library...');
            fetchCoursesData();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    if (error) return <ConnectionError onRetry={fetchCoursesData} />;

    if (loading) {
        return (
            <div className="min-h-screen dashboard-container-glass flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-[#174F3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[#174F3A] font-black uppercase tracking-widest text-xs">Loading Courses...</p>
                </div>
            </div>
        );
    }

    const { stats, courses } = data;

    const filteredCourses = (courses || []).filter((course: any) => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             course.instructor?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (activeTab === 'In Progress') return matchesSearch && (course.progress || 0) > 0 && (course.progress || 0) < 100;
        if (activeTab === 'Completed') return matchesSearch && (course.progress || 0) === 100;
        if (activeTab === 'Bookmarks') return matchesSearch && course.isBookmarked;
        return matchesSearch;
    });

    return (
        <div className="w-full bg-transparent p-3 sm:p-4 lg:p-10 pb-24 lg:pb-20 space-y-8 sm:space-y-12 min-h-screen">
            {/* Header Section */}
            <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8">
                <div className="space-y-1.5 text-left relative">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-5 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">LEARNING CATALOG</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
                        MY <span className="text-emerald-500">COURSES</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
                        Track your active learning journey and continue mastering tech modules.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search your library..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none transition-all text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>
                    <Link 
                        href="/courses" 
                        className="px-6 py-3.5 bg-[#1B4332] text-white rounded-xl font-black text-xs uppercase tracking-[0.15em] hover:bg-[#2D6A4F] transition-all flex items-center gap-2 shadow-xl shadow-emerald-900/10 active:scale-95"
                    >
                        Explore More <ArrowRight size={14} />
                    </Link>
                </div>
            </header>

            <div className="max-w-[1600px] mx-auto space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatsCard title="Enrolled" value={stats?.enrolled || 0} icon={BookOpen} color="#10B981" />
                    <StatsCard title="Active" value={stats?.active || 0} icon={PlayCircle} color="#3B82F6" />
                    <StatsCard title="Finished" value={stats?.completed || 0} icon={Trophy} color="#F59E0B" />
                    <StatsCard title="Total Hours" value={`${stats?.timeStudied || 0}h`} icon={Clock} color="#6366F1" />
                </div>

                {/* Filter Hub */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 overflow-x-auto no-scrollbar max-w-full">
                        {['All Courses', 'In Progress', 'Completed', 'Bookmarks'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    activeTab === tab 
                                        ? "bg-[#1B4332] text-white shadow-md shadow-emerald-900/10" 
                                        : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                                    )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Course Grid */}
                <AnimatePresence mode="wait">
                    {filteredCourses.length > 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10"
                        >
                            {filteredCourses.map((course: any, idx: number) => (
                                <CourseCard key={course.id} course={course} index={idx} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-40 text-center space-y-8 max-w-4xl mx-auto w-full"
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                                <BookOpen className="w-12 h-12 text-slate-300" />
                             </div>
                             <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tighter font-outfit uppercase italic leading-none">Your library is empty</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 px-6 max-w-md mx-auto leading-relaxed">You haven&apos;t enrolled in any courses yet. Start your journey below.</p>
                             </div>
                             <Link 
                                href="/courses" 
                                className="px-8 py-4 bg-[#174F3A] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#113b2b] transition-all flex items-center gap-3 shadow-lg shadow-[#174F3A]/20 active:scale-95 inline-flex"
                             >
                                START LEARNING <Sparkles className="w-4 h-4" />
                             </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function CourseCard({ course, index }: { course: any, index: number }) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const progress = course.progress || 0;
    
    // Close menu on outside click
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        ...(progress === 100 ? [
            { label: 'Revisit Course', icon: PlayCircle, color: 'text-white/80 hover:text-white hover:bg-white/10' },
            { label: 'Download Certificate', icon: Award, color: 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' },
            { label: 'Share Achievement', icon: Share2, color: 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10' },
        ] : progress > 0 ? [
            { label: 'Continue Course', icon: Play, color: 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' },
            { label: 'Restart Module', icon: RotateCcw, color: 'text-white/80 hover:text-white hover:bg-white/10' },
            { label: 'Mark as Favorite', icon: Star, color: 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' },
        ] : [
            { label: 'Start Course', icon: Play, color: 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' },
            { label: 'View Syllabus', icon: BookOpen, color: 'text-white/80 hover:text-white hover:bg-white/10' },
            { label: 'Favorite', icon: Star, color: 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' },
        ]),
        { label: 'Download Resources', icon: Download, color: 'text-white/80 hover:text-white hover:bg-white/10' },
        { label: 'Share Course', icon: LinkIcon, color: 'text-white/80 hover:text-white hover:bg-white/10' },
        { type: 'divider' },
        { label: 'Unenroll', icon: Trash2, color: 'text-rose-500 hover:text-rose-400 hover:bg-rose-500/10' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-[42px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col overflow-visible"
        >
            {/* Animated Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#174F3A]/5 via-transparent to-[#174F3A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-[42px]" />

            {/* Cinematic Image Section */}
            <div className="relative aspect-[16/11] overflow-hidden m-3.5 rounded-[32px] shadow-sm">
                <Image 
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800'} 
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    priority
                    unoptimized
                />
                
                {/* Quick Action Overlay (Hover Only) */}
                <div className="absolute top-5 right-5 flex gap-2.5 translate-y-[-12px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:scale-110 shadow-sm transition-all duration-300">
                        <Star size={15} fill={course.isBookmarked ? "currentColor" : "none"} className={cn(course.isBookmarked ? "text-amber-500 fill-amber-500" : "")} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-8 pb-8 pt-4 flex-1 flex flex-col relative">
                {/* Badges Row */}
                <div className="flex items-center gap-2 mb-3">
                     <span className="px-3 py-1 bg-slate-100 rounded-xl text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] border border-slate-200/50">
                        ORIGINAL
                    </span>
                    {progress === 100 && (
                        <span className="px-3 py-1 bg-[#174F3A]/10 rounded-xl text-[#174F3A] text-[9px] font-black uppercase tracking-[0.2em] border border-[#174F3A]/20">
                            COMPLETED
                        </span>
                    )}
                </div>

                {/* Course Title */}
                <h3 className="text-xl font-bold text-slate-900 line-clamp-2 leading-tight tracking-tight mb-5 font-outfit uppercase italic">
                    {course.title}
                </h3>

                {/* Instructor Row */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] leading-none mb-1">PRO INSTRUCTOR</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[13px] text-slate-800 font-black tracking-tight">{course.instructor || 'Academy Instructor'}</span>
                                <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center p-[2px] shadow-sm">
                                    <svg viewBox="0 0 24 24" fill="white" className="w-full h-full"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Action Hub (3 Dots) */}
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all duration-300"
                        >
                            <MoreVertical size={20} />
                        </button>

                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-3 w-60 bg-white border border-slate-200 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] py-3 z-50 overflow-hidden"
                                >
                                    {menuItems.map((item, idx) => (
                                        item.type === 'divider' ? (
                                            <div key={idx} className="h-px bg-slate-100 my-2 mx-3" />
                                        ) : (
                                            <button
                                                key={idx}
                                                className={cn(
                                                    "w-full flex items-center gap-3.5 px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 group/item",
                                                    item.color.includes('text-white') ? item.color.replace('text-white/80', 'text-slate-600').replace('text-white', 'text-slate-800').replace('hover:bg-white/10', 'hover:bg-slate-50') : item.color
                                                )}
                                            >
                                                <item.icon size={14} className="transition-transform group-hover/item:scale-125" />
                                                {item.label}
                                            </button>
                                        )
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Metadata Pill Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 transition-colors duration-500">
                        <Clock size={14} className="text-[#174F3A]" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">12H CONTENT</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 transition-colors duration-500">
                        <PlayCircle size={14} className="text-[#174F3A]" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">48 LESSONS</span>
                    </div>
                </div>

                {/* Tactile Progress Section */}
                <div className="mt-auto space-y-5">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className={cn(
                                "transition-colors duration-500 px-2.5 py-1 rounded-lg",
                                progress > 0 ? "bg-[#174F3A]/5 text-[#174F3A]" : "bg-slate-100 text-slate-400"
                            )}>
                                {progress === 100 ? 'SUCCESSFULLY COMPLETED' : (progress > 0 ? 'CONTINUE VOYAGE' : 'NOT STARTED YET')}
                            </span>
                            <span className="text-slate-800 font-black tracking-tighter">{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100/50 rounded-full overflow-hidden p-[3px] shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 2, ease: "circOut" }}
                                className="h-full bg-gradient-to-r from-[#174F3A] to-emerald-400 rounded-full relative group-hover:shadow-[0_0_15px_rgba(23,79,58,0.3)] transition-shadow duration-500"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                            </motion.div>
                        </div>
                    </div>

                    {/* Elite CTA Button */}
                    <Link 
                        href={`/courses/${course.slug || course.id}/learn`}
                        className={cn(
                            "w-full py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.35em] flex items-center justify-center gap-3 transition-all duration-500 active:scale-95 shadow-xl overflow-hidden relative",
                            progress === 100 
                                ? "bg-gray-100 text-gray-400 border border-gray-200 shadow-none cursor-default" 
                                : "bg-[#174F3A] text-white hover:bg-[#11998E] hover:shadow-[0_20px_40px_rgba(23,79,58,0.25)] hover:-translate-y-1.5"
                        )}
                    >
                        {progress === 100 ? 'REVIEW COURSE' : (progress > 0 ? 'RESUME JOURNEY' : 'START LEARNING')}
                        <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
                        
                        {/* Button Shimmer Effect */}
                        {!progress && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        )}
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
    return (
        <div 
            className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            style={{ borderTop: `4px solid ${color}` }}
        >
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}10` }}>
                    <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-900 leading-none">{value}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{title}</p>
                </div>
            </div>
        </div>
    );
}
