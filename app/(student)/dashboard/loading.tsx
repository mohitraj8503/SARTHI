'use client';

export default function DashboardLoading() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-32 space-y-10 animate-fade-in">
      {/* Header Skeleton */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-slate-100 rounded-md animate-pulse" />
        </div>
        <div className="hidden md:block h-10 w-32 bg-slate-100 rounded-xl animate-pulse" />
      </header>

      <div className="space-y-6">
        {/* Hero Skeleton */}
        <div className="h-64 w-full bg-slate-100 rounded-[32px] animate-pulse" />

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-50 rounded-[24px] animate-pulse" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-8">
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-slate-50 rounded-[24px] animate-pulse" />
              ))}
            </div>
          </div>
          <div className="h-96 w-full bg-slate-50 rounded-[32px] animate-pulse" />
        </div>
      </div>
    </div>
  );
}


