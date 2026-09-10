
import React from 'react';

export default function Loading() {
  return (
    <div className="pt-28 pb-20 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-16 animate-pulse">

        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-6">
            <div className="h-4 w-32 bg-white/5 rounded-full" />
            <div className="h-16 w-96 bg-white/5 rounded-2xl" />
            <div className="h-4 w-[500px] bg-white/5 rounded-lg" />
          </div>
          <div className="flex gap-4">
            <div className="h-16 w-48 bg-white/5 rounded-2xl" />
            <div className="h-16 w-48 bg-white/5 rounded-2xl" />
          </div>
        </div>

        {/* Banner Skeleton */}
        <div className="h-64 bg-white/5 rounded-[3rem] w-full border border-white/5" />

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-white/5 rounded-[2.5rem] border border-white/5 p-8 space-y-6">
              <div className="h-12 w-12 bg-white/10 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 w-24 bg-white/10 rounded-lg" />
                <div className="h-4 w-16 bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-10 w-64 bg-white/5 rounded-xl" />
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-[3rem] border border-white/5" />
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-[400px] bg-white/5 rounded-[3rem] border border-white/5" />
            <div className="h-48 bg-white/5 rounded-[3rem] border border-white/5" />
          </div>
        </div>

      </div>
    </div>
  );
}

