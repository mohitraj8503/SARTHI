'use client';

import React, { useState } from 'react';
import { Search, Plus, Users, X, Filter as FilterIcon, Download, Zap, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStudents } from './hooks/useStudents';
import { useStudentMutations } from './hooks/useStudentMutations';
import { useStudentStore } from './store/useStudentStore';
import { StudentStats } from './components/StudentStats';
import { StudentRow, StudentCard } from './components/StudentRow';
import { BulkActionsBar } from './components/BulkActionsBar';
import {
  AddStudentModal,
  EditStudentModal,
  DeleteConfirmModal,
  SuspendModal,
  BulkEmailModal,
  BulkSuspendModal,
  ResetPasswordModal
} from './components/StudentModals';
import { CoursesDrawer } from './components/CoursesDrawer';
import { Student, Course } from './types';
import { useToast } from '@/components/ToastProvider';

export default function StudentsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  // Zustand Store
  const { 
    modals, 
    selectedStudent, 
    openModal, 
    closeModals,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    segment,
    setSegment,
    page,
    setPage,
    selection
  } = useStudentStore();

  // Custom Hooks
  const {
    students,
    totalCount,
    showingCount,
    hasMore,
    showMore,
    selectedCount,
    isSelected,
    toggleSelect,
    selectAll,
    clearSelection,
    isStudentsLoading,
    isStudentsFetching,
    isStudentsError,
    studentsError,
    refetchStudents,
    isSummaryLoading,
    summaryData,
    sortBy,
    sortOrder,
    setSort,
    toggleSort
  } = useStudents();

  const {
    addStudentMutation,
    editStudentMutation,
    deleteStudentMutation,
    suspendStudentMutation,
    bulkActionMutation,
    resetPasswordMutation
  } = useStudentMutations();

  // Local UI State for Courses (Keep local as it's specific to the drawer session)
  const [studentCourses, setStudentCourses] = useState<Course[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // PDF Export Trigger
  const handleExportPDF = async (selectedIds?: string[]) => {
    setIsExporting(true);
    addToast({ 
      type: 'info', 
      title: 'Generating Report', 
      message: 'Compiling real-time student ecosystem ledger...' 
    });

    try {
      // 1. Fetch live aggregated data matching current filters/search
      const queryParams = new URLSearchParams({
        search: searchTerm,
        filter: filter,
      });
      
      const res = await fetch(`/api/admin/students/export?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to retrieve export logs');
      
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Server error');
      
      let data = result.data;

      // If specific IDs are selected (bulk export)
      if (selectedIds && selectedIds.length > 0) {
        const idSet = new Set(selectedIds);
        const filteredStudents = data.students.filter((s: any) => idSet.has(s.id));
        
        const total = filteredStudents.length;
        const active = filteredStudents.filter((s: any) => s.status === 'ACTIVE').length;
        const pending = filteredStudents.filter((s: any) => s.status === 'PENDING').length;
        const inactive = total - active - pending;
        
        data = {
          ...data,
          summary: {
            ...data.summary,
            totalStudents: total,
            activeStudents: active,
            pendingStudents: pending,
            inactiveStudents: inactive,
            activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
            pendingPercentage: total > 0 ? Math.round((pending / total) * 100) : 0,
          },
          students: filteredStudents
        };
      }

      // 2. Dynamically import PDF renderer and component
      const { pdf } = await import('@react-pdf/renderer');
      const { PremiumReportPDF } = await import('./components/PremiumReportPDF');

      // 3. Compile report
      const blob = await pdf(<PremiumReportPDF type="students" data={data} />).toBlob();

      // 4. Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `students-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({ 
        type: 'success', 
        title: 'Export Finalized', 
        message: 'Student report exported successfully' 
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

  // Handlers
  const handleCoursesClick = async (student: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    openModal('courses', student);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/courses`);
      const result = await res.json();
      if (res.ok) setStudentCourses(result.data || []);
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to fetch enrolled courses' });
    }
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      addToast({ type: 'success', title: 'Copied', message: 'Email address copied to clipboard' });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to copy email' });
    }
  };

  return (
    <div className="relative flex-1 w-full animate-fade-in overflow-hidden">
      {/* Background Atmosphere - Premium Decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top Right Header Bubble */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[80px] animate-pulse" />
        
        {/* Floating Blob Right */}
        <div className="absolute top-[20%] -right-10 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[60px] animate-float" style={{ animationDuration: '8s' }} />
        
        {/* Bottom Left Bubble */}
        <div className="absolute bottom-[10%] -left-20 w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[70px] animate-float-delayed" style={{ animationDuration: '10s' }} />
      </div>

      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
          <div className="space-y-2 text-left relative">
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <div className="h-2 w-6 bg-[#F97316] rounded-full" />
              <span className="text-xs sm:text-sm font-black text-[#F97316] uppercase tracking-[0.25em]">STUDENT ROSTER</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[0.95]">
              STUDENTS <span className="text-[#F97316]">DIRECTORY</span>
            </h1>
            <p className="text-slate-600 font-bold text-xs sm:text-base lg:text-lg mt-2 font-sans not-italic">
              Manage and monitor your learner ecosystem in real-time.
            </p>
          </div>

          <button
            onClick={() => openModal('add')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#0F172A] text-white px-7 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#F97316] transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[3]" /> Add New Student
          </button>
        </header>
 
        {/* Stats */}
        <StudentStats summary={summaryData || null} isLoading={isSummaryLoading} />
 
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
            {/* Segment Toggle: All | Main | Junior */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
              {[
                { id: 'all', label: 'All' },
                { id: 'main', label: '🎓 Main' },
                { id: 'junior', label: '🎒 Junior' },
                { id: 'pending', label: '⏳ Pending' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSegment(tab.id as any)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                    segment === tab.id
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-slate-50/50 hover:bg-slate-100 border border-slate-200 rounded-2xl pl-6 pr-12 py-3.5 text-[11px] font-black text-[#0F172A] uppercase tracking-[0.15em] cursor-pointer transition-all focus:outline-none"
              >
                <option value="All">All Ecosystem</option>
                <option value="Active">Active Only</option>
                <option value="Pending">Pending Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
              <FilterIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/maintenance/migrate-enrollments', { method: 'POST' });
                    const data = await res.json();
                    if (data.success) {
                      addToast({ type: 'success', title: 'Identity Hardened', message: data.message });
                      window.location.reload();
                    } else {
                      addToast({ type: 'error', title: 'Migration Failed', message: data.error });
                    }
                  } catch (err) {
                    addToast({ type: 'error', title: 'Network Error', message: 'Failed to connect to maintenance server' });
                  }
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm group"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" /> Fix IDs
              </button>
              
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

        {/* Mobile Card List View (< 1024px) */}
        <div className="lg:hidden space-y-3">
          {isStudentsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))
          ) : isStudentsError ? (
            <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3">
              <Users className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Failed to load student roster</h3>
              <p className="text-xs text-slate-500">{(studentsError as any)?.message || 'An error occurred while fetching students.'}</p>
              <button
                onClick={() => refetchStudents()}
                className="px-4 py-2 bg-[#0F172A] text-white rounded-xl text-xs font-bold hover:bg-[#F97316] transition-all"
              >
                Retry
              </button>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-600">No students found</h3>
            </div>
          ) : (
            students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                isSelected={isSelected(student.id)}
                onToggleSelect={() => toggleSelect(student.id)}
                onRowClick={(s) => router.push(`/admin/students/${s.id}`)}
                onCoursesClick={handleCoursesClick}
                onEditClick={(s, e) => { e.stopPropagation(); openModal('edit', s); }}
                onDeleteClick={(s, e) => { e.stopPropagation(); openModal('delete', s); }}
                onSuspendClick={(s, e) => { e.stopPropagation(); openModal('suspend', s); }}
                handleCopyEmail={handleCopyEmail}
                onResetPassword={(s) => openModal('resetPassword', s)}
              />
            ))
          )}
        </div>

        {/* Desktop Main Table (>= 1024px) */}
        <div className="hidden lg:block bg-white rounded-[16px] border border-[#E2E8F4] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8F9FC] border-b border-[#E2E8F4]">
                <tr>
                  <th className="px-6 py-5 w-10">
                    <input
                      type="checkbox"
                      checked={students.length > 0 && selectedCount >= students.length}
                      onChange={selectAll}
                      className="w-4 h-4 rounded border-[#E2E8F4] text-[#1C2B4A] focus:ring-[#1C2B4A] cursor-pointer"
                    />
                  </th>
                  <th 
                    tabIndex={0}
                    role="columnheader"
                    aria-sort={sortBy === 'name' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                    onClick={() => toggleSort('name')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('name'); } }}
                    className={cn(
                      "px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all select-none group focus:outline-none focus:bg-slate-100",
                      sortBy === 'name' ? "text-[#0F172A] bg-slate-100/60" : "text-[#7A8299] hover:bg-slate-100/40 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      Student
                      <span className={cn("text-[10px] transition-colors", sortBy === 'name' ? "text-amber-500 font-bold" : "text-slate-300 group-hover:text-slate-400")}>
                        {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </div>
                  </th>
                  <th 
                    tabIndex={0}
                    role="columnheader"
                    aria-sort={sortBy === 'email' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                    onClick={() => toggleSort('email')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('email'); } }}
                    className={cn(
                      "px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all select-none group focus:outline-none focus:bg-slate-100",
                      sortBy === 'email' ? "text-[#0F172A] bg-slate-100/60" : "text-[#7A8299] hover:bg-slate-100/40 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      Email
                      <span className={cn("text-[10px] transition-colors", sortBy === 'email' ? "text-amber-500 font-bold" : "text-slate-300 group-hover:text-slate-400")}>
                        {sortBy === 'email' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </div>
                  </th>
                  <th 
                    tabIndex={0}
                    role="columnheader"
                    aria-sort={sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                    onClick={() => toggleSort('createdAt')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('createdAt'); } }}
                    className={cn(
                      "px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all select-none group focus:outline-none focus:bg-slate-100",
                      sortBy === 'createdAt' ? "text-[#0F172A] bg-slate-100/60" : "text-[#7A8299] hover:bg-slate-100/40 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      Joined
                      <span className={cn("text-[10px] transition-colors", sortBy === 'createdAt' ? "text-amber-500 font-bold" : "text-slate-300 group-hover:text-slate-400")}>
                        {sortBy === 'createdAt' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </div>
                  </th>
                  <th 
                    tabIndex={0}
                    role="columnheader"
                    aria-sort={sortBy === 'status' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                    onClick={() => toggleSort('status')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort('status'); } }}
                    className={cn(
                      "px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all select-none group focus:outline-none focus:bg-slate-100",
                      sortBy === 'status' ? "text-[#0F172A] bg-slate-100/60" : "text-[#7A8299] hover:bg-slate-100/40 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      Status
                      <span className={cn("text-[10px] transition-colors", sortBy === 'status' ? "text-amber-500 font-bold" : "text-slate-300 group-hover:text-slate-400")}>
                        {sortBy === 'status' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </div>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-bold text-[#7A8299] uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F4]">
                {isStudentsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-6 h-16 bg-white" />
                    </tr>
                  ))
                ) : isStudentsError ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
                          <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">Failed to load student roster</h3>
                        <p className="text-xs text-slate-500">{(studentsError as any)?.message || 'An unexpected error occurred while querying students.'}</p>
                        <button
                          onClick={() => refetchStudents()}
                          className="mt-2 px-5 py-2.5 bg-[#0F172A] text-white rounded-xl text-xs font-bold hover:bg-[#F97316] transition-all"
                        >
                          Retry Roster Fetch
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Users className="w-12 h-12 text-[#3A6BC4]" />
                        <h3 className="text-lg font-bold">No students found</h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      isSelected={isSelected(student.id)}
                      onToggleSelect={() => toggleSelect(student.id)}
                      onRowClick={(s) => {
                        // Navigate to the Intelligence Dashboard
                        router.push(`/admin/students/${s.id}`);
                      }}
                      onCoursesClick={handleCoursesClick}
                      onEditClick={(s, e) => { 
                        e.stopPropagation(); 
                        console.log('Opening Edit Modal for:', s.email);
                        openModal('edit', s); 
                      }}
                      onDeleteClick={(s, e) => { e.stopPropagation(); openModal('delete', s); }}
                      onSuspendClick={(s, e) => { e.stopPropagation(); openModal('suspend', s); }}
                      handleCopyEmail={handleCopyEmail}
                      onResetPassword={(s) => openModal('resetPassword', s)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Show More Incremental Controls */}
          {totalCount > 0 && (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-6 border-t border-[#E2E8F4] bg-[#F8F9FC]/50">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Showing <span className="font-black text-slate-900">{showingCount}</span> of <span className="font-black text-slate-900">{totalCount}</span> students
              </div>

              {hasMore && (
                <button
                  onClick={() => showMore(10)}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-[#0F172A] hover:text-amber-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 group cursor-pointer"
                >
                  <span>SHOW MORE</span>
                  <ChevronDown className="w-4 h-4 text-amber-500 group-hover:translate-y-0.5 transition-transform" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        onEmailClick={() => openModal('bulkEmail')}
        onExportClick={() => handleExportPDF(Array.from(selection.ids))}
        onSuspendClick={() => openModal('bulkSuspend')}
        onDeleteClick={() => openModal('bulkDelete')}
        onClearSelection={clearSelection}
      />

      {/* Modals */}
      <AddStudentModal
        isOpen={modals.add}
        onClose={closeModals}
        onSubmit={addStudentMutation.mutate}
        isLoading={addStudentMutation.isPending}
      />

      <EditStudentModal
        isOpen={modals.edit}
        onClose={closeModals}
        student={selectedStudent}
        onSubmit={editStudentMutation.mutate}
        isLoading={editStudentMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={modals.delete}
        onClose={closeModals}
        studentName={selectedStudent?.name || 'Student'}
        onConfirm={() => deleteStudentMutation.mutate(selectedStudent!.id)}
        isLoading={deleteStudentMutation.isPending}
      />

      <SuspendModal
        isOpen={modals.suspend}
        onClose={closeModals}
        studentName={selectedStudent?.name || 'Student'}
        currentStatus={selectedStudent?.status || 'ACTIVE'}
        onConfirm={(reason, policy) => {
          suspendStudentMutation.mutate({
            studentId: selectedStudent!.id,
            action: selectedStudent!.status === 'SUSPENDED' ? 'restore' : 'suspend',
            reason,
            policy
          });
        }}
        isLoading={suspendStudentMutation.isPending}
      />

      <BulkEmailModal
        isOpen={modals.bulkEmail}
        onClose={closeModals}
        selectedCount={selectedCount}
        onSend={async (subject, body) => {
          await bulkActionMutation.mutateAsync({
            action: 'email',
            data: { subject, body }
          });
        }}
      />

      <BulkSuspendModal
        isOpen={modals.bulkSuspend}
        onClose={closeModals}
        selectedCount={selectedCount}
        onConfirm={(reason) => {
          bulkActionMutation.mutate({
            action: 'suspend',
            data: { reason }
          });
        }}
        isLoading={bulkActionMutation.isPending}
      />

      <ResetPasswordModal
        isOpen={modals.resetPassword}
        onClose={closeModals}
        studentName={selectedStudent?.name || 'Student'}
        onConfirm={() => resetPasswordMutation.mutate(selectedStudent!.id)}
        isLoading={resetPasswordMutation.isPending}
      />

      <CoursesDrawer
        isOpen={modals.courses}
        onClose={closeModals}
        studentName={selectedStudent?.name || 'Student'}
        courses={studentCourses}
      />
    </div>
  );
}

