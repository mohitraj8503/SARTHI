'use client';

import React, { useMemo, memo } from 'react';
import { LucideIcon, Users, DollarSign, UserPlus, CheckCircle2, TrendingUp, UserCheck, BookOpen, ClipboardList, Shield, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Metrics {
    totalRevenue: number;
    revenueChangePct: number;
    activeStudents: number;
    activeStudentsChangePct: number;
    totalUsers: number;
    totalTeachers: number;
    publishedCourses: number;
    pendingApplications: number;
    pendingApprovals?: number;
    todaysEnrollment: number;
    todaysEnrollmentChangePct: number;
    completionRatePct: number;
    completionRateChangePct: number;
}

interface StatCardProps {
    title: string;
    value: string | number;
    label: string;
    color: 'blue' | 'emerald' | 'amber' | 'rose';
    icon: LucideIcon;
    isLoading?: boolean;
    isAlert?: boolean;
}

const StatCard = memo(({ title, value, label, color, icon: Icon, isLoading, isAlert }: StatCardProps) => {
  return (
    <div className={cn(
      "relative overflow-hidden bg-white p-5 sm:p-6 rounded-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-[6px] transition-all duration-500",
      isAlert && "border-rose-200 ring-2 ring-rose-50 shadow-rose-100 shadow-lg animate-pulse"
    )}>
      {/* Subtle Background Gradient */}
      <div className={cn(
        "absolute inset-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500",
        isAlert ? "bg-gradient-to-br from-rose-500 to-pink-600" :
        color === 'blue' ? "bg-gradient-to-br from-blue-500 to-indigo-600" :
        color === 'emerald' ? "bg-gradient-to-br from-emerald-500 to-teal-600" :
        color === 'amber' ? "bg-gradient-to-br from-amber-500 to-orange-600" :
        "bg-gradient-to-br from-rose-500 to-pink-600"
      )} />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
            isAlert ? "bg-rose-50 text-rose-500" :
            color === 'blue' ? "bg-blue-50 text-blue-500" :
            color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
            color === 'amber' ? "bg-orange-50 text-orange-500" :
            "bg-rose-50 text-rose-500"
          )}>
            <Icon className="w-5 h-5 stroke-[3]" />
          </div>
          <p className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-wider">{title}</p>
        </div>

        <div className="flex flex-col">
          {isLoading ? (
            <div className="h-10 w-28 bg-slate-50 animate-pulse rounded-lg" />
          ) : (
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-slate-900 leading-none tracking-tight">
              {value}
            </h2>
          )}
          <p className="text-xs sm:text-sm font-extrabold text-slate-500 mt-2.5 flex items-center gap-1.5">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              isAlert ? "bg-rose-500 animate-ping" :
              color === 'blue' ? "bg-blue-400" :
              color === 'emerald' ? "bg-emerald-400" :
              color === 'amber' ? "bg-amber-400" :
              "bg-rose-400"
            )} />
            {isAlert ? <span className="text-rose-500 font-extrabold uppercase tracking-wide">Action Required</span> : label}
          </p>
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

interface StatsSectionProps {
    metrics?: Metrics;
    isLoading: boolean;
}

export function StatsSection({ metrics, isLoading }: StatsSectionProps) {
    if (!metrics && !isLoading) return null;

    const hasAlerts = (metrics?.pendingApprovals ?? 0) > 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total Revenue"
                value={`₹${metrics?.totalRevenue?.toLocaleString() || '0'}`}
                label={`${metrics?.revenueChangePct && metrics.revenueChangePct >= 0 ? '↑' : '↓'} ${Math.abs(metrics?.revenueChangePct || 0)}% Growth`}
                color="amber" // Using amber which maps to orange-like in this component
                icon={DollarSign}
                isLoading={isLoading}
            />
            <StatCard
                title="Total Students"
                value={metrics?.activeStudents || "0"}
                label={`${metrics?.activeStudents || 0} Registered Learners`}
                color="emerald"
                icon={Users}
                isLoading={isLoading}
            />
            <StatCard
                title="Published Courses"
                value={metrics?.publishedCourses || "0"}
                label="Course Catalog"
                color="blue"
                icon={BookOpen}
                isLoading={isLoading}
            />
            <StatCard
                title="Pending Approvals"
                value={metrics?.pendingApprovals ?? metrics?.pendingApplications ?? "0"}
                label="Action Required"
                color={hasAlerts ? "rose" : "blue"}
                icon={Shield}
                isLoading={isLoading}
                isAlert={hasAlerts}
            />
        </div>
    );
}

