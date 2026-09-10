'use client';

import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Insight {
  id: string;
  type: 'CRITICAL' | 'TREND' | 'SUCCESS' | 'WARNING';
  message: string;
  suggestion: string;
  timestamp: string;
}

interface IntelligencePanelProps {
  insights: Insight[];
  isLoading?: boolean;
}

export function IntelligencePanel({ insights, isLoading }: IntelligencePanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-slate-100 rounded-lg mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-slate-50 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-xl">
            <Sparkles className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-[12px] font-black text-[#0F172A] uppercase tracking-[0.2em]">AI Insights</h3>
        </div>
        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest">
          Live
        </span>
      </div>

      <div className="space-y-4">
        {insights.length > 0 ? (
          insights.map((insight) => (
            <div 
              key={insight.id} 
              className="p-5 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all rounded-[1.5rem] border border-transparent hover:border-slate-100 group"
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-2xl flex-shrink-0",
                  insight.type === 'CRITICAL' ? "bg-rose-50 text-rose-600" :
                  insight.type === 'SUCCESS' ? "bg-emerald-50 text-emerald-600" :
                  insight.type === 'TREND' ? "bg-blue-50 text-blue-600" :
                  "bg-orange-50 text-orange-600"
                )}>
                  {insight.type === 'TREND' ? <TrendingUp size={20} /> :
                   insight.type === 'CRITICAL' ? <AlertTriangle size={20} /> :
                   <Lightbulb size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {insight.type} • {formatDistanceToNow(new Date(insight.timestamp))} ago
                    </span>
                  </div>
                  <p className="text-[14px] font-bold text-[#0F172A] leading-tight mb-2 group-hover:text-orange-600 transition-colors">
                    {insight.message}
                  </p>
                  <div className="flex items-start gap-2 p-3 bg-white/50 rounded-xl border border-slate-100">
                    <Sparkles size={12} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                      {insight.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Analyzing_Platform_Data</p>
            <p className="text-[10px] text-slate-300">No critical insights at this time. All systems operating normally.</p>
          </div>
        )}
      </div>

      <button className="w-full mt-6 flex items-center justify-center gap-2 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-orange-600 transition-colors">
        View Full Report <ArrowUpRight size={14} />
      </button>
    </div>
  );
}

