'use client';

import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnrolledCourse {
    id: string;
    slug?: string;
    title: string;
    thumbnail?: string | null;
    progress: number;
    instructor: string;
    totalLessons: number;
    nextLesson?: string;
    continueLearningUrl?: string;
}

interface WelcomeHeroProps {
    greeting: string;
    userFirstName: string;
    enrolledCourses: EnrolledCourse[];
    discovery?: any;
}

export default function WelcomeHero({
    greeting,
    userFirstName,
    enrolledCourses,
}: WelcomeHeroProps) {
    const activeCourse = enrolledCourses.find(c => c.progress < 100) || enrolledCourses[0];

    return (
        <section className="relative space-y-8">
            {/* Header / Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-[24px] md:text-5xl font-black text-[#1B4332] tracking-tighter italic uppercase">
                        {greeting}, <span className="text-[#D4915C]">{userFirstName} 👋</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest opacity-80">Ready to continue your specialized learning track?</p>
                </div>
            </div>

            {/* HERO CARD - Exact match to Screenshot 1 */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[40px] p-8 md:p-14 shadow-sm border border-gray-100 text-center relative overflow-hidden"
            >
                <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                    {activeCourse ? (
                        <>
                            <div className="flex flex-col items-center gap-4">
                                <span className="px-4 py-1.5 bg-[#D4915C]/10 text-[#D4915C] text-[9px] font-black uppercase tracking-[0.2em] rounded-full italic border border-[#D4915C]/10">
                                    Continue Learning
                                </span>
                                <h2 className="text-[22px] md:text-5xl font-black tracking-tighter uppercase text-[#1B4332] leading-tight italic line-clamp-2">
                                    {activeCourse.title}
                                </h2>
                                
                                <p className="text-gray-400 text-xs md:text-lg font-black uppercase tracking-widest italic opacity-60">
                                    Next Phase: <span className="text-[#1B4332] italic font-normal">{activeCourse.nextLesson || 'Professional Induction'}</span>
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 w-full">
                                <Link 
                                    href={activeCourse.continueLearningUrl || `/courses/${activeCourse.slug || activeCourse.id}/learn`}
                                    className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white h-[56px] px-10 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#1B4332]/10 transition-all active:scale-95 inline-flex items-center justify-center gap-3 text-[11px] italic w-full sm:w-auto"
                                >
                                    <Play className="w-4 h-4 fill-current" /> Resume Session
                                </Link>
                                <Link 
                                    href="/courses"
                                    className="bg-white border-2 border-transparent text-gray-500 h-[56px] px-8 rounded-2xl font-black uppercase tracking-[0.2em] hover:text-[#1B4332] transition-all inline-flex items-center justify-center gap-2 text-[11px] italic w-full sm:w-auto"
                                >
                                    Browse Catalog <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase text-[#1B4332] leading-tight">
                                START YOUR JOURNEY
                            </h2>
                            <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">
                                Select your first specialization from our industry-grade catalog to begin building the skills of tomorrow.
                            </p>
                            
                            <div className="pt-8">
                                <Link 
                                    href="/courses"
                                    className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-12 py-6 rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-[#1B4332]/10 transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-3 text-sm"
                                >
                                    EXPLORE CATALOG 
                                    <ArrowRight className="w-6 h-6" />
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </section>
    );
}

