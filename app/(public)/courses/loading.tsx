"use client";

import { BookOpen } from 'lucide-react';

export default function Loading() {
  return (
    <div className="relative min-h-screen bg-[#F5F0E8] text-[#1A3C2E] overflow-hidden">
      {/* Background Patterns */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#2D6A4F]/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'radial-gradient(#1A3C2E 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="container mx-auto max-w-screen-xl pt-4 pb-32 relative z-10 px-6 md:px-12" style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header Skeleton */}
        <div className="mb-8 pt-0">
          <h1 className="sr-only">Loading SARTHI Courses</h1>
          <div className="h-3 w-24 bg-[#2D6A4F]/20 rounded mb-4 animate-pulse" />
          <div className="h-14 w-80 bg-[#1A3C2E]/10 rounded mb-4 animate-pulse" />
          <div className="h-6 w-[480px] bg-[#5D705C]/20 rounded mb-10 animate-pulse" />

          {/* Controls Row Skeleton */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
            <div className="flex-1 h-12 bg-white border border-[#E8E2D9] rounded-[10px] animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="h-12 w-24 bg-white border border-[#E8E2D9] rounded-full animate-pulse" />
              <div className="h-12 w-40 bg-white border border-[#E8E2D9] rounded-[10px] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12 items-start">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block sticky top-[88px] h-fit">
            <div className="bg-white border border-[#E8E2D9] rounded-[16px] p-6 shadow-sm space-y-7">
              <div>
                <div className="h-3 w-16 bg-[#5D705C]/20 rounded mb-4 animate-pulse" />
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-[18px] h-[18px] rounded-[5px] border border-[#C5D5C0] animate-pulse" />
                      <div className="h-4 w-24 bg-[#5D705C]/20 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Courses Grid Skeleton */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-[#E8E2D9] rounded-[24px] overflow-hidden">
                  {/* Thumbnail Skeleton */}
                  <div className="relative w-full aspect-[16/10] bg-[#1A3C2E]/10 animate-pulse">
                    <div className="absolute top-4 left-4">
                      <div className="h-6 w-20 bg-white/20 rounded-full animate-pulse" />
                    </div>
                  </div>

                  <div className="p-8">
                    {/* Meta Row */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="h-4 w-24 bg-[#2D6A4F]/10 rounded animate-pulse" />
                      <div className="h-5 w-20 bg-[#F5F0E8] rounded-full animate-pulse" />
                    </div>

                    {/* Title */}
                    <div className="h-7 w-full bg-[#1A3C2E]/10 rounded mb-4 animate-pulse" />
                    <div className="h-7 w-3/4 bg-[#1A3C2E]/10 rounded mb-6 animate-pulse" />

                    {/* Instructor */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-[#E8F5EE] rounded-[6px] animate-pulse" />
                      <div className="h-4 w-32 bg-[#5D705C]/20 rounded animate-pulse" />
                    </div>

                    {/* Description */}
                    <div className="h-4 w-full bg-[#5D705C]/10 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-2/3 bg-[#5D705C]/10 rounded mb-8 animate-pulse" />

                    {/* Footer */}
                    <div className="pt-6 border-t border-[#F5F0E8] flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="h-2 w-20 bg-[#5D705C]/20 rounded animate-pulse" />
                        <div className="h-6 w-24 bg-[#1A3C2E]/10 rounded animate-pulse" />
                      </div>
                      <div className="h-12 w-28 bg-[#1A3C2E]/10 rounded-[12px] animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

