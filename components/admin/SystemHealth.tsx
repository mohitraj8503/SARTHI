'use client';

import { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Zap,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  History,
  TrendingUp,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
  unit?: string;
  change?: string;
}

interface LogEntry {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  source: string;
}

interface SystemHealthProps {
  metrics?: HealthMetric[];
  logs?: LogEntry[];
  loading?: boolean;
}

export function SystemHealth({ metrics = [], logs = [], loading }: SystemHealthProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');
  const [fetchedMetrics, setFetchedMetrics] = useState<HealthMetric[]>([]);
  const [fetchedLogs, setFetchedLogs] = useState<LogEntry[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (metrics.length > 0 || logs.length > 0) return;

    let cancelled = false;
    const fetchData = async () => {
      setFetchLoading(true);
      try {
        const res = await fetch('/api/admin/system-health');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setFetchedMetrics(data.metrics || []);
            setFetchedLogs(data.logs || []);
          }
        }
      } catch {
        // Silently fail - will show empty state
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [metrics, logs]);

  const displayMetrics = metrics.length > 0 ? metrics : fetchedMetrics;
  const displayLogs = logs.length > 0 ? logs : fetchedLogs;

  const STATUS_CONFIG = {
    healthy: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-100' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-100' },
    error: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-100' }
  };

  const getLogColors = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 text-green-600 border-green-100';
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'error': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white border border-[#E2E8F4] rounded-[24px] overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-[#F0F2F8] flex items-center justify-between bg-[#F8F9FC]/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1C2B4A] text-[#E8B84B] flex items-center justify-center shadow-lg shadow-[#1C2B4A]/10">
            <Cpu size={20} />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#1C2B4A]">System Diagnostics</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Core Pulse Active</span>
            </div>
          </div>
        </div>
        <div className="flex p-1 bg-[#F0F2F8] rounded-xl border border-[#E2E8F4]">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              activeTab === 'overview' ? "bg-white text-[#1C2B4A] shadow-sm" : "text-[#7A8FAF] hover:text-[#1C2B4A]"
            )}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
              activeTab === 'logs' ? "bg-white text-[#1C2B4A] shadow-sm" : "text-[#7A8FAF] hover:text-[#1C2B4A]"
            )}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto admin-scrollbar">
        {loading || fetchLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#1C2B4A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[12px] text-[#7A8FAF] font-bold uppercase tracking-widest tracking-[0.2em]">Executing Scan...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="metrics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 space-y-6"
              >
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {displayMetrics.map((metric, i) => {
                    const Config = STATUS_CONFIG[metric.status];
                    return (
                      <div key={i} className="bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl p-4 hover:border-[#1C2B4A] transition-all group">
                        <div className="flex items-center gap-2 mb-3">
                          <Config.icon size={14} className={Config.color} />
                          <span className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest">{metric.name}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[20px] font-bold text-[#1C2B4A] tracking-tighter">{metric.value}</span>
                          <span className="text-[12px] font-bold text-[#A8B8D8] uppercase">{metric.unit}</span>
                        </div>
                        <p className="text-[9px] font-black text-[#A8B8D8] uppercase tracking-wider mt-1">{metric.change}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Micro-Services */}
                <div>
                  <h4 className="text-[10px] font-black text-[#7A8FAF] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ShieldCheck size={12} /> Service Integrity
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Gateway', icon: Server, status: 'healthy' },
                      { name: 'Datastore', icon: Database, status: 'healthy' },
                      { name: 'Compute', icon: Zap, status: 'healthy' },
                      { name: 'CDN Node', icon: RefreshCw, status: 'warning' },
                    ].map((s) => {
                      const Icon = s.icon;
                      const Config = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG];
                      return (
                        <div key={s.name} className="flex items-center gap-3 p-3 bg-white border border-[#F0F2F8] rounded-xl hover:shadow-lg hover:shadow-[#1C2B4A]/5 transition-all">
                          <div className={cn("p-2 rounded-lg", Config.bg, Config.color)}>
                            <Icon size={14} />
                          </div>
                          <span className="text-[12px] font-bold text-[#1C2B4A]">{s.name}</span>
                          <div className={cn("w-1.5 h-1.5 rounded-full ml-auto", s.status === 'healthy' ? "bg-green-500" : "bg-amber-500")} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="divide-y divide-[#F0F2F8]"
              >
                {displayLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-[#F8F9FC] transition-all flex items-start gap-4">
                    <div className={cn("mt-1 w-2 h-2 rounded-full flex-shrink-0",
                      log.type === 'success' ? "bg-green-500" :
                        log.type === 'warning' ? "bg-amber-500" :
                          log.type === 'error' ? "bg-red-500" : "bg-blue-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-[#A8B8D8] uppercase tracking-widest">{formatTime(log.timestamp)}</span>
                        <span className={cn("text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded border", getLogColors(log.type))}>
                          {log.source}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium text-[#1C2B4A] leading-relaxed truncate">{log.message}</p>
                    </div>
                  </div>
                ))}
<button
  onClick={() => {
    // Show info toast for now
    console.log('Full audit history requested');
  }}
  className="w-full p-4 text-[10px] font-black text-[#7A8FAF] hover:text-[#1C2B4A] uppercase tracking-[0.2em] transition-colors"
>
  Load Full Audit History
</button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#F0F2F8] bg-[#F8F9FC]/50 text-center">
        <p className="text-[10px] font-bold text-[#A8B8D8] uppercase tracking-widest">Scan finalized: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

