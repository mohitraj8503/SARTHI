import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F0F2F8] p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-lg" />
        <div className="bg-white rounded-[32px] border border-[#E2E8F4] p-10 space-y-10 animate-pulse">
           {[1, 2, 3].map(i => (
             <div key={i} className="space-y-4">
               <div className="h-4 w-24 bg-gray-100 rounded" />
               <div className="h-12 w-full bg-gray-50 rounded-xl" />
             </div>
           ))}
           <div className="h-[200px] w-full bg-gray-50 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
