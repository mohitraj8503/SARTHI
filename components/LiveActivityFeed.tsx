// LiveActivityFeed Component
'use client';

import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';

export function LiveActivityFeed() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/activity/feed?limit=5');
        if (!res.ok) throw new Error('Failed to fetch activity');
        return res.json() as Promise<{ activities: any[]; total: number }>;
      } catch (e) {
        console.error('Feed error:', e);
        return { activities: [], total: 0 }; // Fallback to empty
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isError) return null; // Fail silently or show empty state if strict error persistence

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const activities = data?.activities || [];

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock className="w-8 h-8 mx-auto mb-3 text-gray-200" />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          No recent activity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 relative">
      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-50" />
      {activities.slice(0, 3).map((activity) => (
        <div key={activity.id} className="relative pl-7 group">
          <div className="absolute left-0.5 top-1.5 w-3 h-3 bg-white border-2 border-brand-orange rounded-full z-10 shadow-sm group-hover:scale-125 transition-transform" />
          <h4 className="font-bold text-gray-900 text-[11px] leading-snug group-hover:text-brand-orange transition-colors">
            {activity.description}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wide">
              {new Date(activity.timestamp).toLocaleDateString()}
            </p>
            <span className="text-[10px] text-brand-orange font-black">
              {activity.type === 'enrollment'
                ? '+50 XP'
                : activity.type === 'submission'
                ? '+25 XP'
                : '✓'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

