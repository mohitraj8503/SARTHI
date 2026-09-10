'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Star, ArrowRight, Play, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ScrollSection from '@/components/dashboard/ScrollSection';

interface Course {
    id: string;
    slug?: string;
    title: string;
    thumbnail: string;
    instructor: string;
    price: string;
    rating: number;
    ratingCount: number;
    students: number;
    category: string;
    level: string;
}

interface DiscoverySectionProps {
    discovery: {
        state: string;
        recommendedCourses: Course[];
        trendingCourses: Course[];
        recentlyViewed: Course[];
        socialProof: {
            totalStudents: number;
            averageRating: number;
        };
    };
}

export default function DiscoverySection({ discovery }: DiscoverySectionProps) {
    const { state, recommendedCourses, trendingCourses, recentlyViewed, socialProof } = discovery;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <div className="space-y-20 pb-20 antialiased">
            {/* 1. Value Proposition Grid */}
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10"
                >
                <motion.div variants={item} className="bg-card/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border border-border/20 shadow-2xl flex flex-col items-center text-center group hover:border-primary/40 transition-all duration-700">
                    <div className="w-20 h-20 bg-primary/5 rounded-[28px] flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-inner">
                        <Users className="w-8 h-8" />
                    </div>
                    <div className="text-2xl sm:text-[36px] font-black text-primary tracking-tighter font-manrope">{(socialProof.totalStudents / 1000).toFixed(1)}K+</div>
                    <p className="text-[11px] font-black text-accent uppercase tracking-[0.2em] mt-3 font-inter">Active Evolvers</p>
                    <p className="text-[14px] font-medium text-primary/60 mt-5 leading-relaxed font-inter">Join a global network of elite professional talent mastering the future.</p>
                </motion.div>

                <motion.div variants={item} className="bg-primary p-8 sm:p-12 rounded-3xl sm:rounded-[56px] shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                    <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center mb-8 border border-white/10 backdrop-blur-md shadow-2xl group-hover:scale-110 transition-transform duration-700">
                        <Star className="w-8 h-8 text-accent fill-accent" />
                    </div>
                    <div className="text-2xl sm:text-[36px] font-black text-white tracking-tighter font-manrope">{socialProof.averageRating} / 5.0</div>
                    <p className="text-[11px] font-black text-accent uppercase tracking-[0.2em] mt-3 font-inter">Academic Excellence</p>
                    <p className="text-[14px] font-medium text-white/50 mt-5 leading-relaxed font-inter">Rigorous, peer-reviewed curriculum aligned with industry standards.</p>
                </motion.div>

                <motion.div variants={item} className="bg-card/60 backdrop-blur-xl p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border border-border/20 shadow-2xl flex flex-col items-center text-center group hover:border-primary/40 transition-all duration-700">
                    <div className="w-20 h-20 bg-primary/5 rounded-[28px] flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-inner">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <div className="text-2xl sm:text-[36px] font-black text-primary tracking-tighter font-manrope">Expert Labs</div>
                    <p className="text-[11px] font-black text-accent uppercase tracking-[0.2em] mt-3 font-inter">Live Implementation</p>
                    <p className="text-[14px] font-medium text-primary/60 mt-5 leading-relaxed font-inter">Daily workshops and specialized labs led by industry pioneers.</p>
                </motion.div>
            </motion.div>

            {/* 2. Personalized Recommendations */}
            {recommendedCourses.length > 0 && (
                <section className="space-y-12">
                    <div className="flex items-end justify-between border-b border-border/10 pb-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-accent" />
                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em]">Personalized For You</span>
                            </div>
                            <h2 className="text-4xl font-black text-primary tracking-tight font-manrope uppercase">
                                Curated <span className="text-accent">Specializations</span>
                            </h2>
                        </div>
                        <Link href="/courses" className="text-[11px] font-black text-primary uppercase tracking-[0.2em] hover:text-accent transition-all flex items-center gap-3 group">
                            VIEW FULL CATALOG <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
                        {recommendedCourses.map((course) => (
                            <DiscoveryCourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </section>
            )}

            {/* 3. Trending Courses */}
            <ScrollSection title="Trending Evolutions" badge="MOST_SOUGHT" subtitle="High-impact specializations trending in the network">
                {trendingCourses.map((course) => (
                    <DiscoveryCourseCard key={course.id} course={course} compact />
                ))}
            </ScrollSection>

            {/* 4. Experience Promo */}
            <div className="bg-primary rounded-[2.5rem] sm:rounded-[64px] p-6 sm:p-12 md:p-24 relative overflow-hidden border border-white/5 shadow-2xl group">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-20">
                    <div className="max-w-2xl space-y-10">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                            <Play className="w-3 h-3 text-accent fill-accent" />
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Experience Excellence</span>
                        </div>
                        <h3 className="text-3xl sm:text-5xl md:text-[64px] font-black text-white leading-[1.05] tracking-tighter font-manrope uppercase">
                          Experience A <span className="text-accent">Masterclass</span> Session
                        </h3>
                        <p className="text-[18px] font-medium text-white/50 leading-relaxed font-inter">
                            Unlock your potential with a preview of our elite curriculum. Experience the depth of our specialized methodology without commitment.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-8 pt-6">
                            <Link href="/courses" className="w-full sm:w-auto px-12 h-18 bg-accent text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-white hover:text-primary transition-all shadow-2xl shadow-accent/20 active:scale-95 font-manrope group">
                                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                                Start Preview
                            </Link>
                            <Link href="/about" className="text-white/60 font-black text-[12px] uppercase tracking-[0.2em] hover:text-white transition-all font-manrope">
                                OUR METHODOLOGY
                            </Link>
                        </div>
                    </div>
                    <div className="relative w-full lg:w-[540px] aspect-[16/10] rounded-3xl sm:rounded-[48px] overflow-hidden shadow-2xl group cursor-pointer border-8 border-white/5 backdrop-blur-3xl transition-transform duration-700 hover:scale-[1.02]">
                        <Image 
                            src={trendingCourses[0]?.thumbnail || "/og-course.jpg"} 
                            alt="Masterclass Preview" 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out"
                        />
                        <div className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 backdrop-blur-[2px]">
                             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl scale-90 group-hover:scale-100 transition-all duration-700">
                                <Play className="w-8 h-8 fill-current translate-x-1" />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DiscoveryCourseCard({ course, compact = false }: { course: Course; compact?: boolean }) {
    return (
        <motion.div 
            whileHover={{ y: -12 }}
            className={`bg-card/60 backdrop-blur-xl rounded-3xl sm:rounded-[48px] border border-border/20 overflow-hidden shadow-2xl hover:shadow-primary/10 hover:border-accent/40 transition-all duration-700 group flex flex-col h-full ${compact ? 'min-w-[360px]' : ''}`}
        >
            <div className={`relative ${compact ? 'h-56' : 'h-64'} w-full overflow-hidden`}>
                <Image 
                    src={course.thumbnail} 
                    alt={course.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out"
                    unoptimized
                />
                <div className="absolute top-6 left-6 inline-flex px-5 py-2 bg-white/90 backdrop-blur-xl rounded-2xl text-[10px] font-black text-primary uppercase tracking-[0.1em] border border-white/20 shadow-xl">
                    {course.category}
                </div>
                {!compact && (
                     <div className="absolute bottom-6 right-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/90 text-white backdrop-blur-xl rounded-full text-[12px] font-black shadow-2xl">
                        <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                        {course.rating.toFixed(1)}
                    </div>
                )}
            </div>
            
            <div className="p-6 sm:p-10 flex flex-col flex-1">
                <div className="space-y-3 mb-8">
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] font-inter">{course.instructor}</p>
                    <h4 className="text-[22px] font-black text-primary tracking-tight leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-accent transition-all duration-500 font-manrope uppercase">
                        {course.title}
                    </h4>
                </div>

                <div className="flex items-center gap-8 text-[11px] font-black text-primary/40 uppercase tracking-widest font-inter">
                    <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4" />
                        {course.students.toLocaleString()}+ Enrolled
                    </div>
                    <div className="px-3 py-1 bg-primary/5 rounded-lg border border-primary/5">{course.level}</div>
                </div>

                <div className="pt-10 flex items-center justify-between mt-auto border-t border-border/10">
                    <div className="text-3xl font-black text-primary tracking-tighter font-manrope">{course.price}</div>
                    <Link 
                        href={`/courses/${course.slug || course.id}`}
                        className="w-16 h-16 bg-primary/5 rounded-[24px] flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-700 active:scale-90 shadow-inner group/btn"
                    >
                        <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

