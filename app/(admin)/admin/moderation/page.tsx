'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, CheckCircle2, XCircle, AlertTriangle,
  Clock, Users, Play, X, Eye, FileText, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type ModerationFilter = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export default function CourseModerationQueue() {
  const [filter, setFilter] = useState<ModerationFilter>('PENDING_REVIEW');
  const [reviewModal, setReviewModal] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null); // Curriculum Preview Drawer
  const [reason, setReason] = useState('');
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['course-moderation', filter],
    queryFn: async () => {
      const res = await fetch(`/api/admin/moderation/courses?status=${filter}`);
      if (!res.ok) throw new Error('Failed to retrieve moderation queue');
      return res.json();
    }
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ courseId, action, reason }: { courseId: string; action: string; reason?: string }) => {
      const res = await fetch('/api/admin/moderation/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, action, reason }),
      });
      if (!res.ok) throw new Error('Moderation action failed');
      return res.json();
    },
    onSuccess: (_, vars) => {
      addToast({
        type: 'success',
        title: `Content ${vars.action === 'APPROVE' ? 'Approved' : vars.action === 'REQUEST_CHANGES' ? 'Changes Requested' : 'Rejected'}`,
        message: 'Moderation decision successfully saved and logged.'
      });
      queryClient.invalidateQueries({ queryKey: ['course-moderation'] });
      setReviewModal(null);
      setSelectedCourse(null);
      setReason('');
    },
    onError: (err: any) => {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Failed to submit moderation decision.'
      });
    }
  });

  const courses = data?.courses || [];

  return (
    <div className="relative flex-1 w-full animate-fade-in p-8 space-y-10 max-w-[1400px] mx-auto min-h-screen">
      {/* Background Atmosphere - Consistent with dashboard ecosystem */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[80px] animate-pulse" />
        <div className="absolute top-[20%] -right-10 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[60px] animate-float" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] -left-20 w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[70px] animate-float-delayed" style={{ animationDuration: '10s' }} />
      </div>

      {/* Header Section */}
      <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
        <div className="space-y-1.5 text-left relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
            <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">QUALITY CONTROL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
            CONTENT <span className="text-[#F97316]">MODERATION</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
            Review course curriculum quality, inspect lessons, and moderate content before publishing.
          </p>
        </div>
      </header>

      {/* Filter Tabs Segmented Navigation */}
      <div className="flex flex-wrap gap-2.5 bg-slate-100/80 backdrop-blur-xl border border-slate-200/50 p-2 rounded-2xl w-fit shadow-sm">
        {(['PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED'] as ModerationFilter[]).map(f => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative",
                isActive 
                  ? "bg-[#0F172A] text-white shadow-[0_4px_12px_rgba(15,23,42,0.15)]" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              )}
            >
              {f.replace(/_/g, ' ')}
            </button>
          );
        })}
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div 
                key={i} 
                className="h-[420px] bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 flex flex-col gap-6"
              >
                <div className="w-full h-44 bg-slate-100 rounded-3xl animate-pulse" />
                <div className="h-6 w-3/4 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-100 rounded-xl animate-pulse" />
                <div className="mt-auto grid grid-cols-3 gap-2">
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                </div>
              </div>
            ))
          ) : courses.length === 0 ? (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center backdrop-blur-md"
            >
              <CheckCircle2 className="w-16 h-16 text-slate-300 mb-4 animate-bounce" />
              <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">Queue is Clear!</h3>
              <p className="text-xs font-semibold text-slate-400 max-w-[320px] mt-1.5 leading-relaxed">
                All uploaded courses have been moderated successfully. Outstanding items will appear here automatically.
              </p>
            </motion.div>
          ) : courses.map((course: any) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col group relative"
            >
              {/* Dynamic Status Watermark */}
              <div className="absolute top-4 left-4 z-10">
                <span className={cn(
                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md",
                  course.moderationStatus === 'PENDING_REVIEW' ? "bg-amber-500/10 text-amber-700 border border-amber-200/50" :
                  course.moderationStatus === 'APPROVED' ? "bg-emerald-500/10 text-emerald-700 border border-emerald-200/50" :
                  course.moderationStatus === 'REJECTED' ? "bg-rose-500/10 text-rose-700 border border-rose-200/50" :
                  "bg-orange-500/10 text-orange-700 border border-orange-200/50"
                )}>
                  {course.moderationStatus.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Thumbnail Media Box */}
              <div className="h-44 bg-gradient-to-br from-indigo-50 to-slate-100 relative overflow-hidden">
                {course.thumbnail ? (
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-indigo-500/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 gap-4">
                <div>
                  <h3 className="text-[15px] font-black text-[#0F172A] leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide">
                      {course.instructor?.name || 'Unknown Faculty'}
                    </p>
                  </div>
                </div>

                {/* Course Metadata Dashboard Cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <p className="text-[14px] font-black text-[#0F172A]">{course._count?.lessons || 0}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Lessons</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <p className="text-[14px] font-black text-[#0F172A]">{course._count?.enrollments || 0}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Enrolled</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <p className="text-[14px] font-black text-[#0F172A] line-clamp-1">{course.level || 'Any'}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Level</p>
                  </div>
                </div>

                {/* Course Moderation Notes */}
                {course.moderationNote && (
                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100/60 text-[10px] font-bold text-amber-700 leading-relaxed">
                    <span className="font-extrabold uppercase tracking-widest block mb-0.5 text-[8px]">Audit Feedback Note:</span>
                    {course.moderationNote}
                  </div>
                )}

                {/* Primary Auditing Button */}
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="w-full h-11 bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-100 text-[#0F172A] hover:text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm group-hover:-translate-y-0.5"
                >
                  <Eye className="w-4 h-4" /> Audit Curriculum Tree
                </button>

                {/* Status-specific action panels */}
                {filter === 'PENDING_REVIEW' && (
                  <div className="flex gap-2 pt-3 border-t border-slate-100 mt-auto">
                    <button
                      onClick={() => setReviewModal({ course, defaultAction: 'REJECT' })}
                      className="flex-1 h-11 border-2 border-rose-100 text-rose-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => moderateMutation.mutate({ courseId: course.id, action: 'APPROVE' })}
                      className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-emerald-500/20 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Curriculum Preview Side-Drawer */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedCourse(null)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[8px] font-black uppercase tracking-wider">
                      Curriculum Audit
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-tight leading-tight line-clamp-1">
                    {selectedCourse.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Educator: {selectedCourse.instructor?.name || 'Unknown Faculty'} ({selectedCourse.instructor?.email})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all text-slate-400 hover:text-slate-600 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Short statistics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <span className="text-xl font-black text-[#0F172A]">{selectedCourse.modules?.length || 0}</span>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">Modules</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <span className="text-xl font-black text-[#0F172A]">{selectedCourse._count?.lessons || 0}</span>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">Lessons</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <span className="text-xl font-black text-[#0F172A]">{selectedCourse.level || 'Any'}</span>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">Target Level</p>
                  </div>
                </div>

                {/* Modules & Lessons Timeline */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Structure Overview</h4>
                  {(!selectedCourse.modules || selectedCourse.modules.length === 0) ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-3xl text-center text-slate-400">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-pulse" />
                      <p className="text-xs font-bold">No modules created yet for this course.</p>
                    </div>
                  ) : (
                    selectedCourse.modules.map((mod: any, mIdx: number) => (
                      <div key={mod.id} className="border border-slate-100 bg-slate-50/20 rounded-3xl p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">
                              Module {mIdx + 1}
                            </span>
                            <h5 className="text-[13px] font-black text-[#0F172A] tracking-tight">{mod.title}</h5>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold">
                            {mod.lessons?.length || 0} Lessons
                          </span>
                        </div>

                        {(!mod.lessons || mod.lessons.length === 0) ? (
                          <p className="text-[10px] font-medium text-slate-400 italic">No lessons in this module.</p>
                        ) : (
                          <div className="space-y-2 mt-2 pl-2 border-l border-indigo-100">
                            {mod.lessons.map((lesson: any, lIdx: number) => (
                              <div key={lesson.id} className="bg-white border border-slate-100/80 p-3 rounded-2xl flex items-center justify-between hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px] font-black">
                                    {lIdx + 1}
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-extrabold text-[#0F172A] leading-tight line-clamp-1">{lesson.title}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 flex items-center gap-1.5">
                                      {lesson.duration ? <span>{lesson.duration} mins</span> : null}
                                      {lesson.duration && lesson.contentType ? <span className="w-1 h-1 rounded-full bg-slate-200" /> : null}
                                      <span>{lesson.contentType || 'VIDEO'}</span>
                                    </p>
                                  </div>
                                </div>

                                {lesson.videoUrl && (
                                  <a 
                                    href={lesson.videoUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-7 h-7 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              {selectedCourse.moderationStatus === 'PENDING_REVIEW' && (
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                  <button
                    onClick={() => {
                      setReviewModal({ course: selectedCourse, defaultAction: 'REJECT' });
                      setSelectedCourse(null);
                    }}
                    className="flex-1 h-12 bg-white border-2 border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                  >
                    Reject Course
                  </button>
                  <button
                    onClick={() => {
                      setReviewModal({ course: selectedCourse, defaultAction: 'REQUEST_CHANGES' });
                      setSelectedCourse(null);
                    }}
                    className="flex-1 h-12 bg-white border-2 border-amber-100 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all"
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => {
                      moderateMutation.mutate({ courseId: selectedCourse.id, action: 'APPROVE' });
                      setSelectedCourse(null);
                    }}
                    className="flex-1 h-12 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                  >
                    Approve Content
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review & Feedback Modal */}
      <AnimatePresence>
        {reviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setReviewModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Audit Quality Decision</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">{reviewModal.course.title}</p>
                </div>
                <button
                  onClick={() => setReviewModal(null)}
                  className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                Detailed Feedback Note / Explanation
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={4}
                placeholder="Explain why the course content needs revisions or what violations triggered a rejection..."
                className="w-full p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-medium text-[#0F172A] focus:ring-2 focus:ring-rose-200 outline-none resize-none transition-all"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => moderateMutation.mutate({ courseId: reviewModal.course.id, action: 'REQUEST_CHANGES', reason })}
                  className="flex-1 h-12 border-2 border-amber-200 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all"
                >
                  Request Changes
                </button>
                <button
                  onClick={() => moderateMutation.mutate({ courseId: reviewModal.course.id, action: 'REJECT', reason })}
                  className="flex-1 h-12 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md hover:shadow-rose-600/20"
                >
                  Reject Course
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
