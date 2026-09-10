'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, Plus, Video, Users,
    MoreVertical, Search, Filter, Play,
    CheckCircle2, ArrowRight, UserCheck, AlertCircle, Clock3, Ban, CheckCircle,
    Radio, PlayCircle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import StatCard from '@/components/teacher/dashboard/StatCard';

interface SeminarRequest {
    id: string;
    title: string;
    topic: string;
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SCHEDULED';
    proposedAt: string;
    proposedDuration: string;
    createdAt: string;
    adminRemarks?: string;
}

interface MySeminar {
    id: string;
    title: string;
    status: 'LIVE' | 'UPCOMING' | 'REPLAY';
    youtubeVideoId: string;
    youtubeLiveUrl?: string;
    scheduledStart: string;
    registrationsCount?: number;
    views?: number;
}

export default function SeminarsPage() {
    const [activeTab, setActiveTab] = useState('Sessions');
    const [searchQuery, setSearchQuery] = useState('');
    const [requests, setRequests] = useState<SeminarRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const { data: mySeminarsData, isLoading: loadingSessions } = useQuery({
        queryKey: ['teacher-seminars'],
        queryFn: async () => {
            const res = await fetch('/api/seminars?instructor=true', { credentials: 'include' });
            if (!res.ok) return [];
            const json = await res.json();
            return Array.isArray(json) ? json : json.data || [];
        },
        enabled: activeTab === 'Sessions',
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/seminars/requests', { credentials: 'include' });
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = ['Sessions', 'Requests', 'Create'];

    const getStatusInfo = (status: SeminarRequest['status']) => {
        switch (status) {
            case 'PENDING': return { icon: Clock3, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' };
            case 'UNDER_REVIEW': return { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Under Review' };
            case 'APPROVED': return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Approved' };
            case 'REJECTED': return { icon: Ban, color: 'text-red-600', bg: 'bg-red-50', label: 'Rejected' };
            case 'SCHEDULED': return { icon: Video, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Scheduled' };
            default: return { icon: AlertCircle, color: 'text-slate-600', bg: 'bg-slate-50', label: status };
        }
    };

    const mySeminars = Array.isArray(mySeminarsData) ? mySeminarsData : [];

    const stats = {
        totalSessions: mySeminars.length,
        totalRegistrations: mySeminars.reduce((s: number, sem: MySeminar) => s + (sem.registrationsCount || 0), 0),
        pendingRequests: requests.filter(r => r.status === 'PENDING').length
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Directory Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 md:px-10 py-6 md:py-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-1 w-4 bg-orange-500 rounded-full" />
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">COMMUNITY</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                                LIVE <span className="text-orange-500">SEMINARS</span>
                            </h1>
                            <p className="text-sm text-slate-500 font-medium mt-3">Host live sessions and manage community requests. Connect with your audience in real-time.</p>
                        </div>

                        <Link href="/teacher/seminars/new" className="bg-[#1B4332] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-[#2D6A4F] transition-all shadow-xl shadow-emerald-900/10 active:scale-95">
                            <Plus className="w-4.5 h-4.5" />
                            Host Seminar
                        </Link>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <StatCard 
                            title="Total Seminars"
                            value={stats.totalSessions}
                            change={5}
                            icon={Video}
                            color="emerald"
                        />
                        <StatCard 
                            title="Total Registrations"
                            value={stats.totalRegistrations}
                            change={12}
                            icon={Users}
                            color="blue"
                        />
                        <StatCard 
                            title="Pending Requests"
                            value={stats.pendingRequests}
                            change={0}
                            icon={Clock}
                            color="amber"
                        />
                        <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center text-center border-dashed border-2">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Feed</span>
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">System Synced</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-4 md:px-10 mt-8 md:mt-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
                    <div className="flex bg-white rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-slate-100">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    activeTab === tab 
                                        ? "bg-slate-900 text-white shadow-md" 
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search seminars..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {activeTab === 'Sessions' && (
                        loadingSessions ? (
                            <div className="py-24 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" />
                            </div>
                        ) : mySeminars.length > 0 ? (
                            mySeminars.map((sem: MySeminar) => (
                                <motion.div
                                    key={sem.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)] flex flex-col lg:flex-row items-center gap-8 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {sem.status === 'LIVE' ? (
                                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-red-50 text-red-600">
                                                    <Radio className="w-3.5 h-3.5 animate-pulse" /> LIVE NOW
                                                </span>
                                            ) : (sem.status === 'UPCOMING' || sem.status === 'SCHEDULED') ? (
                                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-blue-50 text-blue-600">
                                                    <Calendar className="w-3.5 h-3.5" /> SCHEDULED
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-slate-100 text-slate-600">
                                                    ENDED
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">{sem.title}</h3>
                                        <div className="flex flex-wrap items-center gap-6 mt-4">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Users className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-bold uppercase tracking-wider">{sem.registrationsCount || 0} registered</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-bold uppercase tracking-wider">
                                                    {new Date(sem.scheduledStart || sem.scheduledAt || sem.date || sem.startTime || new Date()).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {sem.status === 'LIVE' ? (
                                            <Link href={`/seminars/${sem.id}/live`} target="_blank" className="bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2">
                                                <Radio className="w-4 h-4 animate-pulse" /> GO LIVE
                                            </Link>
                                        ) : (sem.status === 'UPCOMING' || sem.status === 'SCHEDULED') ? (
                                            <Link href={`/seminars/${sem.id}/live`} className="bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-xl transition-all">
                                                MANAGE
                                            </Link>
                                        ) : (
                                            <Link href={`/seminars/${sem.id}/live`} className="bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-xl transition-all">
                                                VIEW REPLAY
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-white rounded-3xl p-24 text-center border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
                                <Video className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-slate-900">No seminars yet</h3>
                                <p className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] mt-3 mb-8">Host your first live session!</p>
                                <Link href="/teacher/seminars/new">
                                    <button className="bg-[#1B4332] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] inline-flex items-center gap-3 hover:bg-[#2D6A4F] transition-all shadow-xl shadow-emerald-900/10 active:scale-95">
                                        <Plus className="w-4.5 h-4.5" /> HOST SEMINAR
                                    </button>
                                </Link>
                            </div>
                        )
                    )}

                    {activeTab === 'Requests' && (
                        loading ? (
                            <div className="py-24 text-center">
                                <p className="text-slate-400 uppercase font-black tracking-widest text-xs animate-pulse">Loading requests...</p>
                            </div>
                        ) : requests.length > 0 ? (
                            requests.map((req) => {
                                const s = getStatusInfo(req.status);
                                return (
                                    <motion.div 
                                        key={req.id} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)] flex flex-col lg:flex-row items-center gap-8 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5", s.bg, s.color)}>
                                                    <s.icon className="w-3.5 h-3.5" /> {s.label}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{req.topic}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900">{req.title}</h3>
                                            <div className="flex items-center gap-6 mt-4">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">{new Date(req.proposedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-xl transition-all">DETAILS</button>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="bg-white rounded-3xl p-24 text-center border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
                                <Clock className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-slate-900">No requests pending</h3>
                                <p className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] mt-3">You&apos;re all caught up!</p>
                            </div>
                        )
                    )}

                    {activeTab === 'Create' && (
                        <div className="bg-white rounded-3xl p-24 text-center border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
                            <Radio className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-slate-900">Ready to Host?</h3>
                            <p className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] mt-3 mb-8">Create and schedule a new live session</p>
                            <Link href="/teacher/seminars/new">
                                <button className="bg-[#1B4332] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] inline-flex items-center gap-3 hover:bg-[#2D6A4F] transition-all shadow-xl shadow-emerald-900/10 active:scale-95">
                                    <Plus className="w-4.5 h-4.5" /> CREATE SEMINAR
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
