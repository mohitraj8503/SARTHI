'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, 
    TrendingUp, 
    Users, 
    DollarSign,
    Download, 
    Calendar, 
    ChevronDown, 
    BookOpen,
    ArrowUpRight, 
    ArrowDownRight, 
    MoreVertical,
    Activity, 
    Star,
    IndianRupee,
    Filter,
    Plus,
    Activity as ActivityIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import StatCard from '@/components/teacher/dashboard/StatCard';
import RevenueChart from '@/components/teacher/dashboard/RevenueChart';

interface AnalyticsData {
    totalRevenue: number;
    activeStudents: number;
    enrollmentRate: number;
    avgRating: number;
    trends: {
        revenue: number;
        students: number;
        enrollment: number;
        rating: number;
    };
    revenueData: { date: string; amount: number }[];
    popularCourses: { name: string; students: number; revenue: string; trend: string }[];
    studentsAtRisk: { name: string; progress: number; lastActive: string; risk: string }[];
}

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState('Overview');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const { addToast } = useToast();

    const tabs = ['Overview', 'Students', 'Courses', 'Revenue'];

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const response = await fetch('/api/teacher/analytics');
                if (response.ok) {
                    const result = await response.json();
                    setData(result.success ? result.data : null);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    if (loading) return <AnalyticsSkeleton />;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Analytics Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-10 py-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-1 w-4 bg-orange-500 rounded-full" />
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">STUDIO ANALYTICS</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                                PERFORMANCE <span className="text-orange-500">AUDIT</span>
                            </h1>
                            <p className="text-sm text-slate-500 font-medium mt-3">Monitor your course growth and student engagement with real-time auditing and predictive insights.</p>
                        </div>

                        <button onClick={() => addToast({ type: 'success', title: 'Exporting...', message: 'Generating your performance report.' })} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                            <Download className="w-4.5 h-4.5" />
                            Download Audit Report
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Revenue"
                            value={`₹${(data?.totalRevenue || 0).toLocaleString()}`}
                            change={data?.trends?.revenue || 0}
                            icon={IndianRupee}
                            color="amber"
                        />
                        <StatCard 
                            title="Active Students"
                            value={(data?.activeStudents || 0).toLocaleString()}
                            change={data?.trends?.students || 0}
                            icon={Users}
                            color="blue"
                        />
                        <StatCard 
                            title="Enrollment Rate"
                            value={`${data?.enrollmentRate || 0}%`}
                            change={data?.trends?.enrollment || 0}
                            icon={ActivityIcon}
                            color="emerald"
                        />
                        <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center text-center border-dashed border-2">
                           <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Syncing</span>
                           </div>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Data Accurate as of Now</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 mt-10">
                {/* Filters & Tabs Bar */}
                <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm flex items-center justify-between mb-8">
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                    activeTab === tab 
                                        ? "bg-white text-slate-900 shadow-sm border border-slate-100" 
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <select className="appearance-none bg-slate-50 border border-slate-100 rounded-xl px-6 py-2.5 pr-10 text-[11px] font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer">
                                <option>Last 30 Days</option>
                                <option>Last 3 Months</option>
                                <option>Last Year</option>
                            </select>
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                        
                        <button className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 transition-colors">
                            <Filter className="w-4 h-4" />
                            Filter Data
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Main Chart Area */}
                    <div className="col-span-12 lg:col-span-8">
                        <RevenueChart data={data?.revenueData || []} />
                        
                        {/* Popular Courses Section */}
                        <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] mt-8">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">POPULAR CONTENT</h3>
                                </div>
                                <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View Detailed Stats</button>
                            </div>

                            <div className="space-y-6">
                                {(data?.popularCourses || []).map((course, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer p-4 hover:bg-slate-50 rounded-2xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">{course.name}</p>
                                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{course.students} Active Learners</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-900 tracking-tight">{course.revenue}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{course.trend}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Side Insights */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        {/* Audit Summary Card */}
                        <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                            <div className="relative z-10">
                                <h3 className="text-lg font-black text-white tracking-tight mb-8">Performance Summary</h3>
                                <div className="space-y-6">
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Growth Score</p>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-black text-white tracking-tighter leading-none">84/100</p>
                                            <div className="flex items-center gap-1 text-emerald-400">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-xs font-black">+4.2</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Retention Rate</span>
                                            <span className="text-white">92%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[92%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full mt-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20">
                                    <ArrowUpRight className="w-4 h-4" />
                                    Optimize Growth
                                </button>
                            </div>
                        </div>

                        {/* Risk Monitor Card */}
                        <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Risk Monitor</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">ATTENTION REQUIRED</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {(data?.studentsAtRisk || []).map((student, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-black text-[10px]">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 tracking-tight group-hover:text-red-600 transition-colors">{student.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{student.progress}% Progress</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            student.risk === 'High' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                                        )}>
                                            {student.risk} Risk
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function AnalyticsSkeleton() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] p-10 animate-pulse">
            <div className="max-w-[1600px] mx-auto space-y-10">
                <div className="h-60 bg-white rounded-[32px]" />
                <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-[32px]" />)}
                </div>
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-8 h-96 bg-white rounded-[32px]" />
                    <div className="col-span-4 h-96 bg-white rounded-[32px]" />
                </div>
            </div>
        </div>
    );
}

