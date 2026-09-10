'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const INDUCTION_PROGRAMMES = [
    {
        id: 'project-submission',
        title: 'Upload Your Project',
        category: 'Featured Challenge',
        duration: 'Ongoing',
        rating: '5.0',
        students: 'Showcase',
        thumbnail: '/images/induction/upload-project.png',
        description: 'Turn your idea into recognition. Submit your real project, get evaluated by experts, and unlock opportunities.',
        href: '/internship/upload-project',
        cta: 'Submit Project'
    },
    {
        id: 'face-detection',
        title: 'Real-Time Face Detection & Behavior Analysis',
        category: 'Computer Vision',
        duration: '4 Weeks',
        rating: '4.9',
        students: '240+',
        thumbnail: '/images/induction/face-detection.png',
        description: 'Build production-ready facial recognition systems using Python and OpenCV.',
        href: '/internship/face-detection'
    },
    {
        id: 'spark-program',
        title: 'SARTHI Creator Programme',
        category: 'Creative & Research',
        duration: '12 Weeks',
        rating: '5.0',
        students: 'Join Now',
        thumbnail: '/images/induction/creator-programme.png',
        description: 'Join our elite creator track. Master tech videography and research to earn your Internship Badge.',
        href: '/internship/spark-program'
    }
];

export default function InductionGrid() {
    return (
        <section className="py-10 lg:py-28 bg-white overflow-visible">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
                <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-24 relative">
                    <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-24 h-24 bg-[#2D6A4F]/5 rounded-full blur-3xl"></div>

                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="w-10 h-[2px] bg-[#2D6A4F]/30"></span>
                        <span className="text-xs font-extrabold text-[#2D6A4F] uppercase tracking-[0.3em]">
                            Getting Started
                        </span>
                        <span className="w-10 h-[2px] bg-[#2D6A4F]/30"></span>
                    </div>

                    <h2 className="text-[22px] lg:text-[64px] font-bold text-[#1A3C2E] tracking-tight leading-[1.2] lg:leading-[1.05] mb-6 lg:mb-8 uppercase italic font-outfit">
                        Internship Programs
                    </h2>

                    <p className="text-[#5F6E5F] font-medium text-[15px] lg:text-xl leading-relaxed mb-8 lg:mb-10">
                        Master the skills that matter. Join our premium internship tracks designed to make you industry-ready from day one.
                    </p>

                    <Link href="/internship" className="inline-flex items-center gap-2.5 text-[#2D6A4F] font-bold text-xs uppercase tracking-[0.2em] hover:text-[#1A3C2E] transition-all group px-8 py-4 bg-[#2D6A4F]/5 rounded-full hover:bg-[#2D6A4F]/10">
                        <span>View All Tracks</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-12 mx-auto">
                    {INDUCTION_PROGRAMMES.map((prog, idx) => {
                        const isFeatured = idx === 0;
                        const cardBase = "bg-white rounded-[24px] overflow-hidden group flex flex-col h-full relative transition-all duration-500 will-change-transform active:scale-[0.99]";
                        const cardSpecial = isFeatured
                            ? "ring-1 ring-[#2D6A4F]/20 shadow-[0_30px_60px_-15px_rgba(45,106,79,0.15)] z-10 hover:shadow-[0_40px_80px_-15px_rgba(45,106,79,0.25)]"
                            : "ring-1 ring-black/[0.03] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:ring-[#2D6A4F]/20 hover:shadow-[0_20px_40px_-15px_rgba(26,60,46,0.12)] hover:-translate-y-[6px]";

                        return (
                            <motion.div
                                key={prog.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0
                                }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.6,
                                    delay: idx * 0.1,
                                    ease: [0.21, 0.47, 0.32, 0.98]
                                }}
                                className={cn(cardBase, cardSpecial, "gpu-accelerated")}
                            >
                                <Link href={prog.href} className="block aspect-[16/10] relative overflow-hidden shrink-0 bg-white cursor-pointer">
                                    <Image
                                        src={prog.thumbnail}
                                        alt={prog.title}
                                        fill
                                        quality={85}
                                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20">
                                        <div className="bg-white/95 backdrop-blur-sm text-[#1A3C2E] px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            Join Program
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-5 lg:p-8 flex flex-col flex-1 relative z-10 bg-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 bg-[#FDF6E3] border border-[#E8B84B]/20 px-2 py-0.5 rounded text-[#B8860B]">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span className="text-[11px] font-bold">{prog.rating}</span>
                                            </div>
                                            <span className="text-[10px] font-medium text-[#5D705C]">
                                                {prog.students.includes('+') ? `(${prog.students} enrolled)` : prog.students}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#40916C]">
                                            <Zap className="w-3.5 h-3.5 fill-current" />
                                            {prog.category}
                                        </div>
                                    </div>

                                    <Link href={prog.href}>
                                        <h3 className="text-2xl font-bold text-[#1A3C2E] tracking-tight mb-3 hover:text-[#2D6A4F] transition-colors leading-[1.25]">
                                            {prog.title}
                                        </h3>
                                    </Link>

                                    <p className="text-sm text-[#5F6E5F] leading-relaxed mb-8 line-clamp-2">
                                        {prog.description}
                                    </p>

                                    <div className="pt-6 border-t border-black/[0.04] flex items-center justify-between gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1">Duration</span>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4 text-[#40916C]" />
                                                <span className="text-sm font-black text-[#1A3C2E]">{prog.duration}</span>
                                            </div>
                                        </div>

                                        <Link href={prog.href} className="flex-1">
                                            <div className="shrink-0 flex items-center justify-center gap-2 px-6 h-12 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300 bg-[#1A3C2E] text-white hover:bg-[#2D6A4F] shadow-lg active:scale-95">
                                                {(prog as any).cta || 'Enroll Now'}
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
