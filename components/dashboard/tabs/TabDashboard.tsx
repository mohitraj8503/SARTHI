'use client';

import { ArrowRight, BookOpen, Clock, Award, FileText, CheckCircle2, AlertCircle, RefreshCw, LogIn, Trophy, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Greeting } from '../Greeting';
import { useStudentDashboardData } from '@/hooks/useStudentDashboardData';
import { formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'next/navigation';

import { CourseProgress, AssignmentItem, Seminar, JourneyState } from '@/types/dashboard';
import CurrentFocus from '../sections/CurrentFocus';

export default function TabDashboard() {
  const searchParams = useSearchParams();
  const { data, isLoading, error, refetch } = useStudentDashboardData();
  
  // Extract nested data safely
  const user = data?.userProfile;
  const progressOverview = data?.progressOverview;
  const streak = data?.streak;
  
  // Build continue learning from recent activity
  const continueLearning: CourseProgress[] = (data?.recentActivity || [])
    ?.filter((a: any) => a.type === 'lesson_completed')
    ?.slice(0, 3)
    ?.map((a: any) => ({
      id: a.id,
      title: a.title.replace('Completed: ', ''),
      progress: 0,
      thumbnail: undefined,
      nextLesson: { title: 'Continue Learning', type: 'video' as const }
    })) || [];

  const seminars: Seminar[] = []; // Would need to fetch from seminars API

  const assignmentsDue: AssignmentItem[] = (data?.recentActivity || [])
    ?.filter((a: any) => a.type === 'assignment')
    ?.slice(0, 4)
    ?.map((a: any) => ({
      id: a.id,
      title: a.title,
      courseName: a.course,
      dueDate: a.timestamp,
      points: 10,
      status: 'pending' as const
    })) || [];

  if (isLoading) {
    return (
      <div className="space-y-10 animate-pulse transition-all duration-500">
        <div className="space-y-3">
          <div className="h-10 bg-muted rounded-lg w-1/3"></div>
          <div className="h-5 bg-muted/60 rounded-lg w-1/2"></div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[1,2,3,4].map(i => (
             <div key={i} className="h-24 bg-card border border-border rounded-xl"></div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
                <div className="h-6 bg-muted rounded-lg w-40 mb-4"></div>
                {[1,2].map(i => (
                    <div key={i} className="h-32 bg-card border border-border rounded-xl"></div>
                ))}
            </div>
            <div className="lg:col-span-4 space-y-6">
                <div className="h-40 bg-card border border-border rounded-xl"></div>
                <div className="h-32 bg-card border border-border rounded-xl"></div>
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorData = error as Error & { status?: number; message?: string };
    const status = errorData.status;
    const errorMessage = errorData.message || 'Unknown error';
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
        >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
                {status === 401 ? 'Session Expired' : status === 404 ? 'User Not Found' : 'Connection Issues'}
            </h3>
            
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                {status === 401 
                    ? 'Your session has timed out. Please sign in again to continue learning.' 
                    : status === 404
                    ? 'Your account was not found. Please contact support or try signing up again.'
                    : 'Unable to connect to the server. This may be a temporary issue.'}
            </p>

            <p className="text-xs text-muted-foreground/50 mb-4">
                Debug: {errorMessage}
            </p>

            {status === 401 ? (
                <Link href="/login" className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> Sign In Now
                </Link>
            ) : (
                <button 
                    onClick={() => refetch()} 
                    className="px-8 py-3 bg-foreground text-background rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" /> Retry Connection
                </button>
            )}
        </motion.div>
    );
  }

  // Calculate stats from real data
  const activeCoursesCount = progressOverview?.inProgressCourses || 0;
  const enrolledCount = progressOverview?.enrolledCourses || 0;
  const completedCount = progressOverview?.completedCourses || 0;
  const streakCount = streak?.currentStreak || 0;
  const totalXP = user?.xp || 0;

  // Determine journey state
  const journeyState: JourneyState = enrolledCount === 0 ? 'new' : 'active';
  // TODO: Add logic for near-completion and event-focused states

  // Level Calculation
  const getLevelInfo = (xp: number) => {
    if (xp >= 10000) return { level: 'Master', threshold: 15000 };
    if (xp >= 5000) return { level: 'Expert', threshold: 10000 };
    if (xp >= 2500) return { level: 'Scholar', threshold: 5000 };
    return { level: 'Beginner', threshold: 2500 };
  };
  
  const levelInfo = getLevelInfo(totalXP);
  const xpProgress = Math.min(((totalXP % levelInfo.threshold) / levelInfo.threshold) * 100, 100);
  const xpInCurrentLevel = totalXP % levelInfo.threshold;

  const STATS_UI = [
    { label: 'Active', value: activeCoursesCount, icon: BookOpen },
    { label: 'Completed', value: completedCount, icon: CheckCircle2 },
    { label: 'Streak', value: `${streakCount} Days`, icon: Clock },
    { label: 'XP Earned', value: totalXP.toLocaleString(), icon: Trophy },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* 1. TOP BAR AREA (Welcome + Stats) */}
      <div className="flex flex-col lg:flex-row items-end justify-between gap-6 mb-2">
         <div>
            <h1 className="text-[36px] lg:text-[42px] font-bold text-foreground tracking-tight leading-tight">
               Dashboard
            </h1>
            <p className="text-muted-foreground text-[15px] font-medium mt-1">
               Welcome back, <span className="text-foreground font-bold">{user?.name?.split(' ')[0] || 'Learner'}</span>. You&apos;re making great progress!
            </p>
         </div>
         
         {/* Minimal Stats Strip */}
         <div className="flex items-center gap-3 lg:gap-4 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
            {STATS_UI.map((stat) => (
               <div key={stat.label} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 min-w-[140px] shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                     <stat.icon className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[16px] font-bold text-slate-900 leading-none">{stat.value}</p>
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-1">{stat.label}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* 2. MAIN GRID LAYOUT (70% - 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
          {/* LEFT COLUMN (70%) */}
          <div className="lg:col-span-8 space-y-8">

             <CurrentFocus
               enrolledCoursesCount={enrolledCount}
               journeyState={journeyState}
               continueLearning={continueLearning}
             />

            {/* RECENT TASKS (Minimal Table) */}
            <section>
               <h2 className="text-[20px] font-bold text-slate-800 tracking-tight mb-4">Assignments & Tasks</h2>
               <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  {assignmentsDue.length > 0 ? (
                     <div className="divide-y divide-slate-100">
                        {assignmentsDue.map((task) => (
                           <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group cursor-pointer">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${task.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                 <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[14px] font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{task.title}</p>
                                 <p className="text-[12px] text-slate-500 font-medium">{task.courseName} • Due {new Date(task.dueDate).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                 <Link 
                                   href={`/dashboard?tab=assignments&id=${task.id}`}
                                   className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-primary hover:text-white transition-colors"
                                 >
                                    {task.status === 'pending' ? 'Start' : 'View'}
                                 </Link>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="p-8 text-center">
                        <p className="text-slate-400 font-medium text-sm">You are all caught up on tasks!</p>
                     </div>
                  )}
                  <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                     <Link href="/dashboard?tab=assignments" className="text-xs font-bold text-slate-500 hover:text-primary uppercase tracking-wider">
                        View All Tasks
                     </Link>
                  </div>
               </div>
            </section>
         </div>

         {/* RIGHT COLUMN (30%) */}
         <div className="lg:col-span-4 space-y-8">
            
            {/* LIVE SESSIONS */}
            <section>
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[18px] font-bold text-slate-800">Seminars</h2>
                  <Clock className="w-4 h-4 text-slate-400" />
               </div>
               
               {seminars.length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-1 overflow-hidden shadow-sm">
                     <div className="bg-slate-900 rounded-xl p-5 text-white relative overflow-hidden group">
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                           <span className="relative flex h-2.5 w-2.5">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                           </span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Live</span>
                        </div>
                        
                        <div className="mt-8">
                           <h3 className="text-lg font-bold leading-tight mb-1">{seminars[0].title}</h3>
                           <p className="text-slate-400 text-xs font-medium mb-6">Hosted by {seminars[0].instructorName || 'SARTHI'}</p>
                           
                           {seminars[0].meetingLink ? (
                             <a 
                               href={seminars[0].meetingLink}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="block w-full h-10 bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all active:scale-[0.98] text-center flex items-center justify-center"
                             >
                                Join Class
                             </a>
                           ) : (
                             <Link 
                               href="/dashboard?tab=seminars"
                               className="block w-full h-10 bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all active:scale-[0.98] text-center flex items-center justify-center"
                             >
                                Join Class
                             </Link>
                           )}
                        </div>

                        {/* Decor */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
                     </div>
                  </div>
               ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
                     <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-5 h-5 text-slate-400" />
                     </div>
                     <p className="text-sm font-bold text-slate-700">No sessions today</p>
                     <Link href="/dashboard?tab=seminars" className="text-xs text-slate-400 mt-1 hover:text-primary block">Check upcoming sessions →</Link>
                  </div>
               )}
            </section>

            {/* STREAK & XP WIDGET */}
            <section>
               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                           <Trophy className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-700">{levelInfo.level}</span>
                     </div>
                     <span className="text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-md">{levelInfo.level}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                     <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
                        <span>XP Progress</span>
                        <span>{xpInCurrentLevel} / {levelInfo.threshold}</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-gradient-to-r from-orange-400 to-primary rounded-full" 
                           style={{ width: `${xpProgress}%` }}
                        />
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                     <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Current Streak</p>
                        <p className="text-xl font-black text-slate-900 flex items-center gap-1">
                           {streakCount} <span className="text-sm text-orange-500">Days 🔥</span>
                        </p>
                     </div>
                  </div>
               </div>
            </section>

            {/* UPCOMING SESSIONS */}
            <section>
               <Link href="/dashboard?tab=seminars" className="block bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-slate-800">Upcoming Sessions</h3>
                     <span className="text-xs font-medium text-primary">View All</span>
                  </div>
                  <p className="text-sm text-slate-500">Check out our live workshops and seminars</p>
               </Link>
            </section>

         </div>
      </div>
    </div>
  );
}

