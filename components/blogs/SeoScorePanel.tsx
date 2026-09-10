'use client';

import { useMemo } from 'react';
import { scoreBlogSeo, type BlogSeoInput, type SeoSignal } from '@/lib/seo/blogSeoScore';

interface SeoScorePanelProps {
  title: string;
  summary: string;
  body: string;
  coverUrl: string | null;
  category: string;
  tags: string[];
  authorName: string;
}

export default function SeoScorePanel(props: SeoScorePanelProps) {
  const result = useMemo(() => scoreBlogSeo(props as BlogSeoInput), [
    props.title, props.summary, props.body,
    props.coverUrl, props.category, props.tags.join(','), props.authorName
  ]);

  const barColor =
    result.totalScore >= 75 ? '#22c55e' :
    result.totalScore >= 50 ? '#f59e0b' : '#ef4444';

  const gradeColor =
    result.grade === 'A' ? '#22c55e' :
    result.grade === 'B' ? '#84cc16' :
    result.grade === 'C' ? '#f59e0b' :
    result.grade === 'D' ? '#f97316' : '#ef4444';

  const wordCount = useMemo(() => {
    return props.body.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  }, [props.body]);

  return (
    <div 
      className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col shadow-2xl relative overflow-hidden group"
      style={{ minHeight: '320px' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Fixed header — never scrolls */}
      <div className="p-6 pb-4 flex-shrink-0 relative z-10 border-b border-white/5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/60">SEO Analyzer</span>
            {result.googleNewsReady && (
              <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 tracking-wider uppercase animate-pulse">
                Google News ✓
              </span>
            )}
          </div>
          <span className="text-3xl font-black font-outfit italic" style={{ color: gradeColor }}>
            {result.grade}
          </span>
        </div>

        {/* Score bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-white/60">
            <span>Progress</span>
            <span className="text-sm font-black text-white font-outfit">{result.totalScore}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${result.totalScore}%`, backgroundColor: barColor }}
            />
          </div>
        </div>
      </div>

      {/* Scrollable body — signals + trending + news checklist */}
      <div 
        className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-5 relative z-10 custom-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Signal rows */}
        <div className="space-y-3.5 pt-1">
          {result.signals.map((signal: SeoSignal) => (
            <div key={signal.id} className="group/item flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    signal.status === 'good' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                    signal.status === 'warn' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                  }`} />
                  <span className="text-xs font-bold text-white/80 transition-colors group-hover/item:text-white">{signal.label}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-white/50">
                  {signal.score}/{signal.maxScore}
                </span>
              </div>
              {signal.tip && (
                <p className="text-[10px] text-white/60 ml-4.5 leading-relaxed font-medium">
                  {signal.tip}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/5" />

        {/* Trending keywords */}
        <div className="space-y-2">
          <p className="text-[9px] font-black tracking-[0.2em] uppercase text-white/50">
            Trending in {props.category || 'Tech'}
          </p>
          <div className="flex flex-wrap gap-2">
            {result.trendingKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => {
                  navigator.clipboard?.writeText(kw);
                }}
                className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25 transition-all duration-300 active:scale-95 shadow-sm text-left"
                title="Click to copy"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5" />

        {/* Google News checklist */}
        <div className="space-y-3">
          <p className="text-[9px] font-black tracking-[0.2em] uppercase text-white/50">
            Google News Checklist
          </p>
          <div className="space-y-2">
            {[
              { label: 'Cover image present', pass: !!props.coverUrl },
              { label: 'Title 50–70 chars', pass: props.title.trim().length >= 50 && props.title.trim().length <= 70 },
              { label: 'Summary written', pass: props.summary.trim().length >= 60 },
              { label: 'Category tagged', pass: !!props.category },
              { label: 'Body 400+ words', pass: wordCount >= 400 },
            ].map(({ label, pass }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className={`text-xs font-bold ${pass ? 'text-emerald-400' : 'text-white/20'}`}>
                  {pass ? '✓' : '○'}
                </span>
                <span className={`text-[10px] font-bold ${pass ? 'text-white/70' : 'text-white/40'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
