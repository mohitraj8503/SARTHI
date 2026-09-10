'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, Clock, Star } from 'lucide-react';

export default function QuickStatsWidget() {
  const { data: quickStats, isLoading } = useQuery({
    queryKey: ['quick-stats'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/analytics/quick-stats');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.success ? json.data : { avgRating: 0, totalWatchTime: 0, avgGrowth: 0 };
    }
  });

  const stats = [
    { label: 'Avg Rating', value: quickStats?.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'text-amber-500' },
    { label: 'Watch Time', value: `${(quickStats?.totalWatchTime / 100).toFixed(1)}k hr` || '0.0h', icon: Clock, color: 'text-blue-500' },
    { label: 'Growth', value: `${quickStats?.avgGrowth >= 0 ? '+' : ''}${quickStats?.avgGrowth}%`, icon: TrendingUp, color: 'text-emerald-500' },
  ];

  if (isLoading) return <div className="h-32 bg-slate-50 animate-pulse rounded-[32px]" />;


  return (
    <div className="bg-white rounded-[32px] p-6 border border-[#F1F5F9] shadow-sm">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6">Quick Stats</h3>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-sm font-black text-slate-900">{stat.value}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

