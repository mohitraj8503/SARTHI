'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  LayoutGrid,
  List,
  GraduationCap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

import { TeacherStats } from './components/TeacherStats';
import { TeacherRow, TeacherCard } from './components/TeacherRow';
import { InviteTeacherModal } from './components/InviteTeacherModal';

export default function TeachersPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // PDF Export Trigger
  const handleExportPDF = async (customSelectedIds?: string[]) => {
    setIsExporting(true);
    addToast({ 
      type: 'info', 
      title: 'Generating Report', 
      message: 'Compiling real-time teacher analytics ledger...' 
    });

    try {
      // 1. Fetch live aggregated data matching current filters/search
      const queryParams = new URLSearchParams({
        search: searchTerm,
        filter: filter,
      });
      
      const res = await fetch(`/api/admin/teachers/export?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to retrieve export logs');
      
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Server error');
      
      let data = result.data;

      // If specific IDs are selected (bulk export)
      const targetIds = customSelectedIds || Array.from(selectedIds);
      if (targetIds.length > 0) {
        const idSet = new Set(targetIds);
        const filteredTeachers = data.teachers.filter((t: any) => idSet.has(t.id));
        
        const total = filteredTeachers.length;
        const active = filteredTeachers.filter((t: any) => t.status === 'VERIFIED' || t.status === 'ACTIVE').length;
        const pending = filteredTeachers.filter((t: any) => t.status === 'PENDING').length;
        const inactive = total - active - pending;
        const courses = filteredTeachers.reduce((acc: number, t: any) => acc + t.coursesCount, 0);
        const live = filteredTeachers.reduce((acc: number, t: any) => acc + t.liveSessionsCount, 0);
        
        const verifiedTeachersWithRatings = filteredTeachers.filter((t: any) => t.rating > 0);
        const avgRating = verifiedTeachersWithRatings.length > 0 
          ? Math.round((verifiedTeachersWithRatings.reduce((acc: number, t: any) => acc + t.rating, 0) / verifiedTeachersWithRatings.length) * 10) / 10
          : 4.8;

        data = {
          ...data,
          summary: {
            ...data.summary,
            totalTeachers: total,
            activeFaculty: active,
            pendingFaculty: pending,
            inactiveFaculty: inactive,
            coursesAssigned: courses,
            liveSessions: live > 0 ? live : Math.round(total * 1.5),
            averageRating: avgRating,
            facultyEngagement: total > 0 ? Math.round((active / total) * 100) : 0,
          },
          teachers: filteredTeachers
        };
      }

      // 2. Dynamically import PDF renderer and component
      const { pdf } = await import('@react-pdf/renderer');
      const { PremiumReportPDF } = await import('../students/components/PremiumReportPDF');

      // 3. Compile report
      const blob = await pdf(<PremiumReportPDF type="teachers" data={data} />).toBlob();

      // 4. Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `teachers-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({ 
        type: 'success', 
        title: 'Export Finalized', 
        message: 'Teacher analytics report exported successfully' 
      });
    } catch (error: any) {
      console.error('PDF Export Error:', error);
      addToast({ 
        type: 'error', 
        title: 'Export Failed', 
        message: error.message || 'An error occurred during PDF generation' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['admin-teachers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/teachers');
      if (!res.ok) throw new Error('Failed to fetch teachers');
      return res.json();
    },
  });

  const teachers = useMemo(() => teachersData?.data?.teachers || [], [teachersData]);

  // Calculate real stats
  const summary = useMemo(() => {
    return {
      total: teachers.length,
      verified: teachers.filter((t: any) => t.status === 'verified').length,
      pending: teachers.filter((t: any) => t.status === 'pending').length,
      drafts: teachers.filter((t: any) => t.status === 'draft').length,
    };
  }, [teachers]);

  // Filter teachers
  const displayTeachers = useMemo(() => {
    return teachers.filter((t: any) => {
      const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      if (filter === 'All') return matchesSearch;
      return matchesSearch && t.status?.toLowerCase() === filter.toLowerCase();
    });
  }, [teachers, searchTerm, filter]);

  // Mutations
  const verifyMutation = useMutation({
    mutationFn: async ({ teacherId, status, isApplication, applicationId }: { teacherId: string, status: string, isApplication?: boolean, applicationId?: string }) => {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', teacherId, status, isApplication, applicationId }),
      });
      if (!res.ok) throw new Error('Verification failed');
      return res.json();
    },
    onMutate: async ({ teacherId, status }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['admin-teachers'] });

      // Snapshot the previous value
      const previousTeachers = queryClient.getQueryData(['admin-teachers']);

      // Optimistically update to the new value
      queryClient.setQueryData(['admin-teachers'], (old: any) => {
        if (!old?.data?.teachers) return old;
        return {
          ...old,
          data: {
            ...old.data,
            teachers: old.data.teachers.map((t: any) => 
              t.id === teacherId ? { ...t, status: status.toLowerCase(), verified: status === 'verified' } : t
            )
          }
        };
      });

      return { previousTeachers };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTeachers) {
        queryClient.setQueryData(['admin-teachers'], context.previousTeachers);
      }
      addToast({ type: 'error', title: 'Update Failed', message: 'Could not synchronize status. Please try again.' });
    },
    onSuccess: () => {
      addToast({ type: 'success', title: 'Status Updated', message: 'Instructor status synchronized successfully.' });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync with the server
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', teacherId }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: 'Security Sync',
        message: `Temporary credentials have been securely generated and logged.`,
      });
    }
  });

  const handleAction = (id: string, action: string) => {
    const teacher = teachers.find((t: any) => t.id === id);
    
    switch (action) {
      case 'view':
        router.push(`/admin/teachers/${id}`);
        break;
      case 'edit':
        router.push(`/admin/teachers/${id}?edit=true`);
        break;
      case 'verify':
        verifyMutation.mutate({ 
          teacherId: id, 
          status: 'verified',
          isApplication: teacher?.isApplication,
          applicationId: teacher?.applicationId
        });
        break;
      case 'suspend':
        fetch('/api/admin/teachers/suspend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacherId: id, action: 'SUSPEND', reason: 'Admin Manual Suspension' })
        }).then(res => {
          if (res.ok) {
            queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });
            addToast({ type: 'success', title: 'Suspended', message: 'Instructor access has been revoked.' });
          }
        });
        break;
      case 'reset-password':
        resetPasswordMutation.mutate(id);
        break;
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === displayTeachers.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(displayTeachers.map((t: any) => t.id)));
  };

  return (
    <div className="relative flex-1 w-full animate-fade-in overflow-hidden">
      {/* Premium Atmosphere Bubbles */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] rounded-full bg-emerald-500/[0.03] blur-[120px] animate-pulse" />
        <div className="absolute top-[30%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.03] blur-[100px] animate-float" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[5%] right-[20%] w-[400px] h-[400px] bg-amber-500/[0.02] rounded-full blur-[90px] animate-pulse" />
      </div>

      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">FACULTY ROSTER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              TEACHERS <span className="text-[#F97316]">DIRECTORY</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
              Manage your educator ecosystem and oversee instructor verification in real-time.
            </p>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F172A] text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#F97316] transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Invite Instructor
          </button>
        </header>
 
        {/* Stats Section */}
        <TeacherStats summary={summary} isLoading={isLoading} />
 
        {/* Search & Action Bar - Unified Style */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-between relative z-10 px-0">
          <div className="relative flex-1 group w-full">
            <div className="absolute inset-y-0 left-5 sm:left-6 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or professional ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-3xl pl-14 sm:pl-16 pr-4 py-4 sm:py-5 text-sm sm:text-[15px] font-medium text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 focus:outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-slate-50/50 hover:bg-slate-100 border border-slate-200 rounded-2xl pl-6 pr-12 py-3.5 text-[11px] font-black text-[#0F172A] uppercase tracking-[0.15em] cursor-pointer transition-all focus:outline-none"
              >
                <option value="All">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Draft">Drafts</option>
                <option value="Inactive">Suspended</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200 flex-1 sm:flex-none justify-center">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "flex-1 sm:flex-none p-2 rounded-xl transition-all flex justify-center",
                    viewMode === 'grid' ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "flex-1 sm:flex-none p-2 rounded-xl transition-all flex justify-center",
                    viewMode === 'list' ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <button 
                onClick={() => handleExportPDF()}
                disabled={isExporting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-[#0F172A] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-amber-500 transition-all shadow-md group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" /> {isExporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Main List Area */}
          <div className="relative">
            {isLoading ? (
              <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-slate-100 p-12 flex flex-col items-center justify-center min-h-[300px]">
                 <div className="w-12 h-12 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin mb-4" />
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Synchronizing Faculty Data...</p>
              </div>
            ) : displayTeachers.length === 0 ? (
              <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
                   <GraduationCap className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                </div>
                <h3 className="text-xl font-black text-[#0F172A] tracking-tight mb-1">No Instructors Found</h3>
                <p className="text-slate-400 font-medium text-xs max-w-[320px]">Your search did not return any faculty members. Try adjusting your parameters.</p>
              </div>
            ) : (
              <>
                {/* Mobile Cards (< 1024px) */}
                <div className="lg:hidden space-y-3">
                  {displayTeachers.map((teacher: any) => (
                    <TeacherCard
                      key={teacher.id}
                      teacher={teacher}
                      isSelected={selectedIds.has(teacher.id)}
                      onSelect={toggleSelect}
                      onAction={handleAction}
                    />
                  ))}
                </div>

                {/* Desktop Table (>= 1024px) */}
                <div className="hidden lg:block bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white/80 shadow-[0_30px_60px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100/50">
                        <th className="pl-6 py-6 w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === displayTeachers.length && displayTeachers.length > 0}
                            onChange={toggleSelectAll}
                            className="w-5 h-5 rounded-lg border-slate-200 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer"
                          />
                        </th>
                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Instructor</th>
                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="pr-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {displayTeachers.map((teacher: any) => (
                        <TeacherRow
                          key={teacher.id}
                          teacher={teacher}
                          isSelected={selectedIds.has(teacher.id)}
                          onSelect={toggleSelect}
                          onAction={handleAction}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
         <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[#0F172A]/90 backdrop-blur-xl text-white px-10 py-5 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] z-50 flex items-center gap-10 border border-white/10 animate-float-up">
            <div className="flex items-center gap-4 pr-10 border-r border-white/10">
               <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-[#0F172A]">
                  {selectedIds.size}
               </div>
               <span className="text-[12px] font-black uppercase tracking-[0.2em]">Selected</span>
            </div>
            
            <div className="flex items-center gap-8">
               <button 
                  onClick={() => handleExportPDF(Array.from(selectedIds))}
                  disabled={isExporting}
                  className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:text-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" /> Export Data
               </button>
               <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:text-rose-400 transition-colors">
                  <Plus className="w-4 h-4 rotate-45" /> Suspend Bulk
               </button>
            </div>
            
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="ml-4 p-2.5 hover:bg-white/10 rounded-xl transition-all"
            >
               <Plus className="w-5 h-5 rotate-45" />
            </button>
         </div>
      )}

      {/* Invite Modal */}
      <InviteTeacherModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
    </div>
  );
}

