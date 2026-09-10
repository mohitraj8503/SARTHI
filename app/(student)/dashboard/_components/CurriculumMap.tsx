'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface CurriculumMapProps {
  courses: any[];
  isLoading?: boolean;
}

export default function CurriculumMap({ courses, isLoading }: CurriculumMapProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm animate-pulse">
        <div className="h-8 w-48 bg-slate-100 rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-50 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const activeCourse = courses?.[0] || null;
  const isEnrolled = Boolean(activeCourse);

  if (!isEnrolled) {
    return null;
  }

  const modules = activeCourse.modules && activeCourse.modules.length > 0
    ? activeCourse.modules
    : [{ title: 'Basics' }, { title: 'Core' }, { title: 'Advanced' }, { title: 'Projects' }, { title: 'Final' }];

  return (
    <section className="bg-white rounded-3xl lg:rounded-[3rem] p-6 lg:p-12 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group w-full min-h-[460px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-4 bg-emerald-500 rounded-full" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">PROGRESS ARCHITECTURE</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                  Learning <span className="text-emerald-600">Roadmap</span>
                </h2>
                <div className="hidden lg:flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-full border border-slate-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                    {courses.length} Active Tracks
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-3 lg:mt-0">Visualizing your trajectory through the technical modules</p>
            </div>
            
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <motion.div 
          key={activeCourse.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col bg-gray-50 rounded-2xl border border-slate-100 p-6 sm:p-8 transition-all shadow-sm relative min-h-[320px]"
        >
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight uppercase">{activeCourse.title}</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  {modules.length} Modules • {activeCourse.level || 'Beginner'} • 6 Weeks
                </p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PROGRESS</span>
                <div className="flex items-center gap-2">
                   {activeCourse.progress === 0 ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 border border-slate-300 rounded-full" />
                        0% Complete
                      </span>
                   ) : activeCourse.progress < 100 ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-orange-500 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                        In Progress
                      </span>
                   ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Completed
                      </span>
                   )}
                </div>
              </div>

              {/* Segmented Progress Bar */}
              <div className="relative pt-4">
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${modules.length}, minmax(0, 1fr))` }}>
                  {modules.map((m: any, nIdx: number) => {
                    const nodeProgress = (activeCourse.progress / 100) * modules.length;
                    const isCompleted = nIdx < Math.floor(nodeProgress);
                    const isCurrent = nIdx === Math.floor(nodeProgress);
                    
                    return (
                      <div key={nIdx} className="space-y-3 text-center">
                        <div 
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            isCompleted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                            isCurrent ? "bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]" : 
                            "bg-slate-200"
                          )}
                        />
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-tighter block truncate px-1",
                          isCompleted || isCurrent ? "text-emerald-600" : "text-slate-400"
                        )} title={m.title}>
                          {m.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <Link 
              href={activeCourse.continueLearningUrl || `/courses/${activeCourse.slug}/learn`}
              className="mt-8 mx-auto w-auto px-8 py-2.5 bg-[#16a34a] text-white rounded-[10px] font-bold text-[13px] uppercase tracking-[1px] shadow-[0_0_20px_rgba(22,163,74,0.35)] hover:shadow-[0_0_28px_rgba(22,163,74,0.55)] hover:-translate-y-[1px] transition-all flex items-center gap-3 active:scale-95"
            >
              START TRACK <ChevronRight size={14} />
            </Link>
          </motion.div>
      </div> 
    </section>
  );
}
