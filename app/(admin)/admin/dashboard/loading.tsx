import React from 'react';

export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6 space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-32 animate-pulse" />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 animate-pulse" />
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 animate-pulse" />
      </div>

      {/* Recent Activity / Tables */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] animate-pulse" />
    </div>
  );
}

