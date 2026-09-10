
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { GlassCard } from './GlassCard';
import { PlayCircle, ArrowRight, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

export function ActiveCourses({ courses, quickResume }: { courses: any[], quickResume: any }) {
    if (!courses || courses.length === 0) {
        return (
            <GlassCard className="col-span-2">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <PlayCircle className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">No Active Courses</h3>
                    <p className="text-gray-400 mt-2 mb-6 max-w-sm">
                        Browse our catalog and start learning something new today.
                    </p>
                    <Link
                        href="/courses"
                        className="px-6 py-2.5 bg-[#6E7BFF] hover:bg-[#5c68e6] text-white rounded-xl font-medium transition-colors"
                    >
                        Browse Catalog
                    </Link>
                </div>
            </GlassCard>
        );
    }

    return (
        <div className="col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Active Courses</h2>
                <Link href="/courses" className="text-sm text-[#6E7BFF] hover:text-[#5c68e6] font-medium flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Quick Resume Hero Card */}
            {quickResume && (
                <GlassCard className="relative overflow-hidden group cursor-pointer border-[#6E7BFF]/20">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <PlayCircle className="w-32 h-32 text-[#6E7BFF]" />
                    </div>
                    <Link href={`/courses/${quickResume.courseId}/learn`}>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6E7BFF]/10 text-[#6E7BFF] text-xs font-bold uppercase tracking-wider mb-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#6E7BFF] animate-pulse" />
                                    Resume Learning
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#6E7BFF] transition-colors">
                                    {quickResume.lessonTitle}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    {quickResume.courseTitle}
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#6E7BFF] rounded-full"
                                            style={{ width: `${quickResume.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">
                                        {quickResume.progress}%
                                    </span>
                                </div>
                            </div>
                            <div className="shrink-0">
                                <button className="w-12 h-12 rounded-full bg-[#6E7BFF] text-white flex items-center justify-center shadow-lg shadow-[#6E7BFF]/20 group-hover:scale-110 transition-transform">
                                    <PlayCircle className="w-6 h-6 fill-current" />
                                </button>
                            </div>
                        </div>
                    </Link>
                </GlassCard>
            )}

            {/* Course List */}
            <div className="space-y-4">
                {courses.slice(0, 3).map((course) => (
                    <GlassCard key={course.id} hover className="p-4 flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl bg-gray-800 shrink-0 relative overflow-hidden">
                            {course.thumbnail ? (
                                <Image
                                    src={course.thumbnail}
                                    alt={course.title}
                                    fill
                                    quality={85}
                                    sizes="64px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-700 text-xs text-gray-500">Img</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate group-hover:text-[#6E7BFF] transition-colors">{course.title}</h4>
                            <div className="flex items-center gap-3 mt-1.5">
                                <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${course.progress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 font-mono">{course.progress}%</span>
                            </div>
                        </div>
                        <Link
                            href={`/courses/${course.id}/learn`}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <PlayCircle className="w-5 h-5" />
                        </Link>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}

