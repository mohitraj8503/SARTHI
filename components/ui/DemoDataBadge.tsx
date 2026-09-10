'use client';

import { AlertTriangle } from 'lucide-react';

/**
 * DemoDataBadge - A visible badge that indicates demo data is being displayed
 * 
 * Use this component when DEMO_MODE=true and you're showing demo data
 * to make it clear to users that they're seeing sample data.
 */
export function DemoDataBadge() {
  return (
    <div 
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-full shadow-sm"
      title="You're viewing demo data. This is not real user data."
    >
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
        Demo Data
      </span>
    </div>
  );
}

/**
 * DemoBanner - A larger banner for pages showing significant demo content
 */
export function DemoBanner() {
  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">
          You&apos;re viewing demo data. This is not real user data.
        </span>
      </div>
    </div>
  );
}

