'use client';

import { Activity, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ActivityItem {
    id: string;
    type: string;
    description: string;
    actorName: string;
    timestamp: string;
}

interface ActivitySectionProps {
    activities?: ActivityItem[];
    isLoading: boolean;
}

export function ActivitySection({ activities, isLoading }: ActivitySectionProps) {
    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-500">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="text-[12px] font-black text-[#0F172A] uppercase tracking-[0.3em]">Live Feed</h3>
                </div>
                <Link href="/admin/activity" className="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest transition-colors">View All →</Link>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-[400px]">
                <div className="space-y-2">
                    {activities && activities.length > 0 ? (
                        activities.map((activity) => (
                            <div key={activity.id} className="p-5 rounded-[1.5rem] hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-amber-500 flex items-center justify-center text-[12px] font-black group-hover:scale-110 transition-transform shadow-lg shadow-black/10">
                                        {(activity.actorName || 'SY').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <p className="text-[14px] font-bold text-[#0F172A] leading-tight line-clamp-2">{activity.description}</p>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                            <span className="text-amber-600">{activity.actorName || 'System'}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="p-5 rounded-[1.5rem] animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-slate-50 w-3/4 rounded-lg" />
                                        <div className="h-3 bg-slate-50 w-1/4 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <Activity className="w-10 h-10" />
                            </div>
                            <h4 className="text-[14px] font-black text-[#0F172A] uppercase tracking-widest">No Activity Detected</h4>
                            <p className="text-[12px] text-slate-400 mt-2 font-medium max-w-[200px] mx-auto">Platform operations are currently idle.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-8 border-t border-slate-50 bg-slate-50/10">
                <Link href="/admin/activity" className="group w-full flex items-center justify-center gap-3 py-4 bg-[#0F172A] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-500 transition-all shadow-xl shadow-black/10 active:scale-95">
                    Terminal Archive <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}

