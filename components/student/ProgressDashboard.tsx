'use client'

import { Flame, Trophy, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { CourseProgressCard } from './CourseProgressCard';

interface Summary {
  currentStreak: number;
  totalLessons: number;
  completedLessons: number;
  totalStudyTime: number;
}

/**
 * Motivational Progress Dashboard
 * Visualizes learning streaks and overall curriculum mastery.
 */
export function ProgressDashboard({ courses, summary }: { courses: any[], summary: Summary }) {
  const completionRate = Math.round((summary.completedLessons / (summary.totalLessons || 1)) * 100);

  return (
    <div className="progress-dashboard space-y-8">
      {/* Hero Motivation Card */}
      <div className="relative overflow-hidden bg-emerald-900 rounded-[32px] p-8 text-white shadow-2xl shadow-emerald-900/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">You&apos;re unstoppable! 🔥</h2>
            <p className="text-emerald-100/80 font-medium">Your persistence is building a powerful career foundation.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 text-center min-w-[100px]">
              <div className="text-2xl font-black text-amber-400 mb-0.5">{summary.currentStreak}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-100/60">Day Streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 text-center min-w-[100px]">
              <div className="text-2xl font-black text-white mb-0.5">{completionRate}%</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-100/60">Mastery</div>
            </div>
          </div>
        </div>
        
        {/* Progress Overview Bar */}
        <div className="mt-8 relative h-3 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(52,211,153,0.5)]"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-100/60">
          <span>Curriculum Progress</span>
          <span>{summary.completedLessons} / {summary.totalLessons} Lessons</span>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">In-Progress Curriculum</h3>
        </div>
        
        <div className="grid gap-4">
          {courses.map(course => (
            <CourseProgressCard key={course.id} course={course} />
          ))}
        </div>
        
        {courses.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active courses yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
