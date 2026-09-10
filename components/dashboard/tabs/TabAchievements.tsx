'use client';

import { Trophy, Award, Lock, Zap, Star, Download } from 'lucide-react';
import { useStudentDashboardData } from '@/hooks/useStudentDashboardData';
import { format } from 'date-fns';
import Link from 'next/link';

export default function TabAchievements({ data: propData }: { data?: any }) {
  const { data: fetchedData, isLoading } = useStudentDashboardData();
  
  if (isLoading && !propData) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-bold">Loading achievements...</p>
      </div>
    );
  }

  const data = propData || fetchedData;
  const achievements = data?.achievements || [];
  const userProfile = data?.userProfile || data?.user;
  const streak = data?.streak;

  // Level thresholds based on XP
  const getLevelInfo = (xp: number) => {
    if (xp >= 10000) return { level: 'Master', threshold: 15000, color: 'from-purple-500 to-indigo-500' };
    if (xp >= 5000) return { level: 'Expert', threshold: 10000, color: 'from-amber-500 to-orange-500' };
    if (xp >= 2500) return { level: 'Scholar', threshold: 5000, color: 'from-blue-500 to-cyan-500' };
    return { level: 'Beginner', threshold: 2500, color: 'from-green-500 to-emerald-500' };
  };

  const xp = userProfile?.xp || 0;
  const levelInfo = getLevelInfo(xp);
  const xpProgress = Math.min(((xp % levelInfo.threshold) / levelInfo.threshold) * 100, 100);
  const xpInCurrentLevel = xp % levelInfo.threshold;

  // Define all possible achievements (locked and unlocked)
  const allAchievements = [
    { id: '1', title: 'Fast Starter', icon: '🚀', description: 'Complete your first lesson', earned: achievements.some(a => a.title === 'Fast Starter') },
    { id: '2', title: '7 Day Streak', icon: '🔥', description: 'Learn for 7 days in a row', earned: (streak?.currentStreak || 0) >= 7 },
    { id: '3', title: '30 Day Streak', icon: '⚡', description: 'Learn for 30 days in a row', earned: (streak?.currentStreak || 0) >= 30 },
    { id: '4', title: 'First Course', icon: '📚', description: 'Enroll in your first course', earned: (data?.progressOverview?.enrolledCourses || 0) >= 1 },
    { id: '5', title: 'Course Master', icon: '🎓', description: 'Complete your first course', earned: (data?.progressOverview?.completedCourses || 0) >= 1 },
    { id: '6', title: 'Helpful Hero', icon: '🤝', description: 'Answer 10 community questions', earned: false },
    { id: '7', title: 'Night Owl', icon: '🦉', description: 'Study after midnight', earned: false },
    { id: '8', title: 'Early Bird', icon: '🌅', description: 'Study before 6 AM', earned: false },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 bg-[#F8FAFC] min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
        <div className="space-y-1.5 text-left relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-5 bg-emerald-500 rounded-full" />
            <span className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">ACHIEVEMENT ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
            MY <span className="text-emerald-500">ACHIEVEMENTS</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">Track your study progress, streaks, and milestone badges.</p>
        </div>
        
        {/* XP Card */}
        <div className="bg-white border border-[#EAF0F7] rounded-[28px] p-6 flex items-center gap-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <div className="w-14 h-14 rounded-2xl bg-[#1B4332] flex items-center justify-center text-white text-xl font-black shadow-md">
            {levelInfo.level[0]}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Level</p>
            <p className="text-xl font-black text-slate-900">{levelInfo.level}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1B4332] to-emerald-400 rounded-full" style={{ width: `${xpProgress}%` }} />
              </div>
              <span className="text-[10px] font-bold text-slate-400">{xpInCurrentLevel}/{levelInfo.threshold} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white border border-slate-100 rounded-[28px] p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-2xl font-black text-slate-900 leading-none">{streak?.currentStreak || 0}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Day Streak</span>
         </div>
         
         <div className="bg-white border border-slate-100 rounded-[28px] p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900 leading-none">{achievements.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Badges Earned</span>
         </div>
         
         <div className="bg-white border border-slate-100 rounded-[28px] p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Star className="w-5 h-5 fill-current" />
            </div>
            <span className="text-2xl font-black text-slate-900 leading-none">{xp.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Total XP</span>
         </div>
         
         <div className="bg-white border border-slate-100 rounded-[28px] p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900 leading-none">{data?.progressOverview?.completedCourses || 0}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Courses Done</span>
         </div>
      </div>

      {/* Earned Badges */}
      <section>
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Badges Collection</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{allAchievements.filter(a => a.earned).length}/{allAchievements.length} Unlocked</span>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
             {allAchievements.map((achievement) => (
               <div 
                 key={achievement.id}
                 className={`aspect-square rounded-[28px] flex flex-col items-center justify-center p-4 text-center transition-all ${
                   achievement.earned 
                     ? 'bg-white border border-emerald-100 shadow-md hover:-translate-y-1' 
                     : 'bg-slate-50 border border-slate-200 opacity-60'
                 }`}
               >
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2 ${achievement.earned ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                       {achievement.icon}
                   </div>
                   <p className={`text-xs font-black uppercase tracking-tight ${achievement.earned ? 'text-slate-900' : 'text-slate-400'}`}>
                     {achievement.title}
                   </p>
                   {achievement.earned && (
                     <p className="text-[9px] text-slate-400 font-medium mt-1">{achievement.description}</p>
                   )}
               </div>
             ))}
         </div>
      </section>

      {/* Certificates Section */}
      <section>
         <div className="flex items-center gap-3 mb-6">
            <Award className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">My Certificates</h2>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.progressOverview?.completedCourses ? (
              <div className="bg-white border border-[#EAF0F7] rounded-[32px] p-8 flex items-center gap-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] relative overflow-hidden group hover:-translate-y-1 transition-all">
                 <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Award className="w-7 h-7" />
                 </div>
                 <div className="flex-1">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-1">Certificate of Completion</h3>
                    <p className="text-xs font-medium text-slate-500 mb-4">Completed {data?.progressOverview?.completedCourses || 0} course(s)</p>
                    <button className="px-6 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-black hover:bg-[#2D6A4F] transition-all uppercase tracking-wider flex items-center gap-2 shadow-md">
                       <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                 </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-10 flex flex-col items-center justify-center text-center bg-white">
                 <Award className="w-10 h-10 text-slate-300 mb-3" />
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Complete courses to earn official certificates</p>
                 <Link 
                   href="/dashboard/courses"
                   className="mt-4 px-6 py-3 bg-[#1B4332] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#2D6A4F] transition-all shadow-md"
                 >
                   View My Courses
                 </Link>
              </div>
            )}
         </div>
      </section>
    </div>
  );
}

