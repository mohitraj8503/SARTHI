import React from 'react';

/**
 * Premium Loading Skeleton for Teacher Courses Directory
 * Provides immediate visual feedback during server-side data hydration.
 */
export default function Loading() {
  return (
    <div className="pt-28 pb-20 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-12 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="h-4 w-32 bg-white/5 rounded-full" />
            <div className="h-12 w-80 bg-white/5 rounded-2xl" />
            <div className="h-4 w-96 bg-white/5 rounded-lg opacity-50" />
          </div>
          <div className="h-14 w-44 bg-white/10 rounded-2xl" />
        </div>

        {/* Search & Filter Skeleton */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-14 flex-1 bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-14 w-40 bg-white/5 rounded-2xl border border-white/5" />
        </div>

        {/* Courses Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden">
              <div className="h-48 bg-white/10 w-full" />
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="h-4 w-20 bg-white/10 rounded-full" />
                  <div className="h-7 w-full bg-white/10 rounded-lg" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="h-5 w-24 bg-white/5 rounded-lg" />
                  <div className="h-5 w-24 bg-white/5 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
