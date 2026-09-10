'use client';

import { CourseHealthData } from '@/lib/services/teacher-studio';
import { formatCurrency } from '@/lib/utils/dashboard-utils';
import { cn } from '@/lib/utils';
import { Trophy, Star, TrendingUp, AlertCircle, Heart, Users } from 'lucide-react';

interface StudioInsightsProps {
  target: { current: number; goal: number };
  courses: CourseHealthData[];
  isLoading?: boolean;
}

export default function StudioInsights({ target, courses, isLoading }: StudioInsightsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] h-full animate-pulse">
        <div className="h-40 bg-slate-50 rounded-3xl mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const targetProgress = Math.min((target.current / target.goal) * 100, 100);
  const goalMet = target.current >= target.goal;

  return (
    <div className="space-y-8">
      {/* Revenue Target Progress */}
      <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-emerald-500/20" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">REVENUE TARGET</h3>
              <p className="text-2xl font-black text-white tracking-tighter">Goal Pursuit</p>
            </div>
            {goalMet && (
              <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                <Trophy className="w-3 h-3" />
                Goal Achieved
              </div>
            )}
          </div>

          <div className="space-y-6">
             <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-white tracking-tighter leading-none mb-2">{formatCurrency(target.current)}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Current Milestone</p>
                </div>
                <p className="text-sm font-black text-emerald-400 tracking-tighter">{Math.round(targetProgress)}%</p>
             </div>

             <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  style={{ width: `${targetProgress}%` }} 
                />
             </div>

             <p className="text-[11px] text-slate-400 font-medium">
                Target: <span className="text-white font-black">{formatCurrency(target.goal)}</span> • {goalMet ? 'Milestone Cleared' : `${formatCurrency(target.goal - target.current)} remaining`}
             </p>
          </div>
        </div>
      </div>

      {/* Course Health Monitor */}
      <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="space-y-1">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">STUDIO DIAGNOSTICS</h3>
            <p className="text-xl font-black text-slate-900 tracking-tight">Course Health</p>
          </div>
          <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
        </div>

        <div className="space-y-4">
          {courses.map((course) => {
            const isLowHealth = course.healthScore < 50;
            return (
              <div key={course.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-emerald-200 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[13px] font-black text-slate-900 tracking-tight leading-none mb-1.5 truncate group-hover:text-emerald-600 transition-colors">{course.title}</p>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500">{course.students}</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px] font-bold text-slate-500">{course.rating}</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "flex flex-col items-end gap-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    isLowHealth ? "bg-rose-50 text-rose-600 shadow-sm" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {isLowHealth ? <AlertCircle className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    {course.healthScore}%
                  </div>
                </div>

                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      isLowHealth ? "bg-rose-500" : "bg-emerald-500"
                    )} 
                    style={{ width: `${course.healthScore}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

