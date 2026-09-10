'use client';

import { FileText, Upload, CheckCircle2, Loader2, Calendar, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import { AssignmentDetail } from '@/types/dashboard';
import { cn } from '@/lib/utils';

export default function TabAssignments({ data: propData }: { data?: any }) {
  const [filter, setFilter] = useState('All');
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentDetail | null>(null);

  const { data: fetchedData, isLoading, refetch } = useQuery<{ assignments: AssignmentDetail[] }>({
    queryKey: ['assignments_data'],
    queryFn: async () => {
      const res = await fetch('/api/student/dashboard?tab=assignments');
      if (!res.ok) throw new Error('Failed to fetch assignments');
      return res.json();
    },
    enabled: !propData // Only fetch if not provided via props
  });

  const assignments: AssignmentDetail[] = propData?.assignments || fetchedData?.assignments || [];
  const filteredAssignments = assignments.filter((a) => 
    filter === 'All' || a.status.toLowerCase() === filter.toLowerCase()
  );

  const getStatusColor = (status: string) => {
      const s = status.toLowerCase();
      switch(s) {
          case 'pending': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20';
          case 'submitted': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
          case 'graded': return 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20';
          default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700';
      }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-bold">Retrieving your deadlines...</p>
        </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 bg-[#F8FAFC] min-h-screen pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-6 bg-emerald-500 rounded-full" />
                <span className="text-xs sm:text-sm font-black text-emerald-600 uppercase tracking-[0.3em]">WORKFLOW ENGINE</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[0.95]">
                LEARNING <span className="text-emerald-500">MISSIONS</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2">Complete your assigned tasks to unlock new skill levels</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 shadow-sm">
            {['All', 'Pending', 'Submitted', 'Graded'].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        filter === status ? 'bg-[#1B4332] text-white shadow-md shadow-emerald-900/10' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    )}
                >
                    {status}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white border border-[#EAF0F7] rounded-[32px] overflow-hidden shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
         <AnimatePresence mode="popLayout">
          {filteredAssignments.length > 0 ? (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                className="divide-y divide-slate-100"
              >
                  {filteredAssignments.map((assignment) => (
                        <motion.div 
                            key={assignment.id} 
                            variants={{
                              hidden: { opacity: 0, x: -20 },
                              visible: { opacity: 1, x: 0 }
                            }}
                            className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-50/50 transition-all group border-b border-slate-100 last:border-0"
                        >
                            {/* Icon */}
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all shadow-sm",
                                assignment.status.toLowerCase() === 'pending' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                            )}>
                                <FileText className="w-6 h-6" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 w-full text-center md:text-left space-y-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1">
                                    <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{assignment.title}</h3>
                                    <span className={cn(
                                        "inline-flex px-3 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-widest w-fit mx-auto md:mx-0",
                                        getStatusColor(assignment.status)
                                    )}>
                                        {assignment.status}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-center md:justify-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {assignment.course}
                                </p>
                                
                                <div className="flex items-center justify-center md:justify-start gap-6">
                                    {assignment.dueDate && (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                           <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Due {new Date(assignment.dueDate).toLocaleDateString()}
                                        </p>
                                    )}
                                    {assignment.status.toLowerCase() === 'graded' && assignment.score !== undefined && (
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                                           <CheckCircle2 className="w-3.5 h-3.5" /> Performance: {assignment.score}/100
                                        </p>
                                    )}
                                </div>
                            </div>

                        <div className="w-full md:w-auto flex justify-center">
                            {assignment.status.toLowerCase() === 'pending' ? (
                                <Link 
                                  href={`/dashboard?tab=assignments&assignment=${assignment.id}`}
                                  className="h-12 px-8 rounded-xl bg-[#1B4332] text-white text-xs font-black uppercase tracking-[0.15em] hover:bg-[#2D6A4F] active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-emerald-900/10"
                                >
                                    <Upload className="w-4 h-4" /> START MISSION
                                </Link>
                            ) : (
                                <Link 
                                  href={`/dashboard?tab=assignments&id=${assignment.id}`}
                                  className="h-12 px-8 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center gap-2"
                                >
                                    <ArrowRight className="w-4 h-4" /> VIEW SUBMISSION
                                </Link>
                            )}
                        </div>
                    </motion.div>
                 ))}
              </motion.div>
          ) : (
            <div className="py-20 text-center space-y-4 max-w-4xl mx-auto w-full">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mission Accomplished</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 px-6 max-w-md mx-auto leading-relaxed">You have cleared all your current deadlines. Take a moment to analyze your performance.</p>
                </div>
                <Link 
                  href="/dashboard/courses"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1B4332] text-white rounded-xl font-black text-xs uppercase tracking-[0.15em] hover:bg-[#2D6A4F] transition-all shadow-xl shadow-emerald-900/10"
                >
                    RETURN TO LEARNING <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
          )}
         </AnimatePresence>
      </div>
    </div>
  );
}

