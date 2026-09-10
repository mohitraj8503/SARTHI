'use client';

import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

import WelcomeHero from '@/components/dashboard/sections/WelcomeHero';
import StatsOverview from '@/components/dashboard/sections/StatsOverview';
import DailyAgenda from '@/components/dashboard/sections/DailyAgenda';
import LiveBanner from './LiveBanner';

interface OverviewTabProps {
    data: any;
    greeting: string;
    userFirstName: string;
}

export default function OverviewTab({ data, greeting, userFirstName }: OverviewTabProps) {
    const enrolledCourses = data.enrolledCourses || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12 pb-32 max-w-7xl mx-auto"
        >
            <LiveBanner />
            
            {/* HERO SECTION - Exact match to Screenshot 1 */}
            <WelcomeHero
                greeting={greeting}
                userFirstName={userFirstName}
                enrolledCourses={enrolledCourses}
                streak={data.streak}
            />

            {/* STATS ROW - White Cards */}
            <StatsOverview stats={data.stats} />

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* MY LEARNING PATH */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-2 md:px-0">
                        <h3 className="text-[20px] md:text-[24px] font-black text-[#1B4332] italic uppercase tracking-tight">
                            My Learning Path
                        </h3>
                        <Link href="/dashboard/courses" className="text-gray-400 font-bold hover:text-[#1B4332] flex items-center gap-2 transition-colors text-[10px] md:text-xs uppercase tracking-widest italic">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-6">
                        {enrolledCourses.length > 0 ? (
                            <>
                                {/* PRIMARY ACTIVE COURSE - Exact match to Screenshot 1 */}
                                <Link href={`/courses/${enrolledCourses[0].slug || enrolledCourses[0].id}/learn`} className="block group">
                                    <div className="bg-white rounded-[32px] md:rounded-[48px] p-6 md:p-10 text-[#1B4332] relative overflow-hidden shadow-sm border border-gray-100 transition-all duration-500 hover:scale-[1.01] active:scale-95">
                                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                            <div className="w-full md:w-56 aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden shadow-lg shrink-0 relative">
                                                {enrolledCourses[0].thumbnail ? (
                                                    <Image src={enrolledCourses[0].thumbnail} alt={enrolledCourses[0].title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full bg-[#1B4332]/5 flex items-center justify-center">
                                                        <BookOpen className="w-12 h-12 text-[#1B4332]/20" />
                                                    </div>
                                                )}
                                                {/* Progress Overlay Tag */}
                                                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full">
                                                    {enrolledCourses[0].progress}%
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-6 text-center md:text-left">
                                                <div>
                                                    <h4 className="text-2xl md:text-3xl font-black italic uppercase leading-tight tracking-tighter mb-2 group-hover:text-[#D4915C] transition-colors">{enrolledCourses[0].title}</h4>
                                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">by {enrolledCourses[0].instructor || 'Mohit Raj'}</p>
                                                    <p className="text-[#1B4332]/40 font-bold uppercase tracking-widest text-[10px] mt-4 italic">Phase: {enrolledCourses[0].nextLesson || 'Professional Induction'}</p>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${enrolledCourses[0].progress}%` }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                            className="bg-gray-200 h-full rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                {/* SUB-COURSES GRID */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {enrolledCourses.slice(1).map((course: any) => (
                                        <Link key={course.id} href={`/courses/${course.slug || course.id}/learn`} className="group">
                                            <div className="bg-white rounded-[28px] border border-gray-100 p-4 flex gap-4 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                                                <div className="w-24 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-50 relative">
                                                    {course.thumbnail ? (
                                                        <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <BookOpen className="w-6 h-6 text-gray-200" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center gap-1">
                                                    <h5 className="font-black text-[#1B4332] text-sm uppercase italic line-clamp-1 group-hover:text-[#D4915C] transition-colors">{course.title}</h5>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.progress}% done</span>
                                                        <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#1B4332]" style={{ width: `${course.progress}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* EMPTY STATE */
                            <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-100 shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 transition-transform duration-500">
                                    <BookOpen className="w-10 h-10 text-gray-300" />
                                </div>
                                <h4 className="text-xl font-bold text-[#1B4332] mb-4">
                                    Your Learning Terminal is Empty
                                </h4>
                                <p className="text-gray-600 mb-10 max-w-sm mx-auto leading-relaxed text-sm">
                                    Initialize your career path by enrolling in one of our professional specializations.
                                </p>
                                <Link href="/courses" className="inline-flex px-10 py-4 bg-[#1B4332] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] italic shadow-xl shadow-[#1B4332]/20 hover:bg-[#D4915C] transition-all">
                                    Access Catalog <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR - Masterclass Widget */}
                <div className="lg:col-span-4 h-full">
                    <DailyAgenda sessions={data.upcomingLessons || []} />
                </div>
            </div>
        </motion.div>
    );
}

