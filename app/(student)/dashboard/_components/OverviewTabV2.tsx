'use client';

import React, { useState } from 'react';
import {
    Search, Bell, BookOpen, Clock, CheckCircle, Trophy,
    Calendar, Video, ArrowRight, Sparkles, Star, TrendingUp, Terminal,
    MessageSquare, X
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import StatCard from '@/components/teacher/dashboard/StatCard';

const ActivityCharts = dynamic(() => import('./ActivityCharts'), {
    ssr: false,
    loading: () => <div className="h-[400px] shimmer rounded-[32px] w-full" />
});

const AssignmentsTable = dynamic(() => import('./AssignmentsTable'), {
    loading: () => <div className="h-[300px] shimmer rounded-[32px] w-full" />
});



interface OverviewTabV2Props {
    data: any;
    isLoading?: boolean;
}

const DAILY_VISIONS = [
    { quote: "Sunday Reset: Reflection fuels breakthroughs. Review your week's progress and set the bar higher for tomorrow.", tag: "Sunday Vision" },
    { quote: "SARTHI is not about competing with others; it's about outshipping your past self. Build something that matters today.", tag: "Monday Vision" },
    { quote: "Consistency is the super-power of top engineers. Small, deliberate practice every single day compounds into mastery.", tag: "Tuesday Vision" },
    { quote: "Mid-week momentum: Don't wait for permission to innovate. Write clean code, solve tough problems, and own your growth.", tag: "Wednesday Vision" },
    { quote: "Ship with pride, learn with humility. Every error message is just feedback guiding you toward the optimal solution.", tag: "Thursday Vision" },
    { quote: "Finish strong. The discipline you build when no one is watching defines the engineer you become when everyone is.", tag: "Friday Vision" },
    { quote: "Weekend Deep Dive: Mastery requires curiosity beyond the curriculum. Explore new concepts, experiment, and build.", tag: "Saturday Vision" }
];

export default function OverviewTabV2({ data, isLoading }: OverviewTabV2Props) {
    const userFirstName = data?.user?.name?.split(' ')[0] || 'Student';
    const unreadCount = data?.stats?.unreadNotifications || 0;
    const currentDayIndex = new Date().getDay();
    const todayVision = DAILY_VISIONS[currentDayIndex];

    const [ambassadorProfile, setAmbassadorProfile] = React.useState<any>(null);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    React.useEffect(() => {
        const checkAmbassador = async () => {
            try {
                const res = await fetch('/api/student-ambassadors/me');
                if (res.ok) {
                    const data = await res.json();
                    if ((data.status === 'APPROVED' || data.status === 'PENDING') && data.application) {
                        setAmbassadorProfile({ ...data.application, status: data.status });
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        checkAmbassador();
    }, []);

    return (
        <main className="min-h-screen bg-[#F8FAFC] px-4 md:px-10 pb-20 relative overflow-hidden pt-6" id="main-content">
            {/* Top Ambient Glows */}
            <div className="pointer-events-none absolute -top-20 right-10 w-72 h-72 bg-emerald-200/30 blur-[90px] rounded-full" />
            <div className="pointer-events-none absolute top-72 -left-20 w-72 h-72 bg-indigo-200/20 blur-[100px] rounded-full" />

            {/* Header Section with Standardized Typography and Quick Telemetry */}
            <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-10">
                <div className="space-y-1.5 text-left relative">
                    <div className="flex items-center gap-2 mb-4 sm:mb-5">
                        <div className="h-2 w-6 bg-emerald-500 rounded-full" />
                        <span className="text-xs sm:text-sm font-black text-emerald-600 uppercase tracking-[0.25em]">STUDENT ENGINE</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[0.95]">
                        Welcome back, <span className="text-emerald-500">{userFirstName}</span>
                    </h1>
                    <p className="text-slate-600 font-bold text-sm sm:text-base lg:text-lg mt-2 font-sans not-italic">
                        Real-time learning telemetry, active workflows, and course performance.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3.5">
                    {/* Student Feedback Trigger Button */}
                    <button 
                        onClick={() => setIsFeedbackOpen(true)}
                        className="hidden sm:flex items-center gap-3 bg-white hover:bg-emerald-50/50 border border-[#EAF0F7] hover:border-emerald-200 rounded-2xl px-4 py-2.5 shadow-xs transition-all group text-left cursor-pointer active:scale-95"
                    >
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center font-black text-xs shrink-0 transition-all">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black text-slate-400 group-hover:text-emerald-700 uppercase tracking-widest block leading-none transition-colors">Feedback &amp; Ideas</span>
                            <span className="text-xs font-black text-slate-900 leading-tight block mt-0.5">
                                Share Feedback
                            </span>
                        </div>
                    </button>

                    <Link href="/dashboard/courses" className="bg-[#1B4332] text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#2D6A4F] transition-all shadow-xl shadow-emerald-900/10 active:scale-95">
                        <BookOpen className="w-4 h-4" />
                        My Courses
                    </Link>
                </div>
            </header>

            {/* Student Feedback Modal */}
            {isFeedbackOpen && (
                <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white border border-[#EAF0F7] rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-left relative animate-scaleUp">
                        <button 
                            onClick={() => setIsFeedbackOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-1.5 w-5 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em]">STUDENT VOICE</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Share Your Feedback</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Help us improve your SARTHI learning engine. Share bug reports, feature ideas, or rate your experience!
                            </p>
                        </div>

                        {feedbackSubmitted ? (
                            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-2 animate-fadeIn">
                                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-bold">
                                    ✓
                                </div>
                                <h4 className="text-base font-black text-emerald-900 uppercase">Thank You!</h4>
                                <p className="text-xs text-emerald-700 font-medium">
                                    Your {rating}-star rating and feedback have been logged with our curriculum &amp; product team.
                                </p>
                                <button 
                                    onClick={() => {
                                        setIsFeedbackOpen(false);
                                        setFeedbackSubmitted(false);
                                        setFeedbackText('');
                                    }}
                                    className="mt-3 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form 
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!feedbackText.trim()) return;
                                    try {
                                        await fetch('/api/feedback', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ feedback: feedbackText, rating, page: 'dashboard' })
                                        }).catch(() => {});
                                    } catch (err) {}
                                    setFeedbackSubmitted(true);
                                }} 
                                className="space-y-4"
                            >
                                {/* 5-Star Rating Selector */}
                                <div className="space-y-1.5 text-left bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            Rate Your Experience
                                        </label>
                                        <span className="text-xs font-black text-amber-500">
                                            {hoverRating || rating} / 5 Stars
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="p-1 text-amber-400 hover:scale-110 active:scale-95 transition-all focus:outline-none"
                                                title={`${star} Star`}
                                            >
                                                <Star 
                                                    className={cn(
                                                        "w-6 h-6 transition-all",
                                                        (hoverRating ? star <= hoverRating : star <= rating)
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "text-slate-300 fill-slate-100"
                                                    )} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <textarea 
                                    rows={4}
                                    required
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Type your feedback, suggestions, or issues here..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                                />
                                <div className="flex justify-end gap-3 pt-1">
                                    <button 
                                        type="button"
                                        onClick={() => setIsFeedbackOpen(false)}
                                        className="px-5 py-3 rounded-xl text-xs font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-wider"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-6 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
                                    >
                                        Submit Feedback
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Full-Width Stat Cards Row (Spans across all 12 columns so cards spread out gracefully) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 w-full">
                <StatCard
                    title="Enrolled Courses"
                    value={data?.stats?.totalCourses ?? data?.stats?.coursesEnrolled ?? data?.enrolledCourses?.length ?? 0}
                    icon={BookOpen}
                    color="emerald"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Active Now"
                    value={data?.stats?.activeCourses || 0}
                    icon={TrendingUp}
                    color="blue"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Completed"
                    value={data?.stats?.completedCourses || 0}
                    icon={CheckCircle}
                    color="amber"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Weekly Study"
                    value={`${data?.stats?.weeklyMinutes ? Math.round(data.stats.weeklyMinutes / 60) : 0}h`}
                    icon={Clock}
                    color="indigo"
                    isLoading={isLoading}
                />
            </div>

            {/* Content & Sidebar Grid System (9 Cols Left, 3 Cols Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content (9 Cols) */}
                <div className="lg:col-span-9 space-y-10">
                    {/* Today's Schedule Card */}
                    <section className="bg-white rounded-[32px] p-8 border border-[#EAF0F7] shadow-[0_12px_35px_rgba(15,23,42,0.06)] overflow-hidden w-full" aria-labelledby="schedule-heading">
                        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center relative">
                                    <Video className="w-6 h-6" />
                                    {data?.upcomingLessons?.some((l: any) => l.isLiveNow) && (
                                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <h2 id="schedule-heading" className="text-xl font-black text-slate-900 tracking-tight uppercase">LIVE SCHEDULE</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">Upcoming live sessions</p>
                                </div>
                            </div>
                            <Link href="/dashboard/live" className="text-xs font-black text-[#1B4332] uppercase tracking-widest hover:text-[#2D6A4F] flex items-center gap-1.5 transition-colors">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="min-h-[160px]" aria-busy={isLoading} aria-live="polite">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <div className="h-16 w-full bg-slate-100 rounded-2xl animate-pulse" />
                                    <div className="h-16 w-full bg-slate-100 rounded-2xl animate-pulse opacity-50" />
                                </div>
                            ) : data?.upcomingLessons?.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="divide-y divide-slate-100" role="list">
                                        {data.upcomingLessons.slice(0, 3).map((lesson: any) => (
                                            <div key={lesson.id} className="py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group px-2 rounded-xl" role="listitem">
                                                <div className="flex items-center gap-4 min-w-0 pr-4">
                                                    <div className="w-12 h-12 bg-white border border-[#EAF0F7] rounded-xl flex items-center justify-center p-2 shadow-xs shrink-0">
                                                        <Image 
                                                            src="/sarthi-logo.png" 
                                                            alt="SARTHI Logo" 
                                                            width={28} 
                                                            height={28} 
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {lesson.isLiveNow && (
                                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500 text-[8px] font-black text-white rounded-full uppercase tracking-widest animate-pulse shrink-0">
                                                                    Live Now
                                                                </span>
                                                            )}
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">{lesson.courseName}</span>
                                                        </div>
                                                        <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase line-clamp-1">{lesson.title}</h3>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={lesson.isLiveNow ? `/live/${lesson.id}` : `/dashboard/live`}
                                                    className={cn(
                                                        "px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center active:scale-95 shrink-0",
                                                        lesson.isLiveNow
                                                            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600"
                                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                    )}
                                                >
                                                    {lesson.isLiveNow ? 'JOIN NOW' : 'DETAILS'}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>

                                    {data.upcomingLessons.length > 3 && (
                                        <div className="pt-3 border-t border-slate-100 text-center">
                                            <Link href="/dashboard/live" className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">
                                                Showing 3 of {data.upcomingLessons.length} sessions • View all schedule →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-10 px-6 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <div className="w-12 h-12 bg-white border border-slate-200/60 rounded-2xl flex items-center justify-center shadow-xs">
                                        <Calendar className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-800 tracking-tight uppercase">No Live Classes Scheduled</h3>
                                        <p className="text-slate-500 font-bold text-xs mt-1 max-w-sm">You&apos;re all caught up for now. Your upcoming sessions will appear here when available.</p>
                                        <Link href="/dashboard/live" className="inline-flex mt-4 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                                            View All Schedule
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Activity Section */}
                    <section aria-labelledby="activity-heading">
                        <ActivityCharts
                            dailyActivity={data?.stats?.dailyActivity}
                            learningScore={data?.stats?.learningScore}
                            performanceScore={data?.stats?.performanceScore}
                            performanceHistory={data?.stats?.performanceHistory}
                            attendanceStats={data?.attendanceStats}
                            performanceStats={data?.performanceStats}
                        />
                    </section>
                </div>

                {/* Right Sidebar (3 Cols) */}
                <aside className="lg:col-span-3 space-y-8">
                    {/* Dynamic 7-Day Cycle Daily Vision / Inspiration */}
                    <div className="bg-gradient-to-br from-[#FFF9F0] via-[#FFF8EC] to-[#F7EEDD] rounded-[28px] p-6 text-slate-900 overflow-hidden relative group shadow-[0_12px_30px_rgba(148,120,60,0.1)] border border-[#EEDFBF]">
                        <div className="relative z-10">
                            {/* SARTHI Logo + Daily Vision in one single line */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 shrink-0">
                                    <Image src="/sarthi-logo.png" alt="SARTHI" width={24} height={24} className="w-full h-full object-contain" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/70 leading-none">Daily Vision — {todayVision.tag}</p>
                            </div>
                            <p className="text-sm font-bold leading-relaxed text-amber-950 italic">
                                &quot;{todayVision.quote}&quot;
                            </p>
                            <div className="mt-5 flex items-center gap-3">
                                <div className="h-[1px] w-6 bg-amber-300" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-amber-800">Learner Mindset</span>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-amber-400/10 rounded-full blur-[70px]" />
                    </div>

                    {/* Student Ambassador Widget */}
                    {ambassadorProfile && (
                        <div className="bg-white rounded-[32px] p-8 border border-[#EAF0F7] shadow-[0_12px_35px_rgba(15,23,42,0.06)] relative overflow-hidden">
                            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Student Ambassador</h4>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug mb-2">
                                {ambassadorProfile.status === 'PENDING' ? 'Application Under Review' : 'Campus Drive Active'}
                            </h3>
                            <p className="text-slate-500 text-xs font-medium mb-6">
                                {ambassadorProfile.status === 'PENDING' 
                                    ? 'Our team is reviewing your ambassador application.'
                                    : `Referral Code: ${ambassadorProfile.referralCode}`}
                            </p>
                            <Link href="/dashboard/ambassador" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-[0.2em] flex items-center gap-1.5 transition-colors">
                                View Portal <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    )}

                    {/* Quick Direct Workflows */}
                    <div className="bg-white rounded-[32px] p-8 border border-[#EAF0F7] shadow-[0_12px_35px_rgba(15,23,42,0.06)] space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">DIRECT WORKFLOWS</h3>
                            <p className="text-xl font-black text-slate-900 tracking-tight">Quick Actions</p>
                        </div>

                        <div className="space-y-3">
                            <Link href="/dashboard/courses" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-slate-200">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[12px] font-black text-slate-900 tracking-tight leading-none mb-1.5">My Courses</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Continue modules</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link href="/dashboard/assignments" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-slate-200">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                    <CheckCircle className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[12px] font-black text-slate-900 tracking-tight leading-none mb-1.5">Assignments</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Submit tasks</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link href="/dashboard/live" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-slate-200">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                    <Video className="w-4.5 h-4.5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[12px] font-black text-slate-900 tracking-tight leading-none mb-1.5">Live Classes</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Join interactive sessions</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Full-Width Active Workflows Section (Spans all 12 columns to eliminate empty right-side space) */}
            <section className="mt-10 w-full" aria-labelledby="assignments-heading">
                <AssignmentsTable assignments={data?.assignments} isLoading={isLoading} />
            </section>
        </main>
    );
}


/* Mobile-Specific Overrides */
<style jsx>{`
    @media (max-width: 768px) {
        .glass-card {
            margin: 0;
            border-radius: 16px;
            padding: 16px;
        }

        .stats-grid {
            gap: 12px;
        }

        .stats-card {
            padding: 16px;
            border-radius: 16px;
        }

        .stats-card h3 {
            font-size: 24px;
        }

        .lesson-card {
            padding: 16px;
            border-radius: 16px;
        }

        .lesson-time {
            width: 48px;
            height: 48px;
            font-size: 10px;
        }

        .lesson-title {
            font-size: 16px;
            line-height: 1.3;
        }

        /* Improve touch targets */
        button, a[role="button"] {
            min-height: 44px;
            min-width: 44px;
        }

        /* Better text readability */
        .lesson-meta {
            font-size: 11px;
        }

        /* Reduce motion for mobile performance */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    }

    /* Safe area support for mobile devices */
    @supports (padding: max(0px)) {
        .safe-area-top {
            padding-top: max(16px, env(safe-area-inset-top));
        }

        .safe-area-bottom {
            padding-bottom: max(16px, env(safe-area-inset-bottom));
        }
    }
`}</style>
