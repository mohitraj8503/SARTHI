'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Globe, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReadinessCheckItem {
  id: string;
  label: string;
  passed: boolean;
  warning?: boolean;
  message: string;
}

interface PublishingReadinessPanelProps {
  checks: ReadinessCheckItem[];
  onPublishClick?: () => void;
  isPublishing?: boolean;
}

export default function PublishingReadinessPanel({
  checks,
  onPublishClick,
  isPublishing = false,
}: PublishingReadinessPanelProps) {
  const passedCount = checks.filter(c => c.passed).length;
  const totalCount = checks.length;
  const isReady = passedCount === totalCount;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5 text-amber-600" /> News & Editorial Readiness
          </h3>
          <p className="text-[11px] font-normal text-slate-400 mt-0.5">
            {passedCount} of {totalCount} quality & crawlability standards met
          </p>
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
          isReady ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isReady ? "bg-emerald-500" : "bg-amber-500")} />
          {isReady ? "News Ready" : "In Progress"}
        </div>
      </div>

      {/* Google News Technical SEO Indicators */}
      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between font-medium text-slate-700">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-slate-400" /> NewsArticle JSON-LD Schema
          </span>
          <span className="text-emerald-600 font-bold">Auto-Generated</span>
        </div>
        <div className="flex items-center justify-between font-medium text-slate-700">
          <span className="flex items-center gap-1.5">
            <Newspaper className="w-3 h-3 text-slate-400" /> Google News Sitemap
          </span>
          <span className="text-emerald-600 font-bold">48h Window Eligible</span>
        </div>
      </div>

      <div className="space-y-2">
        {checks.map(check => (
          <div
            key={check.id}
            className={cn(
              "flex items-start gap-2.5 p-2.5 rounded-xl border transition-all text-xs",
              check.passed
                ? "bg-slate-50/50 border-slate-100 text-slate-700"
                : check.warning
                  ? "bg-amber-50/40 border-amber-100 text-amber-800"
                  : "bg-red-50/40 border-red-100 text-red-700"
            )}
          >
            {check.passed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            ) : check.warning ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <span className="font-semibold text-[11px] block text-slate-900">{check.label}</span>
              <span className="text-[11px] text-slate-500 block leading-tight">{check.message}</span>
            </div>
          </div>
        ))}
      </div>

      {onPublishClick && (
        <button
          onClick={onPublishClick}
          disabled={isPublishing}
          className="w-full py-2.5 bg-[#0F172A] hover:bg-[#F97316] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
        >
          {isPublishing ? 'Publishing...' : 'Validate & Publish News'}
        </button>
      )}
    </div>
  );
}
