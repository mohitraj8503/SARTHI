import { prisma } from '@/lib/prisma';
import { getTeacherDashboardData } from '@/lib/teacher/dashboard-data';
import { formatCurrency, formatNumber } from '@/lib/utils/dashboard-utils';
import { IndianRupee, Users, Activity, CheckCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

import DashboardHeader from '@/components/teacher/dashboard/DashboardHeader';
import StatCard from '@/components/teacher/dashboard/StatCard';
import QuickActions from '@/components/teacher/dashboard/QuickActions';
import LiveSessionsPanel from '@/components/teacher/dashboard/LiveSessionsPanel';
import DashboardActions from '@/components/teacher/dashboard/DashboardActions';

export const dynamic = 'force-dynamic';

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser();
  if (!user?.id) {
    redirect('/login');
  }

  const userId = user.id;
  const dashboardResult = await getTeacherDashboardData(userId, user.email, user.name);

  if (!dashboardResult.success || !dashboardResult.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-10 bg-[#F8FAFC]">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Sync Interrupted</h2>
          <p className="text-slate-500 mb-8">We couldn&apos;t fetch your latest studio metrics.</p>
          <a href="/teacher/dashboard" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black">
            Try Manual Sync
          </a>
        </div>
      </div>
    );
  }

  const data = dashboardResult.data;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 md:px-10 pb-20 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 right-10 w-72 h-72 bg-emerald-200/30 blur-[90px] rounded-full" />
      <div className="pointer-events-none absolute top-72 -left-20 w-72 h-72 bg-indigo-200/20 blur-[100px] rounded-full" />
      <DashboardHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Content (9 cols) */}
        <main className="lg:col-span-9 space-y-10">

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-100 pb-8 mb-8">
            <div className="space-y-2">
               <div className="flex items-center gap-2 mb-4 sm:mb-5">
                 <div className="h-2 w-6 bg-emerald-500 rounded-full" />
                 <span className="text-xs sm:text-sm font-black text-emerald-600 uppercase tracking-[0.25em]">TEACHER STUDIO</span>
               </div>
               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[0.95]">STUDIO <span className="text-emerald-500">ENGINE</span></h1>
               <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                 <p className="text-slate-600 font-bold text-sm sm:text-base lg:text-lg">Real-time performance monitoring &amp; Analytics</p>
                 <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-wider border border-emerald-100">
                   Sync: {new Date().toLocaleTimeString()}
                 </span>
               </div>
            </div>
            <DashboardActions />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard 
              title="Total Revenue"
              value={formatCurrency(data.stats.totalRevenue, "No earnings yet")}
              change={data.stats.revenueGrowth}
              icon={IndianRupee}
              color="emerald"
            />
            <StatCard 
              title="Active Learners"
              value={formatNumber(data.stats.activeLearners, "No students yet")}
              change={data.stats.learnersGrowth}
              icon={Users}
              color="blue"
            />
            <StatCard 
              title="Engagement Rate"
              value={data.stats.engagementRate ? `${data.stats.engagementRate}%` : "No activity"}
              change={data.stats.engagementGrowth}
              icon={Activity}
              color="amber"
            />
            <StatCard 
              title="Completion rate"
              value={data.stats.completionRate ? `${data.stats.completionRate}%` : "No completions"}
              change={data.stats.completionGrowth}
              icon={CheckCircle}
              color="indigo"
            />
          </div>

          {/* Charts & Main Content */}
          <div className="grid grid-cols-1 gap-8">
            <LiveSessionsPanel />
          </div>
        </main>

        {/* Right Sidebar (3 cols) */}
        <aside className="lg:col-span-3 space-y-8">
          {/* Daily Inspiration */}
          <div className="bg-gradient-to-br from-[#FFF9F0] via-[#FFF8EC] to-[#F7EEDD] rounded-[32px] p-8 text-slate-900 overflow-hidden relative group shadow-[0_18px_40px_rgba(148,120,60,0.12)] border border-[#EEDFBF]">
             <div className="relative z-10">
               <div className="w-8 h-8 bg-amber-100/50 rounded-lg flex items-center justify-center mb-5">
                 <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H11.017C10.4647 13 10.017 12.5523 10.017 12V5C10.017 4.44772 10.4647 4 11.017 4H19.017C20.6739 4 22.017 5.34315 22.017 7V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91238 16 5.01695 16H8.01695C8.56924 16 9.01695 15.5523 9.01695 15V9C9.01695 8.44772 8.56924 8 8.01695 8H4.01695C3.46467 8 3.01695 8.44772 3.01695 9V12C3.01695 12.5523 2.56924 13 2.01695 13H0.0169531C-0.535332 13 -0.983047 12.5523 -0.983047 12V5C-0.983047 4.44772 -0.535332 4 0.0169531 4H8.01695C9.67381 4 11.017 5.34315 11.017 7V15C11.017 18.3137 8.33066 21 5.01695 21H3.017Z" /></svg>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/55 mb-2">Daily Vision</p>
               <p className="text-base font-bold leading-relaxed text-amber-950 italic">
                 &quot;SARTHI is not about competing with others; it&apos;s about outshipping your past self. Build something that matters today.&quot;
               </p>
               <div className="mt-8 flex items-center gap-3">
                 <div className="h-[1px] w-8 bg-amber-200" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">Studio Core</span>
               </div>
             </div>
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-400/10 rounded-full blur-[80px]" />
          </div>

          <QuickActions />
        </aside>
      </div>
    </div>
  );
}

