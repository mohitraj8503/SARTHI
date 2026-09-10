import React from 'react';

/**
 * Premium Loading Skeleton for Teacher Students Directory
 * Provides immediate visual feedback during server-side data hydration.
 */
export default function Loading() {
  return (
    <div className="pt-28 pb-20 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-12 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-32 bg-white/5 rounded-full" />
          <div className="h-12 w-96 bg-white/5 rounded-2xl" />
          <div className="h-4 w-[500px] bg-white/5 rounded-lg opacity-50" />
        </div>

        {/* Filters & Stats Skeleton */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="h-14 flex-1 bg-white/5 rounded-2xl border border-white/5 w-full" />
          <div className="flex gap-4 w-full md:w-auto">
            <div className="h-14 w-32 bg-white/5 rounded-2xl border border-white/5 flex-1 md:flex-none" />
            <div className="h-14 w-32 bg-white/5 rounded-2xl border border-white/5 flex-1 md:flex-none" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="h-6 w-48 bg-white/10 rounded-lg" />
            <div className="h-6 w-32 bg-white/10 rounded-lg" />
          </div>
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-8 flex items-center gap-6">
                <div className="h-12 w-12 bg-white/10 rounded-full shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 bg-white/10 rounded-lg" />
                  <div className="h-4 w-32 bg-white/5 rounded-lg" />
                </div>
                <div className="hidden md:block h-5 w-32 bg-white/5 rounded-lg" />
                <div className="h-8 w-24 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
