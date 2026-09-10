'use client';

import React from 'react';
import { Layers, ChevronRight, PlayCircle, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface CurriculumTabProps {
    data: any;
}

export default function CurriculumTab({ data }: CurriculumTabProps) {
    const enrolledCourses = data.enrolledCourses || [];

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#174F3A]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Knowledge Structure</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 uppercase font-outfit italic">Course <span className="text-[#174F3A]">Curriculum</span></h2>
                <p className="text-[13px] text-gray-400 font-black tracking-widest uppercase italic">Deep dive into your professional learning modules</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-10">
                {enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course: any, cIdx: number) => (
                        <div key={course.id} className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="p-5 sm:p-8 md:p-12 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden shadow-inner relative">
                                        {course.thumbnail ? (
                                            <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                                        ) : (
                                            <Layers className="w-8 h-8 text-gray-200" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 italic uppercase tracking-tight leading-none mb-2 font-outfit">{course.title}</h3>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[2px]">Progress: {course.progress}% Completed</p>
                                    </div>
                                </div>
                                <a 
                                    href={`/courses/${course.slug || course.id}/learn`}
                                    className="px-10 py-5 bg-[#174F3A] text-white rounded-2xl font-black text-[10px] uppercase tracking-[3px] hover:scale-105 transition-all flex items-center gap-3 shadow-xl shadow-[#174F3A]/20"
                                >
                                    OPEN TERMINAL <ChevronRight className="w-4 h-4" />
                                </a>
                            </div>

                            <div className="p-5 sm:p-8 md:p-12 space-y-8">
                                {course.modules?.length > 0 ? (
                                    course.modules.map((module: any, mIdx: number) => (
                                        <div key={mIdx} className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">
                                                    {mIdx + 1}
                                                </div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{module.title}</h4>
                                            </div>

                                            <div className="pl-0 sm:pl-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {module.lessons?.map((lesson: any, lIdx: number) => (
                                                    <div key={lIdx} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-[1.5rem] border border-gray-100 group hover:border-[#174F3A]/30 transition-all cursor-pointer">
                                                        <div className="flex items-center gap-4">
                                                            {lesson.contentType === 'video' ? (
                                                                <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-[#174F3A] transition-colors" />
                                                            ) : (
                                                                <FileText className="w-4 h-4 text-gray-400 group-hover:text-[#174F3A] transition-colors" />
                                                            )}
                                                            <span className="text-[11px] font-black uppercase tracking-wider text-gray-600 group-hover:text-gray-900 transition-colors font-outfit italic">{lesson.title}</span>
                                                        </div>
                                                        {lesson.completed && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center space-y-4">
                                        <Layers className="w-12 h-12 text-gray-200 mx-auto" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] italic">Phase Documentation Initializing...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-40 text-center space-y-8">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <Layers className="w-12 h-12 text-gray-200" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 italic uppercase font-outfit tracking-tighter">Terminal Offline</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Enroll in a course to view its curriculum structure.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

