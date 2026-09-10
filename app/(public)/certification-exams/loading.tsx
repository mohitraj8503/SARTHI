import React from 'react';

export default function CertificationsLoading() {
  return (
    <div className="bg-[#F5F0E8] min-h-screen">
      {/* Header Skeleton */}
      <div className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-[#E8E2D9]">
          <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-4xl">
                  <div className="h-6 w-48 bg-[#2D6A4F]/10 rounded-full animate-pulse mb-6" />
                  <div className="h-16 w-3/4 bg-[#1A3C2E]/5 rounded-2xl animate-pulse mb-6" />
                  <div className="h-8 w-1/2 bg-[#5D705C]/5 rounded-xl animate-pulse" />
              </div>
          </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          {/* Controls Skeleton */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center mb-12">
              <div className="flex-1 h-14 bg-white border border-[#E8E2D9] rounded-2xl animate-pulse" />
              <div className="w-64 h-14 bg-white border border-[#E8E2D9] rounded-2xl animate-pulse" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white border border-[#E8E2D9] rounded-[32px] p-8 h-[550px] space-y-6">
                      <div className="aspect-[4/3] w-full bg-[#1A3C2E]/5 rounded-[24px] animate-pulse" />
                      <div className="flex justify-between">
                          <div className="h-6 w-24 bg-[#F5F0E8] rounded-full animate-pulse" />
                          <div className="h-6 w-6 bg-[#2D6A4F]/10 rounded-full animate-pulse" />
                      </div>
                      <div className="space-y-4">
                          <div className="h-8 w-full bg-[#1A3C2E]/5 rounded-xl animate-pulse" />
                          <div className="h-16 w-full bg-[#5D705C]/5 rounded-xl animate-pulse" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div className="h-12 bg-[#F5F0E8]/50 rounded-2xl border border-[#E8E2D9] animate-pulse" />
                          <div className="h-12 bg-[#F5F0E8]/50 rounded-2xl border border-[#E8E2D9] animate-pulse" />
                      </div>
                      <div className="pt-8 border-t border-[#F5F0E8] flex justify-between items-center">
                          <div className="space-y-2">
                              <div className="h-3 w-16 bg-[#5D705C]/10 rounded animate-pulse" />
                              <div className="h-5 w-24 bg-[#1A3C2E]/5 rounded animate-pulse" />
                          </div>
                          <div className="h-14 w-32 bg-[#1A3C2E] rounded-[16px] animate-pulse" />
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}

