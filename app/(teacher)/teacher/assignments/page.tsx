'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Users, 
  DollarSign, 
  BookOpen,
  PlayCircle, 
  CheckCircle2, 
  Video, 
  Calendar, 
  Upload,
  Archive, 
  MoreVertical, 
  LayoutGrid, 
  List, 
  ClipboardCheck, 
  Clock, 
  Star,
  Loader2, 
  X,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import StatCard from '@/components/teacher/dashboard/StatCard';
import CreateAssignmentModal from '@/components/teacher/dashboard/CreateAssignmentModal';

interface Assignment {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  submissionsCount: number;
  avgScore: number;
  status: 'active' | 'pending' | 'expired';
}

export default function TeacherAssignmentsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['teacher-assignments', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/teacher/assignments');
      if (!res.ok) return { assignments: [], stats: { totalAssignments: 0, pendingReview: 0, avgScore: 0 } };
      return res.json();
    }
  });

  const assignments: Assignment[] = assignmentsData?.assignments || [];
  const statsData = assignmentsData?.stats || { totalAssignments: 0, pendingReview: 0, avgScore: 0 };

  const tabs = ['All', 'Active', 'Pending', 'Expired'];

  const filteredAssignments = useMemo(() => {
    const assignments: Assignment[] = assignmentsData?.assignments || [];
    return assignments.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.courseName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All' || a.status.toLowerCase() === activeTab.toLowerCase();
      return matchesSearch && matchesTab;
    });
  }, [assignmentsData?.assignments, searchQuery, activeTab]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) return <AssignmentsSkeleton />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Directory Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 md:px-10 py-6 md:py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-4 bg-orange-500 rounded-full" />
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">LEARNER ASSESSMENTS</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                ASSESSMENTS <span className="text-orange-500">DIRECTORY</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-3">Monitor and evaluate student progress through structured assessments. Track submission velocity and cohort performance.</p>
            </div>

            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <Plus className="w-4.5 h-4.5" />
              Create Assignment
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
              title="Total Assignments"
              value={statsData.totalAssignments}
              change={2}
              icon={ClipboardCheck}
              color="blue"
            />
            <StatCard 
              title="Pending Review"
              value={statsData.pendingReview}
              change={10}
              icon={Clock}
              color="amber"
            />
            <StatCard 
              title="Avg Score"
              value={`${statsData.avgScore}%`}
              change={4}
              icon={Star}
              color="emerald"
            />
            <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center text-center border-dashed border-2">
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Audit Active</span>
               </div>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Evaluations Synced</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-10 mt-8 md:mt-10">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          <div className="flex-1 flex items-center gap-4 px-4 py-2 lg:py-0 border-b lg:border-b-0 border-slate-50">
            <Search className="w-5 h-5 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by title, course, or student ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400 w-full"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    activeTab === tab 
                      ? "bg-white text-slate-900 shadow-sm border border-slate-100" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Link href="/teacher/submissions" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 active:scale-95">
              <ClipboardCheck className="w-4 h-4" />
              View Submissions
            </Link>

            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-[32px] border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 w-12 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                </th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Course</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Submissions</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssignments.map((a) => (
                <tr key={a.id} className="group hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-8 py-6 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">{a.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Due {a.dueDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-xs font-bold text-slate-500 tracking-tight">{a.courseName}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-6">
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-black text-slate-900 tracking-tighter">{a.submissionsCount}</span>
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Submitted</p>
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-sm font-black text-slate-900 tracking-tighter">{a.avgScore}%</span>
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Avg Score</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                      a.status === 'active' ? "bg-emerald-50 text-emerald-600" : 
                      a.status === 'pending' ? "bg-amber-50 text-amber-600" : 
                      "bg-slate-100 text-slate-500"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        a.status === 'active' ? "bg-emerald-500" : 
                        a.status === 'pending' ? "bg-amber-500" : 
                        "bg-slate-400"
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{a.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                         <Eye className="w-4.5 h-4.5" />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                         <MoreHorizontal className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAssignments.length === 0 && (
            <div className="py-20 text-center">
              <ClipboardCheck className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-xl font-black text-slate-900 tracking-tight">No assignments yet</h3>
              <p className="text-sm text-slate-500 font-medium mt-2">Create your first evaluation to start tracking progress.</p>
            </div>
          )}
        </div>
      </main>

      <CreateAssignmentModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

function AssignmentsSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 animate-pulse">
      <div className="max-w-[1600px] mx-auto space-y-10">
        <div className="h-40 bg-white rounded-[32px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-[32px]" />)}
        </div>
        <div className="h-20 bg-white rounded-[24px]" />
        <div className="h-96 bg-white rounded-[32px]" />
      </div>
    </div>
  );
}

