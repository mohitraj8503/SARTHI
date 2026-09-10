'use client';

import { GraduationCap, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherStatsProps {
  summary: {
    total: number;
    verified: number;
    pending: number;
  };
  isLoading: boolean;
}

export const TeacherStats = ({ summary, isLoading }: TeacherStatsProps) => {
  const stats = [
    {
      title: 'Total Faculty',
      value: isLoading ? '...' : summary.total,
      label: 'Expert Educators',
      icon: GraduationCap,
      color: 'blue'
    },
    {
      title: 'Verified',
      value: isLoading ? '...' : summary.verified,
      label: 'Quality Assured',
      icon: CheckCircle2,
      color: 'green'
    },
    {
      title: 'Pending',
      value: isLoading ? '...' : summary.pending,
      label: 'Needs Review',
      icon: Clock,
      color: 'amber'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="relative overflow-hidden bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-[6px] transition-all duration-500">
          {/* Subtle Background Gradient */}
          <div className={cn(
            "absolute inset-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500",
            stat.color === 'blue' ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
            stat.color === 'green' ? "bg-gradient-to-br from-emerald-500 to-teal-600" :
            "bg-gradient-to-br from-amber-500 to-orange-600"
          )} />

          <div className="relative flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                stat.color === 'green' ? "bg-emerald-50 text-emerald-600" :
                "bg-amber-50 text-amber-600"
              )}>
                <stat.icon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.title}</p>
            </div>
            
            <div className="flex flex-col">
              <h2 className="text-[32px] font-black text-[#0F172A] leading-none tracking-tight">
                {stat.value}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-1.5">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  stat.color === 'blue' ? "bg-blue-400" :
                  stat.color === 'green' ? "bg-emerald-400" :
                  "bg-amber-400"
                )} />
                {stat.label}
              </p>
            </div>
          </div>
        </div>
      ))}
      <div className="bg-slate-50/40 p-6 rounded-[2.5rem] border border-dashed border-slate-200 flex items-center justify-center group hover:bg-slate-50 transition-colors">
         <div className="text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Live Feed</p>
           <div className="flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[11px] font-bold text-slate-400">System Synced</span>
           </div>
         </div>
      </div>
    </div>
  );
};

