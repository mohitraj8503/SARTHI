import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 border-4 border-[#174F3A] border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#174F3A]">Loading Quiz...</h2>
          <p className="text-[#7A8FAF] font-medium">Please wait while we prepare your assessment.</p>
        </div>
      </div>
    </div>
  );
}

