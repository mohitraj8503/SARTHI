'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { CourseHealthRecord } from '@/lib/types/teacher-dashboard';
import { cn } from '@/lib/utils';

interface CourseHealthProps {
  courses: CourseHealthRecord[];
}

export default function CourseHealth({ courses }: CourseHealthProps) {
  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Course Health</h3>
          <p className="text-xs text-slate-500 font-medium">Performance monitoring per module</p>
        </div>
        <Activity className="w-5 h-5 text-emerald-500" />
      </div>

      <div className="p-4 space-y-3">
        {courses.map((course, i) => (
          <motion.div 
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl border border-slate-50 hover:border-emerald-100 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{course.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-black text-slate-600">{course.rating.toFixed(1)}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    ₹{course.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className={cn(
                "p-1.5 rounded-lg",
                course.status === 'OPTIMAL' ? "bg-emerald-50 text-emerald-600" :
                course.status === 'NEEDS_UPDATE' ? "bg-amber-50 text-amber-600" :
                "bg-red-50 text-red-600"
              )}>
                {course.status === 'OPTIMAL' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completion</span>
                  <span className="text-[10px] font-black text-slate-900">{course.completionRate}%</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      course.completionRate > 70 ? "bg-emerald-500" :
                      course.completionRate > 40 ? "bg-amber-500" :
                      "bg-red-500"
                    )}
                    style={{ width: `${course.completionRate}%` }}
                  />
                </div>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full py-4 bg-slate-50/50 hover:bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-colors border-t border-slate-50">
        Analytics Dashboard
      </button>
    </div>
  );
}

