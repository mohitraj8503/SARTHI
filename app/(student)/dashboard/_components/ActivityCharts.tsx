'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell
} from 'recharts';
import { Info, CheckCircle2, XCircle, TrendingUp, Sparkles, Award, ArrowUpRight, Zap, Target, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceStats {
    percentage: number | null;
    status: string;
    color: string;
    trend: string;
    trendValue: string;
    sessionsText: string;
    totalSessions: number;
    attendedSessions: number;
    graphData: { day: string; present: boolean | null }[];
    insights: string;
    prediction: string;
}

interface PerformanceStats {
    percentage: number;
    level: string;
    trend: string;
    velocity: number;
    expectedHours: number;
    actualHours: number;
    strongAreas: string[];
    weakAreas: string[];
    summary: string;
    prediction: string;
    timeline: { week: string; value: number }[];
    breakdown: {
        quiz: { score: number; weight: number };
        assignments: { score: number; weight: number };
        projects: { score: number; weight: number };
        coding: { score: number; weight: number };
        attendance: { score: number; weight: number };
        consistency: { score: number; weight: number };
        completion: { score: number; weight: number };
    };
}

interface ActivityChartsProps {
    dailyActivity?: { day: string; minutes: number }[];
    performanceScore?: number;
    performanceHistory?: { month: string; value: number }[];
    attendanceStats?: AttendanceStats;
    performanceStats?: PerformanceStats;
}

export default function ActivityCharts({ 
    dailyActivity, 
    performanceScore, 
    performanceHistory,
    attendanceStats,
    performanceStats
}: ActivityChartsProps) {
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Fallbacks if stats not provided by backend
    const currentAttendance = attendanceStats || {
        percentage: 80,
        status: "Good",
        color: "blue",
        trend: "↑ Improving",
        trendValue: "+6%",
        sessionsText: "4 of 5 sessions",
        totalSessions: 5,
        attendedSessions: 4,
        graphData: [
            { day: 'Mon', present: true },
            { day: 'Tue', present: false },
            { day: 'Wed', present: true },
            { day: 'Thu', present: true },
            { day: 'Fri', present: true },
            { day: 'Sat', present: null },
            { day: 'Sun', present: null },
        ],
        insights: "You attended 4 of 5 learning sessions this week. Great consistency. Missing only one class could increase your attendance above 90%.",
        prediction: "Expected next week: 85% (Current Trend: 80%)"
    };

    const currentPerformance = performanceStats || {
        percentage: 89,
        level: "Excellent",
        trend: "↑ Improving",
        velocity: 140,
        expectedHours: 10,
        actualHours: 14,
        strongAreas: ["Python Basics", "Automation", "Web APIs"],
        weakAreas: ["Problem Solving", "OOP Concepts", "Recursion"],
        summary: "Your learning health is improving steadily. Project quality has increased significantly. Focus on object-oriented programming to cross the 90% mark.",
        prediction: "Expected next week: 92% (Current Trend: 89%)",
        timeline: [
            { week: "Week 1", value: 65 },
            { week: "Week 2", value: 71 },
            { week: "Week 3", value: 76 },
            { week: "Week 4", value: 84 },
            { week: "Week 5", value: 89 }
        ],
        breakdown: {
            quiz: { score: 92, weight: 25 },
            assignments: { score: 85, weight: 20 },
            projects: { score: 90, weight: 20 },
            coding: { score: 80, weight: 15 },
            attendance: { score: 95, weight: 10 },
            consistency: { score: 90, weight: 5 },
            completion: { score: 100, weight: 5 }
        }
    };

    // Process attendance data for Recharts
    const barData = currentAttendance.graphData.map(d => ({
        day: d.day,
        value: d.present === true ? 100 : d.present === false ? 25 : 5,
        isPresent: d.present
    }));

    const lineData = currentPerformance.timeline.map(t => ({
        month: t.week,
        value: t.value
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-10">
            {/* 1. WEEKLY ATTENDANCE CARD */}
            <div 
                onClick={() => setShowAttendanceModal(true)}
                className="bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 flex flex-col relative overflow-hidden w-full cursor-pointer hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group"
                role="button"
                aria-label="Weekly Attendance Chart (Click to inspect breakdown)"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Weekly <span className="text-emerald-600">Attendance</span></h3>
                            <Info className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Session presence tracking</p>
                    </div>
                    <div className="text-right">
                        <span className={cn(
                            "text-2xl font-black text-slate-900",
                            currentAttendance.percentage === null && "text-sm text-slate-500 font-bold uppercase"
                        )}>
                            {currentAttendance.percentage !== null ? `${currentAttendance.percentage}%` : 'No Data'}
                        </span>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {currentAttendance.percentage !== null ? currentAttendance.status : 'No Sessions Scheduled'}
                        </p>
                    </div>
                </div>

                {currentAttendance.percentage === null || currentAttendance.totalSessions === 0 ? (
                    <div className="h-[200px] w-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100/60">
                        <BookOpen className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">No Attendance Data Yet</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 max-w-xs">Your attendance trend will appear here once you attend a live session.</p>
                    </div>
                ) : (
                    <div className="h-[200px] w-full min-w-0" aria-hidden="true">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <XAxis 
                                    dataKey="day" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip 
                                    cursor={{ fill: '#F8FAFC', radius: 10 }} 
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ display: 'none' }}
                                    formatter={(value, name, props) => {
                                        const status = props.payload.isPresent === true ? 'Present' : props.payload.isPresent === false ? 'Absent' : 'No Class';
                                        return [status, 'Presence'];
                                    }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    radius={[6, 6, 6, 6]} 
                                    barSize={20}
                                >
                                    {barData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.isPresent === true ? '#10B981' : entry.isPresent === false ? '#EF4444' : '#F1F5F9'} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* 2. PERFORMANCE HEALTH CARD */}
            <div 
                onClick={() => setShowPerformanceModal(true)}
                className="bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 flex flex-col relative overflow-hidden w-full cursor-pointer hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group"
                role="button"
                aria-label="Performance Health Chart (Click to inspect breakdown)"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Performance <span className="text-orange-600">Health</span></h3>
                            <Info className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Long-term skill growth</p>
                    </div>
                    <div className="text-right">
                        <span className={cn(
                            "text-2xl font-black text-slate-900",
                            (currentPerformance.percentage === null || currentPerformance.hasData === false) && "text-sm text-slate-500 font-bold uppercase"
                        )}>
                            {currentPerformance.percentage !== null && currentPerformance.hasData !== false ? `${currentPerformance.percentage}%` : 'No Data'}
                        </span>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {currentPerformance.percentage !== null && currentPerformance.hasData !== false ? currentPerformance.level : 'No Assessments Yet'}
                        </p>
                    </div>
                </div>

                {currentPerformance.percentage === null || currentPerformance.hasData === false ? (
                    <div className="h-[200px] w-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100/60">
                        <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">No Performance Data Yet</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 max-w-xs">Complete an assignment or assessment to start building your learning trend.</p>
                    </div>
                ) : (
                    <div className="h-[200px] w-full min-w-0" aria-hidden="true">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={lineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="cleanPerformance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#174F3A" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#174F3A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#174F3A" 
                                    strokeWidth={3} 
                                    fill="url(#cleanPerformance)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Attendance Breakdown Modal */}
            {showAttendanceModal && mounted && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAttendanceModal(false)}>
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl p-8 space-y-6 animate-scale-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Attendance Ledger</h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Verification Breakdown</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAttendanceModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider">Close</button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-650">Attendance Formula:</span>
                                <span className="text-xs font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700">
                                    (Attended / Scheduled) × 100
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center">
                                    <span className="text-3xl font-black text-emerald-700 block">
                                        {currentAttendance.percentage !== null ? `${currentAttendance.percentage}%` : 'N/A'}
                                    </span>
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Calculated Attendance</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                    <span className="text-xl font-bold text-slate-800 block mt-1">
                                        {currentAttendance.sessionsText}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Streak</span>
                                </div>
                            </div>

                            <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                                    <Sparkles className="w-4 h-4 text-emerald-500" /> Attendance Insight
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    {currentAttendance.insights}
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl">
                                <span className="text-xs font-bold text-emerald-700">Forecast / Prediction Engine:</span>
                                <span className="text-xs font-bold text-emerald-600 bg-white border border-emerald-100 px-3 py-1.5 rounded-xl">
                                    {currentAttendance.prediction}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Performance Health Breakdown Modal */}
            {showPerformanceModal && mounted && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowPerformanceModal(false)}>
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 max-w-xl w-full overflow-hidden shadow-2xl p-8 space-y-6 animate-scale-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Overall Learning Health</h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Weighted Performance Core</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPerformanceModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider">Close</button>
                        </div>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 no-scrollbar">
                            {/* Breakdown table */}
                            <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">Weighted Components</span>
                                <div className="space-y-1.5">
                                    {[
                                        { name: "Quizzes", key: "quiz", pct: 25 },
                                        { name: "Assignments", key: "assignments", pct: 20 },
                                        { name: "Projects", key: "projects", pct: 20 },
                                        { name: "Coding Practice", key: "coding", pct: 15 },
                                        { name: "Attendance", key: "attendance", pct: 10 },
                                        { name: "Learning Consistency", key: "consistency", pct: 5 },
                                        { name: "Course Completion", key: "completion", pct: 5 },
                                    ].map((comp, idx) => {
                                        const scoreObj = (currentPerformance.breakdown as any)[comp.key] || { score: 90, weight: comp.pct };
                                        return (
                                            <div key={idx} className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-slate-200/60 text-xs">
                                                <span className="font-semibold text-slate-700">{comp.name}</span>
                                                <div className="flex items-center gap-4 text-slate-500 font-mono">
                                                    <span>Score: {scoreObj.score}%</span>
                                                    <span>×</span>
                                                    <span>{(comp.pct / 100).toFixed(2)}</span>
                                                    <span className="text-slate-800 font-bold">= {((scoreObj.score * comp.pct) / 100).toFixed(1)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-orange-500" /> Learning Velocity
                                    </span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-orange-700">{currentPerformance.velocity}%</span>
                                        <span className="text-[10px] text-slate-400 font-bold">({currentPerformance.actualHours}h vs {currentPerformance.expectedHours}h expected)</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                                        <Target className="w-3.5 h-3.5 text-emerald-500" /> Target Next Week
                                    </span>
                                    <span className="text-2xl font-black text-emerald-700 block">{currentPerformance.prediction}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Strongest Capabilities</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {currentPerformance.strongAreas.map((s, i) => (
                                            <span key={i} className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Attention Required</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {currentPerformance.weakAreas.map((s, i) => (
                                            <span key={i} className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-orange-50/20 border border-orange-100/30 rounded-3xl space-y-2">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                                    <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" /> Overall AI Analysis
                                </div>
                                <p className="text-xs text-slate-650 leading-relaxed font-medium">
                                    {currentPerformance.summary}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
