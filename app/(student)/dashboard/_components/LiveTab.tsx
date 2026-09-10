'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Video, ChevronRight, Database, CalendarPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

interface LiveTabProps {
    upcomingLessons: any[];
}

export default function LiveTab({ upcomingLessons }: LiveTabProps) {
    const [statusMap, setStatusMap] = useState<Record<string, { status: 'not_started' | 'live' | 'ended'; cta: { label: string; variant: string; disabled: boolean } }>>({});

    const lessonIds = useMemo(() => (upcomingLessons || []).map((s: any) => s.id), [upcomingLessons]);

    useEffect(() => {
        if (!lessonIds.length) return;
        let mounted = true;

        const pollStatuses = async () => {
            try {
                const responses = await Promise.all(
                    lessonIds.map((id: string) =>
                        fetch(`/api/live/session-status?sessionId=${id}`, { cache: 'no-store' })
                            .then(async (res) => ({ ok: res.ok, json: await res.json(), id }))
                            .catch(() => ({ ok: false, json: null, id }))
                    )
                );

                if (!mounted) return;

                const next: Record<string, any> = {};
                for (const item of responses) {
                    if (item.ok && item.json?.data) {
                        next[item.id] = item.json.data;
                    }
                }
                setStatusMap(next);
            } catch (error) {
                console.error('[LiveTab] session status polling failed', error);
            }
        };

        pollStatuses();
        const interval = setInterval(pollStatuses, 15000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [lessonIds]);

    return (
        <div className="space-y-10 min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header Section */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-6 bg-emerald-500 rounded-full" />
                        <span className="text-xs sm:text-sm font-black text-emerald-600 uppercase tracking-[0.3em]">LIVE STUDIO</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[0.95]">
                        LIVE <span className="text-emerald-500">CLASSES</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">Direct access to industry-standard live broadcasts</p>
                </div>
            </div>

            {upcomingLessons && upcomingLessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingLessons.map((seminar: any) => (
                        (() => {
                            const dynamic = statusMap[seminar.id];
                            const status = dynamic?.status || (seminar.isLiveNow ? 'live' : 'not_started');
                            const cta = dynamic?.cta || {
                                label: seminar.isLiveNow ? '🔴 Live Now - Enter' : '⏰ Starts Soon',
                                disabled: !seminar.isLiveNow,
                                variant: seminar.isLiveNow ? 'live' : 'scheduled',
                            };

                            const ctaClass = status === 'live'
                                ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20'
                                : status === 'ended'
                                    ? 'bg-[#1B4332] text-white hover:bg-[#2D6A4F]'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed';

                            const badgeClass = status === 'live'
                                ? 'bg-rose-50 text-rose-600 border-rose-100/50'
                                : status === 'ended'
                                    ? 'bg-blue-50 text-blue-600 border-blue-100/50'
                                    : 'bg-slate-50 text-slate-500 border-slate-200';

                            const badgeLabel = status === 'live' ? 'Live Now' : status === 'ended' ? 'Recording' : 'Scheduled';

                            return (
                                <div key={seminar.id} className="bg-white rounded-[32px] border border-[#EAF0F7] shadow-[0_12px_35px_rgba(15,23,42,0.06)] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                badgeClass
                                            )}>
                                                {badgeLabel}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {(() => {
                                                    try {
                                                        return seminar.startTime ? format(new Date(seminar.startTime), 'MMM d, yyyy') : 'TBA';
                                                    } catch (e) {
                                                        return 'TBA';
                                                    }
                                                })()}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900 leading-snug tracking-tight line-clamp-2">{seminar.title}</h3>

                                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                                            <Database className="w-3.5 h-3.5" />
                                            {seminar.courseName}
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Link
                                                href={status === 'ended' ? '/dashboard/recordings' : seminar.joinUrl}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95",
                                                    ctaClass
                                                )}
                                                aria-disabled={cta.disabled}
                                                onClick={(e) => {
                                                    if (cta.disabled) e.preventDefault();
                                                }}
                                            >
                                                {cta.label}
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                            {status === 'not_started' && (
                                                <a
                                                    href={`/api/seminars/${seminar.id}/calendar`}
                                                    download
                                                    className="flex items-center justify-center px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-[#1B4332] hover:text-white transition-all shadow-sm"
                                                    title="Add to Calendar"
                                                >
                                                    <CalendarPlus className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                        <Video className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">No broadcasts active at this moment</h3>
                        <p className="text-xs text-slate-500 font-medium">All live sessions are recorded and archived for your access.</p>
                    </div>
                    <Link href="/seminars" className="inline-block px-8 py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-lg shadow-emerald-900/10">View full schedule</Link>
                </div>
            )}
        </div>
    );
}
