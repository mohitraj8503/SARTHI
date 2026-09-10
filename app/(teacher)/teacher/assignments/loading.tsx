import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F0F2F8] p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-lg" />
        <div className="h-12 w-40 bg-gray-200 animate-pulse rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-[#E2E8F4] overflow-hidden animate-pulse">
        <div className="h-16 bg-gray-50 border-b border-[#E2E8F4]" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 border-b border-gray-50 p-6 space-y-3">
            <div className="h-4 w-1/3 bg-gray-100 rounded" />
            <div className="h-3 w-1/4 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

