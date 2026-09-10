import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F0F2F8] p-8 space-y-10">
      <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white h-32 rounded-2xl border border-[#E2E8F4] animate-pulse" />
        ))}
      </div>
      <div className="bg-white h-[400px] rounded-[32px] border border-[#E2E8F4] animate-pulse" />
    </div>
  );
}

