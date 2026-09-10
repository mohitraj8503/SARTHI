'use client';

import { BookOpen, ArrowRight, Search, Play, Award, Loader2, Download } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Course } from '@/types/dashboard';

export default function TabMyCourses() {
  const [filter, setFilter] = useState('All');

  const { data, isLoading } = useQuery<{ courses: Course[] }>({
    queryKey: ['my_courses'],
    queryFn: async () => {
      const res = await fetch('/api/student/dashboard?tab=my-courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      return res.json();
    }
  });

  const courses: Course[] = data?.courses || [];
  const filteredCourses = courses.filter((c) => {
    if (filter === 'All') return true;
    if (filter === 'In Progress') return c.status === 'active' && c.progress < 100;
    if (filter === 'Completed') return c.progress === 100 || c.status === 'completed';
    return true;
  });

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-bold">Synchronizing your classroom...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
       <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
         <div>
             <h1 className="text-[32px] md:text-[38px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">My Universe</h1>
             <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your enrolled courses and track your journey.</p>
         </div>
         
         <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center bg-white dark:bg-[#151B2B] p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                 {['All', 'In Progress', 'Completed'].map((f) => (
                     <button 
                       key={f}
                       onClick={() => setFilter(f)}
                       className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${filter === f ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                     >
                       {f}
                     </button>
                 ))}
              </div>
         </div>
       </div>

       <AnimatePresence mode="popLayout">
         {filteredCourses.length > 0 ? (
           <motion.div 
             layout
             className="grid grid-cols-1 gap-4"
           >
              {filteredCourses.map((course) => (
                  <motion.div 
                     layout
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.98 }}
                     key={course.id} 
                     className="bg-white dark:bg-[#151B2B] border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group relative overflow-hidden"
                  >
                     {/* Course Image */}
                     <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                        {course.thumbnail ? (
                            <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <BookOpen className="w-8 h-8 text-slate-300" />
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Play className="w-6 h-6 text-white" />
                        </div>
                     </div>
                     
                     <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                           <h3 className="text-[18px] md:text-[20px] font-extrabold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{course.title}</h3>
                           {course.progress === 100 && (
                               <span className="inline-flex px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-green-500/20 w-fit mx-auto md:mx-0">
                                  <Award className="w-3 h-3 mr-1" /> Graduated
                               </span>
                           )}
                        </div>
                        
                        <div className="w-full max-w-[500px] mx-auto md:mx-0">
                           <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                              <span>Learning Completion</span>
                              <span>{course.progress}%</span>
                           </div>
                           <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full transition-all duration-1000 ease-out rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`} 
                                 style={{ width: `${course.progress}%` }} 
                               />
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-3 min-w-[160px] w-full md:w-auto mt-4 md:mt-0">
                        <Link 
                          href={`/courses/${course.id}`}
                          className="h-12 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[14px] hover:scale-[1.02] active:scale-0.98 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/5 dark:shadow-none"
                        >
                           {course.progress === 100 ? 'Re-Review Course' : 'Resume Journey'} <ArrowRight className="w-4 h-4" />
                        </Link>
                        {course.progress === 100 && (
                          <Link 
                            href={`/api/certificates/${course.id}/download`}
                            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[12px] font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                          >
                             <Download className="w-4 h-4" /> Certificate
                          </Link>
                        )}
                     </div>

                     {/* Background Subtle Gradient */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-10 -mt-10 blur-3xl opacity-50" />
                  </motion.div>
              ))}
           </motion.div>
         ) : (
             <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-center py-24 bg-white dark:bg-[#151B2B] rounded-3xl border border-dashed border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-none"
             >
                 <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-slate-100 dark:border-white/5 rotate-3">
                    <Search className="w-10 h-10 text-slate-300" />
                 </div>
                 <h3 className="text-[22px] font-extrabold text-slate-900 dark:text-white mb-2">Universe is Quiet...</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-sm mx-auto">You haven&apos;t enrolled in any courses yet. Start your journey by exploring our premium tech catalog.</p>
                 <Link 
                   href="/dashboard?tab=explore" 
                   className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white text-[15px] font-extrabold rounded-2xl transition-all shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                 >
                    Discover Courses <ArrowRight className="w-5 h-5" />
                 </Link>
             </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}

