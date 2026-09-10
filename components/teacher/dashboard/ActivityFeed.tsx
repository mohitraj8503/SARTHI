'use client';

import { ActivityEvent } from '@/lib/services/teacher-studio';
import { cn } from '@/lib/utils';
import { 
  UserPlus, 
  CheckCircle, 
  MessageCircle, 
  CreditCard, 
  ArrowUpRight 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ActivityFeedProps {
  events: ActivityEvent[];
  isLoading?: boolean;
}

export default function ActivityFeed({ events, isLoading }: ActivityFeedProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] h-full animate-pulse">
        <div className="h-6 w-32 bg-slate-100 mb-8" />
        <div className="space-y-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'enrollment': return { icon: UserPlus, color: 'bg-blue-50 text-blue-600' };
      case 'completion': return { icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' };
      case 'question': return { icon: MessageCircle, color: 'bg-amber-50 text-amber-600' };
      case 'payout': return { icon: CreditCard, color: 'bg-indigo-50 text-indigo-600' };
      default: return { icon: ArrowUpRight, color: 'bg-slate-50 text-slate-600' };
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="space-y-1">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">LIVE MONITORING</h3>
          <p className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</p>
        </div>
        <Link 
          href="/teacher/activity"
          className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
        >
          View All Stream
        </Link>
      </div>

      <div className="flex-1 space-y-6">
        {events.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center py-10">No activity yet</p>
        ) : (
          events.map((event) => {
            const config = getIcon(event.type);
            const handleClick = () => {
              const routes: Record<string, string> = {
                enrollment: `/teacher/students/${event.student_id}`,
                completion: `/teacher/courses/${event.course_id}/analytics`,
                question: `/teacher/questions?id=${event.id}`,
                payout: `/teacher/analytics/revenue`,
              };
              if (routes[event.type.toLowerCase()]) {
                window.location.href = routes[event.type.toLowerCase()];
              } else {
                window.location.href = '/teacher/activity';
              }
            };

            return (
              <button
                key={event.id}
                onClick={handleClick}
                className="w-full flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100 text-left"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm",
                  config.color
                )}>
                  <config.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px] font-black text-slate-900 tracking-tight truncate">{event.description}</p>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      {new Date(event.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-1">
                    {event.type.toUpperCase()} Event
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
}


