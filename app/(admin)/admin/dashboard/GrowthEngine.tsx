'use client';

import React from 'react';
import { Rocket, TrendingUp, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface GrowthSuggestion {
  id: string;
  title: string;
  description: string;
  potentialImpact: 'HIGH' | 'MEDIUM';
  actionLabel: string;
  link: string;
}

interface GrowthEngineProps {
  suggestions: GrowthSuggestion[];
  isLoading?: boolean;
}

export function GrowthEngine({ suggestions, isLoading }: GrowthEngineProps) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-xl">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-[12px] font-black text-[#0F172A] uppercase tracking-[0.2em]">Growth Suggestions</h3>
        </div>
        <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
      </div>

      <div className="space-y-4 relative z-10">
        {isLoading ? (
          <div className="h-40 w-full bg-slate-50 animate-pulse rounded-3xl" />
        ) : suggestions.length > 0 ? (
          suggestions.map((item) => (
            <div 
              key={item.id}
              className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={cn(
                  "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border",
                  item.potentialImpact === 'HIGH' ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-orange-100 text-orange-700 border-orange-200"
                )}>
                  {item.potentialImpact === 'HIGH' ? 'High Impact' : 'Medium Impact'}
                </span>
                <Zap size={14} className="text-orange-500" />
              </div>
              <h4 className="text-[16px] font-black text-[#0F172A] mb-2 tracking-tight group-hover:text-orange-600 transition-colors">
                {item.title}
              </h4>
              <p className="text-[12px] font-medium text-slate-500 mb-6 leading-relaxed">
                {item.description}
              </p>
              <Link 
                href={item.link}
                className="inline-flex items-center gap-2 text-[11px] font-black text-orange-600 uppercase tracking-[0.15em] group-hover:gap-4 transition-all"
              >
                {item.actionLabel} <ArrowRight size={14} />
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-3xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Analyzing growth opportunities...</p>
          </div>
        )}
      </div>
    </div>
  );
}

