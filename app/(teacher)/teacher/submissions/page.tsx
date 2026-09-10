'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, CheckCircle2, Clock, Filter, Download,
  MoreHorizontal, ChevronRight, User, Book, ClipboardCheck,
  LayoutGrid, List, AlertCircle, Loader2, Send, X, Star
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Submission {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  assignment: {
    id: string;
    title: string;
    maxScore: number;
    courseTitle: string;
  };
  status: 'pending' | 'graded';
  score: number | null;
  feedback: string | null;
  submittedAt: string;
  content: string;
}

export default function SubmissionsPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('pending');
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [isBulkGradeModalOpen, setIsBulkGradeModalOpen] = useState(false);

  // 1. Fetch Submissions
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-submissions', filterStatus],
    queryFn: async () => {
      const res = await fetch(`/api/teacher/submissions?status=${filterStatus}`);
      if (!res.ok) throw new Error('Failed to fetch submissions');
      return res.json();
    }
  });

  const submissions: Submission[] = useMemo(() => data?.submissions || [], [data?.submissions]);

  // 2. Filter Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => 
      sub.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.assignment.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [submissions, searchQuery]);

  // 3. Selection Handlers
  const toggleSelectAll = () => {
    if (selectedSubmissions.size === filteredSubmissions.length) {
      setSelectedSubmissions(new Set());
    } else {
      setSelectedSubmissions(new Set(filteredSubmissions.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedSubmissions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSubmissions(next);
  };

  // 4. Bulk Grading Mutation
  const bulkGradeMutation = useMutation({
    mutationFn: async (grades: any[]) => {
      const res = await fetch('/api/teacher/submissions/bulk-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades })
      });
      if (!res.ok) throw new Error('Bulk grading failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-submissions'] });
      addToast('Bulk Objectives Secured!', 'success');
      setSelectedSubmissions(new Set());
      setIsBulkGradeModalOpen(false);
    },
    onError: (err: any) => {
      addToast(err.message, 'error');
    }
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 md:px-10 py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-4 bg-orange-500 rounded-full" />
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Evaluation Engine</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                Submissions <span className="text-orange-500">Center</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-3 italic">Review, grade, and provide high-fidelity feedback to your cohorts.</p>
            </div>

            {selectedSubmissions.size > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 bg-orange-50 px-6 py-4 rounded-[2rem] border border-orange-100 shadow-xl shadow-orange-500/5"
              >
                <p className="text-[11px] font-black text-orange-700 uppercase tracking-widest">
                  {selectedSubmissions.size} Selected
                </p>
                <button 
                  onClick={() => setIsBulkGradeModalOpen(true)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Bulk Grade
                </button>
                <button onClick={() => setSelectedSubmissions(new Set())} className="p-2 text-orange-400 hover:text-orange-600">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-10 mt-10">
        {/* Filters */}
        <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex-1 flex items-center gap-4 px-4 w-full">
            <Search className="w-5 h-5 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by student, assignment, or course..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400 w-full"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 flex-1 lg:flex-none">
              {['all', 'pending', 'graded'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={cn(
                    "flex-1 lg:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    filterStatus === status 
                      ? "bg-white text-slate-900 shadow-sm border border-slate-100" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 w-16 text-center">
                    <button 
                      onClick={toggleSelectAll}
                      className={cn(
                        "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                        selectedSubmissions.size === filteredSubmissions.length && filteredSubmissions.length > 0
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "border-slate-300 bg-white"
                      )}
                    >
                      {selectedSubmissions.size === filteredSubmissions.length && filteredSubmissions.length > 0 && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  </th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Learner</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment Node</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Submitted At</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Evaluation</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className={cn("group transition-colors", selectedSubmissions.has(sub.id) ? "bg-orange-50/30" : "hover:bg-slate-50/50")}>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => toggleSelect(sub.id)}
                        className={cn(
                          "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                          selectedSubmissions.has(sub.id)
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "border-slate-300 bg-white group-hover:border-orange-400"
                        )}
                      >
                        {selectedSubmissions.has(sub.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight leading-tight">{sub.student.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub.student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div>
                        <p className="text-sm font-black text-slate-800 tracking-tight leading-tight uppercase italic">{sub.assignment.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Book className="w-3 h-3 text-orange-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.assignment.courseTitle}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      {sub.status === 'graded' ? (
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black border border-orange-100">
                            {sub.score}/100
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic truncate max-w-[150px]">
                            {sub.feedback || 'No feedback provided'}
                          </span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100 uppercase tracking-widest">
                          PENDING REVIEW
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                <ClipboardCheck className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Terminal Quiet</h3>
              <p className="text-sm text-slate-500 font-medium mt-3 italic">No submissions matching your current filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Bulk Grade Modal */}
      <AnimatePresence>
        {isBulkGradeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkGradeModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-white/20"
            >
              <div className="p-10 border-b border-slate-100 bg-[#F8FAFC]">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Bulk <span className="text-orange-500">Evaluation</span></h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">SECURE OBJECTIVES FOR {selectedSubmissions.size} NODES</p>
                  </div>
                  <button onClick={() => setIsBulkGradeModalOpen(false)} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Universal Score (0-100)</label>
                    <div className="relative">
                      <Star className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-orange-500" />
                      <input 
                        type="number" 
                        id="bulk-score"
                        placeholder="e.g. 85" 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Synthesized Feedback</label>
                    <textarea 
                      id="bulk-feedback"
                      placeholder="Great implementation of the core concepts. Ensure you handle the edge cases discussed in session..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-6 py-6 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-orange-500/10 transition-all min-h-[160px] resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <button 
                    onClick={() => {
                      const score = parseInt((document.getElementById('bulk-score') as HTMLInputElement).value);
                      const feedback = (document.getElementById('bulk-feedback') as HTMLTextAreaElement).value;
                      
                      if (isNaN(score)) {
                        addToast('Please enter a valid score', 'error');
                        return;
                      }

                      const grades = Array.from(selectedSubmissions).map(id => ({
                        submissionId: id,
                        score,
                        feedback
                      }));

                      bulkGradeMutation.mutate(grades);
                    }}
                    disabled={bulkGradeMutation.isPending}
                    className="w-full bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {bulkGradeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Broadcast Evaluations
                  </button>
                  <button 
                    onClick={() => setIsBulkGradeModalOpen(false)}
                    className="w-full sm:w-auto px-10 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Abort
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="h-2 w-full bg-slate-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(selectedSubmissions.size / submissions.length) * 100}%` }}
                  className="h-full bg-orange-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 animate-pulse">
      <div className="max-w-[1600px] mx-auto space-y-10">
        <div className="h-40 bg-white rounded-[32px]" />
        <div className="h-20 bg-white rounded-2xl" />
        <div className="h-96 bg-white rounded-[32px]" />
      </div>
    </div>
  );
}
