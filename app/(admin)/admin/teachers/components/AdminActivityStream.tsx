'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Video, 
  FileText, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { socketService } from '@/lib/realtime/socket-client';
import { cn } from '@/lib/utils';

interface AdminEvent {
  id: string;
  type: string;
  timestamp: Date;
  actor: string;
  action: string;
  entity: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export function AdminActivityStream() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = socketService.get();
    if (!socket) return;

    const handleSync = (event: any) => {
      const newEvent: AdminEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: event.type,
        timestamp: new Date(),
        actor: event.metadata?.actorName || 'System',
        action: parseAction(event),
        entity: event.payload.entity,
        status: parseStatus(event)
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 50));
      triggerNotificationSound(newEvent.status);
    };

    socket.on('sync_event', handleSync);
    return () => { socket.off('sync_event', handleSync); };
  }, []);

  const parseAction = (event: any) => {
    const { type, payload } = event;
    if (type === 'class.live') return `started a live class: ${payload.after?.lessonTitle || 'Lesson'}`;
    if (type === 'teacher.app_submit') return `submitted a new teacher application`;
    if (type === 'course.published') return `published course: ${payload.after?.title}`;
    return `performed action: ${type} on ${payload.entity}`;
  };

  const parseStatus = (event: any): any => {
    const { type } = event;
    if (type === 'class.live') return 'success';
    if (type.includes('fail') || type.includes('error')) return 'error';
    if (type.includes('warn') || type.includes('report')) return 'warning';
    return 'info';
  };

  const triggerNotificationSound = (status?: string) => {
    // Optional: Add subtle sound effects for admin alerts
  };

  const getIcon = (type: string) => {
    if (type.includes('class')) return Video;
    if (type.includes('teacher')) return UserPlus;
    if (type.includes('course')) return BookOpen;
    return Activity;
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-2xl overflow-hidden flex flex-col h-[600px]">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0F172A] tracking-tighter uppercase">Live Operations</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Real-time Event Stream
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <Clock className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Waiting for events...</p>
            </div>
          ) : (
            events.map((event) => {
              const Icon = getIcon(event.type);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex gap-4 relative overflow-hidden group",
                    event.status === 'success' ? "bg-emerald-50/50 border-emerald-100/50" :
                    event.status === 'warning' ? "bg-amber-50/50 border-amber-100/50" :
                    event.status === 'error' ? "bg-rose-50/50 border-rose-100/50" :
                    "bg-slate-50/30 border-slate-100/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    event.status === 'success' ? "bg-white text-emerald-600" :
                    event.status === 'warning' ? "bg-white text-amber-600" :
                    event.status === 'error' ? "bg-white text-rose-600" :
                    "bg-white text-slate-400"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                        {event.actor}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300">
                        {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[13px] font-bold text-[#1E293B] leading-snug">
                      {event.action}
                    </p>
                  </div>

                  <div className="absolute right-0 top-0 bottom-0 w-1 group-hover:w-2 transition-all bg-current opacity-20" />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
