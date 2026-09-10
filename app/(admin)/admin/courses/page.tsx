'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Clock,
  Download,
  Filter,
  ArrowRight,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Command,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit,
  BarChart3,
  TrendingUp,
  Layout,
  IndianRupee,
  Settings,
  Eye,
  Info,
  ChevronLeft
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseCreateModal } from '@/components/admin/CourseCreateModal';
import { CourseActionsMenu } from '@/components/admin/CourseActionsMenu';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { useAdmin } from '@/lib/contexts/AdminContext';
import Image from 'next/image';
import { SafeDate } from '@/components/admin/SafeDate';

interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  price: number;
  isPublished: boolean;
  isActive: boolean;
  publish_state: string;
  thumbnail?: string;
  instructor: { name: string; image?: string };
  _count: { enrollments: number };
  createdAt: string;
  slug: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { addToast } = useToast();
  const { setPrimaryAction } = useAdmin();

  const currentTab = searchParams.get('status') || 'All';
  const searchQuery = searchParams.get('q') || '';

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Register Global Export
  const handleExport = useCallback(() => {
    addToast({ message: 'Preparing your curriculum export...', type: 'success' });
    const statusParam = currentTab.toUpperCase();
    window.open(`/api/admin/courses/export?status=${statusParam}&q=${searchQuery}`, '_blank');
  }, [addToast, currentTab, searchQuery]);

  useEffect(() => {
    setPrimaryAction({
      label: 'EXPORT LIST',
      onClick: handleExport,
      icon: Download
    });
    return () => setPrimaryAction(null);
  }, [handleExport, setPrimaryAction]);

  // Sync Search with URL (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (localSearch) params.set('q', localSearch);
      else params.delete('q');
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, router, pathname, searchParams]);

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['admin-courses-summary'],
    queryFn: async () => {
      const res = await fetch('/api/admin/courses/summary');
      if (!res.ok) throw new Error('Summary failed');
      const json = await res.json();
      return json.data || {};
    }
  });

  const { data: coursesData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-courses', currentTab, searchQuery],
    queryFn: async () => {
      const statusParam = currentTab.toUpperCase();
      const res = await fetch(`/api/admin/courses?status=${statusParam}&q=${searchQuery}&limit=100`);
      if (!res.ok) throw new Error('Failed to fetch courses');
      const json = await res.json();
      return json.data || [];
    },
    staleTime: 5000
  });

  const courses: Course[] = coursesData || [];

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const tabs = ['All', 'Published', 'Draft', 'Archived'];

  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Total Courses', value: summary.total, icon: BookOpen, color: 'text-brand-dark', bg: 'bg-brand-dark/5' },
      { label: 'Published', value: summary.published, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Draft', value: summary.draft, icon: Edit, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
      {
        label: 'Avg Completion',
        value: summary.avgCompletion ? `${summary.avgCompletion}%` : '—',
        icon: BarChart3,
        color: 'text-brand-dark',
        bg: 'bg-brand-dark/5',
        tooltip: !summary.hasEnrollments ? "No enrollments yet" : undefined
      },
    ];
  }, [summary]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-premium-border/40 shadow-sm font-nunito">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
           <AlertCircle className="w-10 h-10 stroke-[2]" />
        </div>
        <h3 className="text-[28px] font-black text-brand-dark uppercase tracking-tight font-outfit mb-3">Sync Interrupted</h3>
        <p className="text-[15px] text-premium-muted font-medium mb-10 max-w-sm text-center leading-relaxed">We found a slight disconnect in the course data flow.</p>
        <button onClick={() => refetch()} className="px-10 py-4 bg-brand-dark text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] hover:bg-brand-orange transition-all">Reconnect System</button>
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full animate-fade-in overflow-hidden font-nunito bg-[#FCFCFA] px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[80px] animate-pulse" />
        <div className="absolute top-[20%] -right-10 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[60px]" />
        <div className="absolute bottom-[10%] -left-20 w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[70px]" />
      </div>

      <div className="space-y-6 sm:space-y-10 pb-20 pt-2">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 lg:gap-8 border-b border-slate-100 pb-6 sm:pb-8 mb-6 sm:mb-8">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">COURSE CATALOG</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              COURSES <span className="text-[#F97316]">INVENTORY</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1 sm:mt-1.5">
              Manage publishing, pricing, instructors, and learner access.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F172A] text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#F97316] transition-all shadow-md active:scale-95 flex-shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Create Course
          </button>
        </header>

        {/* KPI Section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {isSummaryLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[120px] sm:h-[140px] bg-white rounded-[20px] sm:rounded-[2rem] border border-slate-100 animate-pulse shadow-sm" />
            ))
          ) : (
            stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "bg-white rounded-[20px] sm:rounded-[2rem] border border-slate-100 p-4 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative group",
                  i === 0 && "bg-blue-50/40",
                  i === 1 && "bg-emerald-50/40",
                  i === 2 && "bg-amber-50/40",
                  i === 3 && "bg-blue-50/40"
                )}
                title={stat.tooltip}
              >
                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                  <div className={cn("p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-500", stat.bg, stat.color)}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                    {stat.label}
                  </div>
                </div>
                
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tighter font-outfit">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 flex items-center gap-1.5 truncate">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", stat.color.replace('text', 'bg'))} />
                    {stat.label === 'Total Courses' ? 'Curriculum Assets' : stat.label === 'Published' ? 'Live Content' : 'System Optimized'}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Unified Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch justify-between relative z-10">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 sm:left-6 flex items-center pointer-events-none">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search courses, instructors, or categories..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl sm:rounded-3xl pl-11 sm:pl-16 pr-4 py-3.5 sm:py-5 text-xs sm:text-[15px] font-medium text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 focus:outline-none transition-all shadow-sm min-h-[44px]"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* Tabs Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-50/50 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    "flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-h-[38px]",
                    currentTab === tab
                      ? "bg-[#0F172A] text-white shadow-lg"
                      : "text-slate-400 hover:text-[#0F172A] hover:bg-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button 
              onClick={handleExport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0F172A] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-amber-500 transition-all shadow-md group min-h-[44px]"
            >
              <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" /> Export
            </button>
          </div>
        </div>

        {/* Modernized Courses List */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-slate-100/80 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Asset Details</th>
                  <th className="px-6 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Instructor</th>
                  <th className="px-6 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Analytics</th>
                  <th className="px-6 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Commercials</th>
                  <th className="px-6 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-center">Status</th>
                  <th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-10 py-8"><div className="w-64 h-14 bg-slate-100 rounded-2xl" /></td>
                      <td className="px-6 py-8"><div className="w-12 h-12 bg-slate-100 rounded-full mx-auto" /></td>
                      <td className="px-6 py-8"><div className="w-20 h-8 bg-slate-100 rounded-xl mx-auto" /></td>
                      <td className="px-6 py-8"><div className="w-24 h-10 bg-slate-100 rounded-xl mx-auto" /></td>
                      <td className="px-6 py-8"><div className="w-24 h-8 bg-slate-100 rounded-xl mx-auto" /></td>
                      <td className="px-10 py-8"><div className="w-12 h-12 bg-slate-100 rounded-full ml-auto" /></td>
                    </tr>
                  ))
                ) : courses.length > 0 ? (
                  courses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-amber-500/[0.02] transition-all duration-500 group cursor-default"
                    >
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-6">
                          <div className="relative w-28 h-[4.8rem] rounded-[1.5rem] overflow-hidden border-2 border-slate-100 group-hover:border-amber-500/30 transition-all bg-slate-50 flex-shrink-0 shadow-sm">
                            {course.thumbnail ? (
                              <Image
                                src={course.thumbnail}
                                alt={course.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Layout className="w-7 h-7 opacity-20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>
                          <div className="space-y-1.5">
                            <p 
                              onClick={() => router.push(`/admin/courses/${course.id}/manage`)} 
                              className="text-[17px] font-black text-[#0F172A] hover:text-amber-500 transition-colors cursor-pointer tracking-tight leading-tight"
                            >
                              {course?.title}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-black text-amber-600 bg-amber-500/5 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-amber-500/10">
                                {course.category || 'General'}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold tracking-tight uppercase">
                                <Clock size={12} className="text-slate-300" />
                                <SafeDate date={course.createdAt} options={{ month: 'short', year: 'numeric' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-7">
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-[14px] uppercase overflow-hidden border-4 border-white shadow-lg group-hover:border-amber-500/20 transition-colors">
                            {course?.instructor?.image ? (
                              <Image src={course.instructor.image} alt={course.instructor.name || 'Instructor'} fill className="object-cover" />
                            ) : (course?.instructor?.name || 'I').split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-[12px] font-black text-[#0F172A] tracking-tight">{course?.instructor?.name || 'Lead Instructor'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-7">
                        <button
                          onClick={() => router.push(`/admin/courses/${course.id}/manage?tab=students`)}
                          className="flex flex-col items-center gap-1 mx-auto group/stats p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                        >
                          <span className="text-[22px] font-black text-[#0F172A] group-hover/stats:text-amber-500 transition-colors font-outfit leading-none tracking-tighter">
                            {course._count.enrollments}
                          </span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrolled</span>
                        </button>
                      </td>
                      <td className="px-6 py-7 text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                          {course.price === 0 ? (
                            <span className="text-[12px] font-black uppercase tracking-widest group-hover:text-white text-emerald-600">Free</span>
                          ) : (
                            <>
                              <IndianRupee className="w-3.5 h-3.5 group-hover:text-white text-emerald-600" />
                              <span className="text-[18px] font-black font-outfit group-hover:text-white text-emerald-700">{course.price.toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-7 text-center">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
                          course.isActive
                            ? (course.isPublished 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100/50 group-hover:bg-emerald-600 group-hover:text-white" 
                                : "bg-amber-50 text-amber-600 border-amber-100/20 group-hover:bg-amber-500 group-hover:text-white")
                            : "bg-red-50 text-red-600 border-red-100/50 group-hover:bg-red-600 group-hover:text-white"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse group-hover:hidden", 
                            course.isActive ? (course.isPublished ? "bg-emerald-500" : "bg-amber-500") : "bg-red-500"
                          )} />
                          {course.isActive ? (course.isPublished ? 'Live' : 'Draft') : 'Archived'}
                        </div>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => router.push(`/admin/courses/${course.id}/manage`)}
                            className="p-3.5 text-slate-400 hover:text-[#0F172A] hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/courses/${course.id}/manage?tab=edit`)}
                            className="p-3.5 text-slate-400 hover:text-amber-500 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <div className="bg-slate-100/50 p-1 rounded-xl">
                            <CourseActionsMenu course={course} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-10 py-32 text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 border border-slate-100 shadow-inner">
                        <BookOpen className="w-10 h-10" />
                      </div>
                      <h3 className="text-[32px] font-black text-[#0F172A] tracking-tighter uppercase font-outfit mb-2 leading-none">Inventory Empty</h3>
                      <p className="text-[16px] text-slate-400 mb-10 max-w-sm mx-auto font-medium leading-relaxed italic">No curriculum assets found matching your system filters.</p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-10 py-5 bg-[#0F172A] text-white rounded-[2rem] text-[13px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-[#0F172A]/10 active:scale-95"
                      >
                        Initialize First Module
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="flex items-center justify-center gap-3 text-premium-muted/60 text-[11px] font-black uppercase tracking-[0.2em] pt-8">
          <AlertCircle className="w-4 h-4" />
          All system state transitions are logged for audit compliance.
        </div>
      </div>

      <CourseCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

