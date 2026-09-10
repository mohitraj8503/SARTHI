'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Radio } from 'lucide-react';
import Link from 'next/link';

interface LiveSessionIslandProps {
    sessions: any[];
}

export default function LiveSessionIsland({ sessions }: LiveSessionIslandProps) {
    // Pick ONLY the single most recent active live session to prevent stacking multi-card overlays
    const liveSessions = sessions?.filter(s => s.isLiveNow) || [];
    const activeSession = liveSessions.length > 0 ? liveSessions[0] : null;

    const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(() => {
        if (typeof window !== 'undefined' && activeSession?.id) {
            return sessionStorage.getItem(`tt_live_island_dismissed_${activeSession.id}`);
        }
        return null;
    });

    if (!activeSession || (activeSession.id && dismissedSessionId === activeSession.id)) return null;

    const handleDismiss = () => {
        if (activeSession?.id) {
            setDismissedSessionId(activeSession.id);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(`tt_live_island_dismissed_${activeSession.id}`, activeSession.id);
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] w-full max-w-md px-4 pointer-events-none">
            <AnimatePresence>
                <motion.div
                    key={activeSession.id}
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.95 }}
                    className="pointer-events-auto"
                >
                    <div className="bg-[#0d0d0f]/95 border border-rose-500/40 shadow-[0_20px_50px_rgba(225,29,72,0.3)] rounded-2xl p-3 pr-4 flex items-center gap-3 group backdrop-blur-xl">
                        <div className="w-11 h-11 bg-rose-500 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0 shadow-lg shadow-rose-500/30">
                            <Radio className="text-white w-5 h-5 relative z-10 animate-pulse" />
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="flex items-center gap-1 text-[8px] font-black text-rose-400 uppercase tracking-tighter">
                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                                    LIVE NOW
                                </span>
                                {activeSession.courseName && (
                                    <span className="text-[8px] text-white/40 font-black uppercase tracking-widest truncate">• {activeSession.courseName}</span>
                                )}
                            </div>
                            <h4 className="text-xs font-black text-white tracking-tight truncate uppercase">
                                {activeSession.title}
                            </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Link 
                                href={`/live/${activeSession.id}`}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-md active:scale-95"
                            >
                                Join Studio
                                <ArrowRight className="w-3 h-3" />
                            </Link>

                            <button
                                onClick={handleDismiss}
                                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                title="Dismiss notification"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

