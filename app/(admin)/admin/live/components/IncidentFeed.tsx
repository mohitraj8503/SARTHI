'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  X,
  Bell
} from 'lucide-react';
import { socketService } from '@/lib/realtime/socket-client';
import { cn } from '@/lib/utils';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
  teacherName?: string;
  sessionId?: string;
  createdAt: string | Date;
  resolvedAt?: string | Date;
}

interface IncidentFeedProps {
  initialIncidents?: Incident[];
}

export function IncidentFeed({ initialIncidents = [] }: IncidentFeedProps) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [flashNew, setFlashNew] = useState(false);

  const addIncident = useCallback((incident: Incident) => {
    setIncidents(prev => [incident, ...prev].slice(0, 100));
    setFlashNew(true);
    setTimeout(() => setFlashNew(false), 2000);

    // Browser notification for EMERGENCY
    if (incident.severity === 'EMERGENCY' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`🚨 ${incident.title}`, {
        body: incident.description,
        icon: '/sarthi-logo.png',
      });
    }
  }, []);

  const resolveIncident = useCallback((incidentId: string) => {
    setIncidents(prev => prev.map(i => 
      i.id === incidentId ? { ...i, resolvedAt: new Date().toISOString() } : i
    ));
  }, []);

  // Wire to Socket.IO
  useEffect(() => {
    Notification.requestPermission().catch(() => {});
    
    const socket = socketService.get();
    if (!socket) return;

    socket.on('incident:new', addIncident);
    socket.on('incident:emergency', ({ incident }: any) => addIncident(incident));
    socket.on('incident:resolved', ({ incidentId }: any) => resolveIncident(incidentId));

    return () => {
      socket.off('incident:new', addIncident);
      socket.off('incident:emergency');
      socket.off('incident:resolved', resolveIncident);
    };
  }, [addIncident, resolveIncident]);

  const filtered = incidents.filter(i => {
    if (filter === 'ACTIVE') return !i.resolvedAt;
    if (filter === 'RESOLVED') return !!i.resolvedAt;
    return true;
  });

  const activeCount = incidents.filter(i => !i.resolvedAt).length;
  const criticalCount = incidents.filter(i => !i.resolvedAt && (i.severity === 'CRITICAL' || i.severity === 'EMERGENCY')).length;

  return (
    <div className={cn(
      "bg-white/60 backdrop-blur-xl rounded-[2.5rem] border shadow-2xl overflow-hidden flex flex-col h-full transition-all duration-500",
      flashNew ? "border-rose-300 shadow-rose-100" : "border-white/80"
    )}>
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
              criticalCount > 0 ? "bg-rose-500/10" : "bg-slate-100"
            )}>
              <Bell className={cn("w-5 h-5", criticalCount > 0 ? "text-rose-600" : "text-slate-400")} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tighter uppercase">Incident Feed</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {activeCount} Active · {criticalCount} Critical
              </p>
            </div>
          </div>

          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-rose-200">
              <Zap className="w-3 h-3" />
              {criticalCount} ALERT{criticalCount > 1 ? 'S' : ''}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {(['ACTIVE', 'ALL', 'RESOLVED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                filter === f ? "bg-[#0F172A] text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-300 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {filter === 'ACTIVE' ? 'No Active Incidents' : 'No Incidents Found'}
              </p>
              <p className="text-[10px] text-slate-300 mt-1">Platform operating normally.</p>
            </div>
          ) : (
            filtered.map(incident => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onResolve={resolveIncident}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function IncidentCard({ incident, onResolve }: { incident: Incident; onResolve: (id: string) => void }) {
  const isResolved = !!incident.resolvedAt;

  const config = {
    INFO: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    WARNING: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    CRITICAL: { icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    EMERGENCY: { icon: Zap, color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-300' },
  }[incident.severity];

  const Icon = config.icon;
  const elapsed = Math.floor((Date.now() - new Date(incident.createdAt).getTime()) / 60000);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isResolved ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "p-4 rounded-2xl border transition-all group relative overflow-hidden",
        config.bg, config.border,
        incident.severity === 'EMERGENCY' && !isResolved && "shadow-lg shadow-rose-100"
      )}
    >
      {incident.severity === 'EMERGENCY' && !isResolved && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-rose-300 animate-pulse" />
      )}
      
      <div className="flex items-start gap-3">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", config.bg, "border", config.border)}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-[12px] font-black text-[#0F172A] leading-none">{incident.title}</h4>
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="w-2.5 h-2.5 text-slate-300" />
              <span className="text-[9px] font-bold text-slate-300">{elapsed}m ago</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-snug mb-2">{incident.description}</p>

          {incident.teacherName && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-400 bg-white/60 px-2 py-0.5 rounded-lg border border-white">
              Faculty: {incident.teacherName}
            </span>
          )}
        </div>
      </div>

      {!isResolved && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-current/10">
          {incident.sessionId && (
            <a
              href={`/admin/live`}
              className="flex-1 py-2 text-center bg-white/60 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-white transition-all flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> View Session
            </a>
          )}
          <button
            onClick={() => onResolve(incident.id)}
            className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" /> Resolve
          </button>
        </div>
      )}

      {isResolved && (
        <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-emerald-600">
          <CheckCircle2 className="w-3 h-3" /> Resolved
        </div>
      )}
    </motion.div>
  );
}
