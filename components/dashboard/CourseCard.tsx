'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface CourseCardProps {
    course: {
        id: string;
        slug?: string;
        title: string;
        thumbnail?: string;
        progress: number;
        nextLesson?: string;
        instructor?: string;
    };
    className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <div 
            className={cn(
                "group w-full md:w-[420px] bg-white rounded-[24px] md:rounded-[40px] border border-[#EAE6DF] hover:shadow-[0_20px_60px_-15px_rgba(26,60,46,0.12)] transition-all duration-700 overflow-hidden flex flex-col font-inter",
                className
            )}
        >
            {/* Visual Header / Thumbnail */}
            <div className="aspect-[16/9] md:aspect-[16/9] bg-[#F7F4EF] relative overflow-hidden h-[120px] md:h-auto">
                {!imageError && course.thumbnail ? (
                    <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#D4956A]/20">
                        <BookOpen className="w-12 h-12 md:w-16 md:h-16" />
                    </div>
                )}
                
                {/* Progress Overlay Badge - Hidden on small mobile in favor of bar */}
                <div className="absolute top-3 left-3 md:top-6 md:left-6 px-3 py-1.5 md:px-5 md:py-2.5 bg-[#1A3C2E]/90 backdrop-blur-xl rounded-xl md:rounded-2xl text-[8px] md:text-[11px] font-bold text-white uppercase tracking-[0.08em] border border-white/10 shadow-xl">
                    {course.progress}%
                </div>

                {/* Mobile Specific Progress Bar - Right below image */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 md:hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        className="h-full bg-[#D4915C]" 
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 md:p-9 flex-1 flex flex-col">
                <div className="mb-4 md:mb-8">
                    <h3 className="text-[14px] md:text-[20px] font-black text-[#1A3C2E] line-clamp-2 leading-tight md:leading-relaxed mb-2 md:mb-4 tracking-tight italic uppercase">
                        {course.title}
                    </h3>
                    <div className="hidden md:flex items-start gap-4 bg-[#F7F4EF]/60 p-5 rounded-2xl border border-[#EAE6DF]/50">
                         <span className="text-[10px] font-bold text-[#D4956A] uppercase tracking-[0.1em] pt-1">Current:</span>
                         <p className="text-[14px] font-semibold text-[#576B55] leading-snug">
                            {course.nextLesson || 'Phase 1: Induction'}
                         </p>
                    </div>
                </div>

                <div className="mt-auto space-y-4 md:space-y-8">
                    {/* Desktop Progress Track */}
                    <div className="hidden md:block space-y-3">
                        <div className="h-3 w-full bg-[#F7F4EF] rounded-full overflow-hidden shadow-inner border border-[#EAE6DF]/30">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-[#D4956A] rounded-full shadow-[0_0_15px_rgba(212,149,106,0.4)]" 
                            />
                        </div>
                    </div>

                     <Link 
                        href={(course as any).continueLearningUrl || `/courses/${course.slug || course.id}/learn`}
                        className="flex items-center justify-center gap-2 w-full h-[48px] md:h-16 bg-[#1A3C2E] text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-[13px] uppercase tracking-[0.1em] hover:bg-[#D4915C] transition-all active:scale-[0.98] group/btn italic"
                    >
                        {course.progress > 0 ? 'Resume' : 'Start'}
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 group-hover/btn:translate-x-1 transition-transform" strokeWidth={4} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

