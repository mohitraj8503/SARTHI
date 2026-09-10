'use client';

import { motion } from 'framer-motion';
import { Clock, Star, Users, ArrowRight, Bookmark } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCourses } from '@/hooks/useCourses';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

function CourseSodaSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-[420px] animate-pulse">
          <div className="h-56 bg-slate-100" />
          <div className="p-6 space-y-4">
            <div className="h-4 w-1/3 bg-slate-100 rounded" />
            <div className="h-8 w-3/4 bg-slate-100 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="pt-4 mt-auto flex justify-between">
              <div className="h-8 w-20 bg-slate-100 rounded" />
              <div className="h-8 w-20 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CourseGrid() {
  const { data: courses, isLoading, error } = useCourses();
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io();

    socket.on('teacher_profile_updated', (payload: any) => {
      // ... same logic
      queryClient.setQueryData(['courses'], (oldCourses: any[] | undefined) => {
        if (!oldCourses) return oldCourses;
        return oldCourses.map(c => {
          const tId = c.createdBy?.id || c.instructor?.id;
          if (tId === payload.teacherId) {
            return {
              ...c,
              instructor: { ...c.instructor, name: payload.name, image: payload.profilePicture },
              createdBy: { ...(c.createdBy || {}), id: tId, name: payload.name, image: payload.profilePicture }
            };
          }
          return c;
        });
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <section id="courses" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <CourseSodaSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="py-24 text-center text-red-500">Failed to load courses.</div>
  }

  return (
    <section id="courses" className="py-24 lg:py-32 bg-slate-50 border-y border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">

        {/* Minimal Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 lg:mb-16">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Popular <span className="text-orange-600">Masterclasses</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Join thousands of students building real-world projects.
            </p>
          </div>
          <Link href="/courses" className="hidden md:flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-wider">
            View All Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses?.map((course, index) => {
            const instructorName = typeof course.instructor === 'object' ? course.instructor?.name : course.instructor || 'Instructor';

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(0,0,0,0.06)] transition-all duration-500"
              >
                {/* Image */}
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                  {course.thumbnail && (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      quality={85}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}

                  {/* Save Button */}
                  <button className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-orange-600 transition-colors shadow-sm z-10">
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-100 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    <span className="text-slate-900 text-xs font-bold">{course.rating || 4.8}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-4">
                    <div className="flex gap-2 mb-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                        {course.category || 'Development'}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded bg-orange-50 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                        Beginner
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-[1.3] group-hover:text-orange-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>{Math.round((course.totalDuration || 60) / 60)}h Total</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-orange-500" />
                        <span>{course.studentsEnrolled || 120} learners</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200">
                          {(course.createdBy?.image || (typeof course.instructor === 'object' && course.instructor?.image)) ? (
                            <Image
                              src={course.createdBy?.image || (typeof course.instructor === 'object' ? course.instructor?.image || '' : '')}
                              alt={instructorName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                              {instructorName[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{instructorName}</span>
                      </div>
                      <span className="text-base font-bold text-slate-900">
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
}

