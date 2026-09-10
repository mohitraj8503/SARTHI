'use client';

import { ArrowRight, BookOpen, GraduationCap, Play, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface EnrolledCourse {
    id: string;
    title: string;
    thumbnail?: string | null;
    progress: number;
    instructor: string;
    totalLessons: number;
    lastAccessedAt?: string;
}

interface RecentModulesProps {
    enrolledCourses: EnrolledCourse[];
}

export default function RecentModules({ enrolledCourses }: RecentModulesProps) {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-[4px] h-6 bg-[#D4956A] rounded-full group-hover:h-8 transition-all duration-500"></div>
                    <h2 className="text-[24px] font-lora italic font-normal text-[#2A3828] tracking-tight">Recent Modules</h2>
                </div>
                <Link href="/dashboard/courses" className="text-[11px] font-outfit font-bold text-[#7A8FAF] hover:text-[#D4956A] uppercase tracking-widest transition-colors flex items-center gap-1">
                    View All <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enrolledCourses.slice(0, 4).map((course, i) => (
                        <Link key={course.id || i} href={`/dashboard/courses/${course.id}`} className="group">
                            <div className="bg-white p-7 rounded-[22px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-500 relative overflow-hidden group/item h-full flex flex-col justify-between min-h-[220px]">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7F4EF]/20 rounded-bl-full -translate-y-8 translate-x-8 transition-transform duration-700 group-hover/item:scale-125 pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <span className="text-[9px] font-outfit font-bold text-[#D4956A] uppercase tracking-[0.25em] bg-[#F7F4EF] px-3 py-1 rounded-full mb-3 inline-block">
                                                Module {i + 1}
                                            </span>
                                            <h4 className="text-[17px] font-outfit font-bold text-[#1F2937] leading-tight line-clamp-2 group-hover/item:text-[#D4956A] transition-colors">{course.title}</h4>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-[#F7F4EF] shrink-0 relative overflow-hidden shadow-inner group-hover/item:shadow-none transition-all">
                                            {course.thumbnail && (
                                                <Image src={course.thumbnail} alt="" fill sizes="48px" className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000" />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-medium text-[#1F2937]/30 italic mb-4">Instructor: {course.instructor}</p>
                                </div>

                                <div className="space-y-3 relative z-10 w-full mt-auto">
                                    <div className="flex justify-between items-end text-[11px] font-bold">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[#1F2937]/30 uppercase tracking-widest text-[8px]">Completion</span>
                                            <span className="text-[#1F2937] leading-none">{course.progress ?? 0}%</span>
                                        </div>
                                        <span className="text-[#D4956A] flex items-center gap-1.5 opacity-0 translate-x-4 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-[10px] uppercase tracking-widest">
                                            Resume <ChevronRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                    <div className="relative w-full h-[3px] rounded-full bg-[#F7F4EF] overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#D4956A] to-[#1F2937]/20 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${course.progress ?? 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-gradient-to-br from-white to-[#F9F8F6] p-10 md:p-12 rounded-[32px] shadow-[0_8px_32px_rgba(42,56,40,0.03)] border border-[#EAE6DF]/50 text-center relative overflow-hidden group">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4956A]/5 rounded-full -translate-y-32 translate-x-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2D4A3E]/5 rounded-full translate-y-32 -translate-x-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />

                    <div className="relative z-10 max-w-lg mx-auto py-4">
                        <div className="relative mb-10 inline-block">
                            <div className="w-24 h-24 rounded-[24px] bg-white shadow-[0_12px_44px_rgba(0,0,0,0.06)] flex items-center justify-center mx-auto group-hover:rotate-6 transition-all duration-700 relative z-20 overflow-hidden">
                                <div className="absolute inset-0 bg-[#F7F4EF]/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Play className="w-8 h-8 text-[#D4956A] fill-[#D4956A]/20 relative z-10" />
                            </div>
                            {/* Floating icons for shelf effect */}
                            <BookOpen className="absolute -top-4 -left-8 w-6 h-6 text-[#D4956A]/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-700" />
                            <GraduationCap className="absolute -bottom-2 -right-10 w-8 h-8 text-[#2D4A3E]/20 opacity-0 group-hover:opacity-100 group-hover:-translate-x-6 transition-all duration-1000 delay-100" />
                        </div>

                        <h3 className="text-[26px] font-lora italic font-normal text-[#2A3828] mb-4 tracking-tight">Your Academy Shelf</h3>
                        <p className="text-[15px] font-nunito text-[#5D705B] mb-10 leading-relaxed max-w-sm mx-auto opacity-70 font-light">
                            Your learning journey is a blank canvas. Enroll in your first module to begin crafting your future.
                        </p>

                        <Link
                            href="/dashboard/courses"
                            className="inline-flex items-center gap-4 px-10 py-4 rounded-full bg-[#2A3828] text-white text-[11px] font-outfit font-black uppercase tracking-[0.25em] hover:bg-[#D4956A] hover:shadow-[0_10px_25px_rgba(212,149,106,0.25)] hover:-translate-y-1 transition-all group/cta"
                        >
                            Explore Modules
                            <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-2 transition-transform" />
                        </Link>

                        <div className="mt-10 flex items-center justify-center gap-8 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full border border-dashed border-[#2A3828] flex items-center justify-center">
                                    <span className="text-[10px] font-bold">01</span>
                                </div>
                                <span className="text-[8px] uppercase tracking-widest font-black">Choose</span>
                            </div>
                            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#2A3828] to-transparent" />
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full border border-dashed border-[#2A3828] flex items-center justify-center">
                                    <span className="text-[10px] font-bold">02</span>
                                </div>
                                <span className="text-[8px] uppercase tracking-widest font-black">Learn</span>
                            </div>
                            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#2A3828] to-transparent" />
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 rounded-full border border-dashed border-[#2A3828] flex items-center justify-center">
                                    <span className="text-[10px] font-bold">03</span>
                                </div>
                                <span className="text-[8px] uppercase tracking-widest font-black">Master</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

