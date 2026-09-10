'use client';

import React from 'react';
import { TrendingUp, Users, Target, ArrowUpRight, Instagram, Search, Globe, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnrollmentInsightsProps {
  data: {
    trend: number;
    conversionRate: number;
    sources: { name: string; percentage: number; trend: 'UP' | 'DOWN' | 'STABLE' }[];
  };
  isLoading?: boolean;
}

export function EnrollmentInsights({ data, isLoading }: EnrollmentInsightsProps) {
  if (isLoading) {
    return <div className="h-64 bg-white animate-pulse rounded-[2.5rem]" />;
  }

  if (!data) {
    return null;
  }

  const trend = data.trend || 0;
  const conversionRate = data.conversionRate || 0;
  const sources = data.sources || [];

  return (
    <div className="bg-[#0F172A] p-8 rounded-[2.5rem] text-white border border-[#1E293B] shadow-2xl shadow-black/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-xl">
            <Target className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Enrollment Insights</h3>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
          trend >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
        )}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
          {Math.abs(trend)}% vs Yesterday
        </div>
      </div>

      {/* Main Metric */}
      <div className="mb-10 relative z-10">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[42px] font-black tracking-tighter">{conversionRate}%</span>
          <span className="text-[12px] font-black text-white/40 uppercase tracking-widest">Conversion Rate</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                style={{ width: `${conversionRate}%` }} 
              />
           </div>
           {conversionRate < 15 && (
             <AlertCircle size={14} className="text-rose-500 animate-pulse" />
           )}
        </div>
        {conversionRate < 15 && (
          <p className="text-[10px] font-bold text-rose-400 mt-2 uppercase tracking-widest">⚠️ Conversion below threshold</p>
        )}
      </div>

      {/* Sources */}
      <div className="space-y-4 relative z-10">
        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Traffic Attribution</h4>
        {sources.map((source) => (
          <div key={source.name} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                {source.name === 'Instagram' ? <Instagram size={18} className="text-pink-400" /> :
                 source.name === 'Search' ? <Search size={18} className="text-blue-400" /> :
                 <Globe size={18} className="text-emerald-400" />}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{source.name}</p>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Source</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-white">{source.percentage}%</div>
              <div className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                source.trend === 'UP' ? "text-emerald-400" : source.trend === 'DOWN' ? "text-rose-400" : "text-white/40"
              )}>
                {source.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 flex items-center justify-center gap-2 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-amber-500 transition-colors">
        Deep Attribution Analysis <ArrowUpRight size={14} />
      </button>
    </div>
  );
}

