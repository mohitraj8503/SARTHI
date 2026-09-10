'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

export default function LiveBanner() {
    const [liveSession, setLiveSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLive = async () => {
            try {
                const res = await fetch('/api/student/live-sessions', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    // The API returns { success: true, sessions: [...] }
                    const sessions = data.sessions || [];
                    // Find any session that is currently LIVE
                    const active = sessions.find((s: any) => s.status === 'live' || s.isLiveNow);
                    setLiveSession(active || null);
                }
            } catch (err) {
                console.error('Failed to fetch live sessions');
            } finally {
                setLoading(false);
            }
        };

        checkLive();
        const interval = setInterval(checkLive, 60000); // Check once a minute
        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                checkLive();
            }
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, []);

    if (loading || !liveSession) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8"
            >
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-crimson-600 rounded-[32px] p-1 shadow-xl shadow-red-500/20">
                    <div className="bg-white/5 backdrop-blur-md rounded-[30px] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                                    <Video className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-md">Live Now</span>
                                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
                                        {liveSession.courseName || 'Academy Masterclass'}
                                    </span>
                                </div>
                                <h3 className="text-white text-xl font-black italic uppercase tracking-tight leading-none">
                                    {liveSession.title}
                                </h3>
                                <div className="flex items-center gap-2 text-white/70 text-xs font-bold">
                                    <User className="w-3.5 h-3.5" />
                                    {liveSession.instructor || 'Academy Instructor'}
                                </div>
                            </div>
                        </div>

                        <Link 
                            href={liveSession.joinUrl || `/student/live/${liveSession.id}`}
                            className="w-full md:w-auto px-10 py-4 bg-white text-red-600 rounded-2xl font-black uppercase tracking-[0.1em] text-[11px] italic flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all shadow-lg active:scale-95"
                        >
                            Enter Session <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

