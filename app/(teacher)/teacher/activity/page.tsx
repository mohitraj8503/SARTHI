'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { 
  UserPlus, 
  CheckCircle, 
  MessageCircle, 
  CreditCard, 
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

export default function ActivityPage() {
  const [filter, setFilter] = useState<'all' | 'enrollment' | 'completion' | 'question' | 'payout'>('all');

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity-feed', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      
      const res = await fetch(`/api/teacher/activity?${params}`);
      if (!res.ok) throw new Error('Failed to fetch activity');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-20 flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing Stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Activity <span className="text-emerald-500">Stream</span></h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Real-time student interaction ledger</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 gap-1 overflow-x-auto">
            {['all', 'enrollment', 'completion', 'question', 'payout'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={cn(
                  "px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap",
                  filter === type 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
          {activities?.data?.length === 0 ? (
            <div className="text-center py-32 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                 <Search className="w-6 h-6 text-slate-200" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Quiet on the front</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">No interactions match your filter</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {activities?.data?.map((activity: any) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'enrollment': return { icon: UserPlus, color: 'bg-blue-50 text-blue-600', label: 'Enrollment' };
      case 'completion': return { icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600', label: 'Completion' };
      case 'question': return { icon: MessageCircle, color: 'bg-amber-50 text-amber-600', label: 'Question' };
      case 'payout': return { icon: CreditCard, color: 'bg-indigo-50 text-indigo-600', label: 'Payout' };
      default: return { icon: ArrowRight, color: 'bg-slate-50 text-slate-600', label: 'Event' };
    }
  };

  const config = getIcon(activity.type);

  const handleClick = () => {
    const routes: Record<string, string> = {
      ENROLLMENT: `/teacher/students/${activity.user?.id}`,
      COMPLETION: `/teacher/courses/${activity.courseId}/analytics`,
      QUESTION: `/teacher/questions?id=${activity.id}`,
      PAYOUT: `/teacher/analytics/revenue`,
    };
    if (routes[activity.type]) {
      window.location.href = routes[activity.type];
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-8 hover:bg-slate-50/50 transition-all group flex items-center gap-8"
    >
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm", config.color)}>
        <config.icon className="w-6 h-6" />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-3">
          <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md", config.color)}>
            {config.label}
          </span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">
            {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
          </span>
        </div>
        <p className="text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
          {activity.description || `${activity.user?.name || 'Someone'} triggered a ${activity.type} event.`}
        </p>
        <p className="text-xs font-medium text-slate-400">
          Interaction ID: <span className="font-bold text-slate-500">#{activity.id.slice(-8).toUpperCase()}</span>
        </p>
      </div>
      
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </div>
    </button>
  );
}

