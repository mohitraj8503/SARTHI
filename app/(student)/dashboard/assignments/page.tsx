'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssignments, AssignmentListItem as Assignment } from '@/app/actions/assignments';
import { Sparkles, Calendar, BookOpen, Clock, AlertCircle, CheckCircle, Trophy, ChevronRight, FileText, Activity, Fingerprint, Database, Cpu, Terminal, Shield, Zap, Radio, Filter, LayoutGrid, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

export default function AssignmentsPage() {
   const [assignments, setAssignments] = useState<Assignment[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchAssignments = async () => {
         try {
            const data = await getAssignments('all');
            setAssignments(data || []);
         } catch (error) {
            console.error('Failed to fetch assignments:', error);
         } finally {
            setLoading(false);
         }
      };
      fetchAssignments();
   }, []);

   if (loading) {
      return (
         <div className="min-h-screen dashboard-container-glass flex items-center justify-center">
            <div className="text-center space-y-4">
               <div className="w-16 h-16 border-4 border-[#174F3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
               <p className="text-[#174F3A] font-black uppercase tracking-widest text-xs">Syncing Tasks...</p>
            </div>
         </div>
      );
   }

  return (
    <div className="w-full bg-transparent p-3 sm:p-4 lg:p-10 pb-24 lg:pb-20 space-y-8 sm:space-y-12 min-h-screen">
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 max-w-[1600px] mx-auto">
        
        <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">WORKFLOW ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              LEARNING <span className="text-emerald-500">MISSIONS</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
              Complete your assigned tasks to unlock new skill levels.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Find task..." 
                    className="w-64 pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-4 focus:ring-[#174F3A]/5 outline-none transition-all text-sm font-medium"
                />
             </div>
          </div>
        </header>

        {/* Minimal Stats Card Hub */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
           <MinimalStatsCard title="TOTAL MISSIONS" value={assignments.length} icon={FileText} color="#174F3A" />
           <MinimalStatsCard title="PENDING" value={assignments.filter(a => a.status === 'pending').length} icon={Clock} color="#F59E0B" />
           <MinimalStatsCard title="COMPLETED" value={assignments.filter(a => a.status === 'graded').length} icon={Trophy} color="#22C55E" />
           <MinimalStatsCard title="OVERDUE" value={assignments.filter(a => a.status === 'overdue').length} icon={AlertCircle} color="#EF4444" />
        </div>

        {/* Filter Hub */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 border-b border-slate-200/80 pb-6 sm:pb-8">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-[2rem] border border-slate-200 overflow-x-auto no-scrollbar max-w-full shadow-sm">
                {['All Tasks', 'Active', 'Completed'].map((tab) => (
                    <button
                        key={tab}
                        className={cn(
                            "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            tab === 'All Tasks' 
                                ? "bg-[#174F3A] text-white" 
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-3">
                <button className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-[#174F3A] transition-all">
                    <LayoutGrid size={20} />
                </button>
                <button className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-[#174F3A] transition-all">
                    <Filter size={20} />
                </button>
            </div>
        </div>

        {/* Task Grid */}
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
             {assignments.length > 0 ? (
                assignments.map((assignment: Assignment, idx: number) => (
                   <MinimalTaskCard key={assignment.id} assignment={assignment} index={idx} />
                ))
             ) : (
                <div className="col-span-full py-32 text-center space-y-6">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Fingerprint className="w-10 h-10 text-gray-200" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase font-outfit">Workload Cleared</h3>
                      <p className="text-gray-400 max-w-sm mx-auto font-bold text-xs uppercase tracking-widest leading-relaxed">No active missions assigned to this sector.</p>
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalStatsCard({ title, value, icon: Icon, color }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200/80 rounded-[2rem] p-5 sm:p-8 relative overflow-hidden group hover:-translate-y-1 transition-all shadow-sm"
            style={{ borderTop: `4px solid ${color}` }}
        >
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}10` }}>
                    <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-900 leading-none">{value}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{title}</p>
                </div>
            </div>
        </motion.div>
    );
}

function MinimalTaskCard({ assignment, index }: { assignment: Assignment, index: number }) {
    const isOverdue = assignment.status === 'overdue';
    const isGraded = assignment.status === 'graded';
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-[2.5rem] border border-slate-200/80 shadow-sm hover:shadow-md overflow-hidden transition-all duration-500 flex flex-col"
        >
            <div className="p-5 sm:p-8 pb-0 flex items-start justify-between">
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-none",
                    isGraded ? "bg-emerald-50 text-emerald-600" : 
                    isOverdue ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400"
                )}>
                    <BookOpen className="w-7 h-7" />
                </div>
                <div className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black border flex items-center gap-2 uppercase tracking-widest",
                    isGraded ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                    isOverdue ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-slate-50 text-slate-500 border-slate-200"
                )}>
                    {assignment.status}
                </div>
            </div>
 
            <div className="p-5 sm:p-8 flex-1 flex flex-col">
                <div className="space-y-1 mb-6">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{assignment.courseTitle || 'Academy Module'}</span>
                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-[#174F3A] transition-colors uppercase font-outfit">
                        {assignment.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-bold italic mt-2 line-clamp-2 opacity-70 leading-relaxed">{assignment.description || 'Take on this mission and excel in your learning journey.'}</p>
                </div>
 
                <div className="mt-auto space-y-6">
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                <Calendar className="w-3.5 h-3.5" />
                                {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Due Date'}
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                <Trophy className="w-3.5 h-3.5" />
                                {assignment.maxScore} XP
                            </div>
                        </div>
                        <Link
                            href={assignment.isInternship ? `/dashboard/internship/assignments/${assignment.id}` : `/dashboard/assignments/${assignment.id}`}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-[#174F3A] hover:text-white transition-all shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Optimized Student Mission Control

