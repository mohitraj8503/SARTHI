'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const FEATURED_EXAMS = [
  {
    title: 'Python Professional Developer',
    slug: 'python-professional-developer',
    level: 'EXPERT',
    duration: '45 Mins',
    imageUrl: '/thumbnails/python-professional-developer-new.png',
    partner: 'Henry Harvin',
    description: 'Recognition of advanced Python concurrency, memory optimization, OOP architecture, and production engineering practices.',
    feeText: '₹2000 certificate fee on passing',
  },
  {
    title: 'Cloud Fundamentals by Microsoft',
    slug: 'cloud-fundamentals-by-microsoft',
    level: 'BEGINNER',
    duration: '60 Mins',
    imageUrl: '/images/certifications/cloud-fundamentals-microsoft.png',
    partner: 'Microsoft',
    description: 'Master core cloud concepts, Microsoft Azure architecture, cloud security, compliance, identity, and governance standards.',
    feeText: '₹49 certificate fee on passing',
  },
  {
    title: 'Advanced Excel Certification Exam',
    slug: 'advanced-excel-certification-exam',
    level: 'ADVANCED',
    duration: '60 Mins',
    imageUrl: '/images/certifications/advanced-excel.png',
    partner: 'Henry Harvin',
    description: 'Master advanced Microsoft Excel methodologies, data modeling techniques, business forecasting, and dynamic dashboards.',
    feeText: '₹2000 certificate fee on passing',
  },
];

export default function CertificationSection() {
  return (
    <section className="pt-10 pb-14 lg:pt-14 lg:pb-20 bg-[#FCFBF8] border-t border-[#ECECEC]/60 relative overflow-hidden select-none">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[1536px] relative z-10">
        
        {/* Header Row */}
        <div className="flex justify-between items-center mb-8 border-b border-[#ECECEC]/40 pb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-4 h-[1.5px] bg-[#16A34A]"></span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#16A34A]">
                Industry Assessments
              </span>
            </div>
            <h2 className="text-[26px] md:text-[36px] font-extrabold text-[#111111] tracking-tight leading-none font-outfit">
              Featured Certifications
            </h2>
          </div>

          <Link href="/certification-exams" className="group shrink-0">
            <div className="px-4 py-2 bg-white border border-[#ECECEC] rounded-full text-[11px] font-bold uppercase tracking-wider text-[#111111] shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.04)] flex items-center gap-1.5 transition-shadow duration-300 cursor-pointer">
              <span>View All Certifications</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
          </Link>
        </div>

        {/* 3 Certification Exam Cards - Enhanced Height (min-h-[510px]) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_EXAMS.map((cert, index) => (
            <motion.div
              key={cert.slug}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1 relative min-h-[490px] sm:min-h-[520px] lg:min-h-[535px] h-full"
            >
              <div>
                {/* Thumbnail Container - Increased Height Aspect Ratio (16/10) */}
                <div className="aspect-[16/10] rounded-xl overflow-hidden relative shrink-0 bg-slate-900 border border-slate-100 shadow-xs mb-5">
                  <Image
                    src={cert.imageUrl}
                    alt={cert.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={index < 2}
                    unoptimized={true}
                  />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-md border border-white/10">
                      {cert.level}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/75 backdrop-blur-md text-white text-[10px] font-semibold rounded-md border border-white/10">
                      <Clock className="w-3 h-3 text-[#E8B84B]" />
                      {cert.duration}
                    </span>
                  </div>
                </div>

                {/* Level / Award Tag */}
                <div className="mb-2.5 flex items-center gap-1.5 text-[#16A34A]">
                  <Award className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                    Verified Assessment
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-[19px] font-bold text-slate-900 mb-2.5 leading-snug tracking-tight group-hover:text-[#16A34A] transition-colors">
                  {cert.title}
                </h3>

                {/* Description - Extended to 3 lines for generous vertical fill */}
                <p className="text-[13px] text-slate-600 font-medium leading-relaxed line-clamp-3 mb-6">
                  {cert.description}
                </p>
              </div>

              <div>
                {/* Partner Accreditation Strip */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-violet-700 font-bold text-[11px] uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 rounded-full bg-violet-600" />
                  Support & Certified by {cert.partner}
                </div>

                {/* Bottom Row: Free Exam Fee & Button */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#16A34A] uppercase tracking-wider">
                      FREE EXAMINATION
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      {cert.feeText}
                    </span>
                  </div>

                  <Link
                    href={`/certification-exams/${cert.slug}`}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm group-hover:scale-105 active:scale-95 shrink-0"
                  >
                    Take Exam
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
