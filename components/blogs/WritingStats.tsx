'use client'

import { useWritingAnalytics } from '@/hooks/useWritingAnalytics';

/**
 * Minimalist Writing Stats Component
 * Displays key metrics unobtrusively to help writers track their progress.
 */
export function WritingStats({ content }: { content: string }) {
  const stats = useWritingAnalytics(content);

  return (
    <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-50">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Word Count</p>
        <p className="text-sm font-black text-slate-900">{stats.words.toLocaleString()}</p>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Reading Time</p>
        <p className="text-sm font-black text-slate-900">{stats.readTime}</p>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tone</p>
        <p className="text-sm font-black text-slate-900">{stats.complexity}</p>
      </div>

      <div className="flex-1 min-w-[200px] flex items-center gap-4 pl-4 border-l border-slate-50">
        <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {stats.progress}% of Goal
        </span>
      </div>
    </div>
  );
}
