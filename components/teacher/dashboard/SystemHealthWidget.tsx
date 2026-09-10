'use client';

import { Activity, Database, Server, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemHealthProps {
  data?: {
    server: string;
    latency: string;
    uptime: string;
    storage: string;
    encodingNodes: number;
    activeEgress: number;
  };
  isLoading?: boolean;
}

export default function SystemHealthWidget({ data, isLoading }: SystemHealthProps) {
  if (isLoading) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-[32px]" />;
  }

  const metrics = [
    { label: 'Uptime', value: data?.uptime || '99.9%', icon: Server, color: 'text-emerald-500' },
    { label: 'Latency', value: data?.latency || '32ms', icon: Activity, color: 'text-blue-500' },
    { label: 'Node Status', value: `${data?.encodingNodes || 0} Online`, icon: ShieldCheck, color: 'text-indigo-500' },
    { label: 'Vault Used', value: data?.storage || '0GB', icon: Database, color: 'text-amber-500' },
  ];

  return (
    <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">System Infrastructure</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </p>
          </div>
          <button className="text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
            View Console
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/metric">
              <div className="flex items-center gap-3 mb-2">
                <metric.icon className={cn("w-4 h-4", metric.color)} />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{metric.label}</span>
              </div>
              <p className="text-lg font-black text-white tracking-tight group-hover/metric:text-emerald-400 transition-colors">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
              <span>Encoding Queue</span>
              <span className="text-emerald-400">0 Items</span>
           </div>
           <div className="h-1 w-full bg-white/5 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500 w-[85%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
           </div>
        </div>
      </div>
    </div>
  );
}

