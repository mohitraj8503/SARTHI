'use client';

/**
 * LiveClassBanner.tsx
 * Renders a persistent, realtime-connected banner for students when 
 * a class they are enrolled in goes live. Zero polling — pure Socket.IO.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, X, ArrowRight, Radio } from 'lucide-react';
import { socketService } from '@/lib/realtime/socket-client';
import Link from 'next/link';

interface LiveAlert {
  lessonId: string;
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  roomName: string;
  instructorName: string;
}

export function LiveClassBanner() {
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);

  const handleLiveClass = useCallback((event: any) => {
    if (event.type !== 'class.live') return;
    const payload = event.payload?.after;
    if (!payload) return;

    const alert: LiveAlert = {
      lessonId: event.payload.id,
      courseId: payload.courseId,
      courseTitle: payload.courseTitle || 'Your Course',
      lessonTitle: payload.lessonTitle || 'Live Class',
      roomName: payload.roomName,
      instructorName: payload.instructorName || 'Instructor',
    };

    setLiveAlerts(prev => {
      // Don't duplicate
      if (prev.find(a => a.lessonId === alert.lessonId)) return prev;
      return [alert, ...prev];
    });

    // Auto-dismiss after 5 minutes
    setTimeout(() => {
      setLiveAlerts(prev => prev.filter(a => a.lessonId !== alert.lessonId));
    }, 5 * 60 * 1000);
  }, []);

  const handleClassEnded = useCallback((data: any) => {
    setLiveAlerts(prev => prev.filter(a => a.lessonId !== data.lessonId));
  }, []);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('sync_event', handleLiveClass);
    socket.on('class:ended', handleClassEnded);
    // Direct notification channel
    socket.on('notification:new', (notification: any) => {
      if (notification.type === 'LIVE_CLASS') {
        handleLiveClass({ type: 'class.live', payload: { id: '', after: notification } });
      }
    });

    return () => {
      socket.off('sync_event', handleLiveClass);
      socket.off('class:ended', handleClassEnded);
      socket.off('notification:new');
    };
  }, [handleLiveClass, handleClassEnded]);

  const dismiss = (lessonId: string) => {
    setLiveAlerts(prev => prev.filter(a => a.lessonId !== lessonId));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {liveAlerts.map((alert) => (
          <motion.div
            key={alert.lessonId}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="pointer-events-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden">
              {/* Pulsing top bar */}
              <div className="h-1 bg-gradient-to-r from-rose-500 to-rose-400 animate-pulse" />

              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-200">
                    <Radio className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">🔴 Live Now</span>
                    </div>
                    <h4 className="text-[13px] font-black text-slate-900 leading-tight truncate">{alert.lessonTitle}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{alert.courseTitle} · {alert.instructorName}</p>
                  </div>
                  <button
                    onClick={() => dismiss(alert.lessonId)}
                    className="p-1 text-slate-300 hover:text-slate-600 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/join/${alert.roomName}`}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-sm"
                >
                  <Video className="w-3.5 h-3.5" /> Join Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
