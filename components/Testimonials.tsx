'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const STORIES = [
  {
    name: 'Arpit',
    role: 'Artificial Intelligence & Machine Learning Intern',
    college: 'IILM University, Greater Noida',
    avatar: '/testimonials/arpit.jpg',
    filter: 'brightness-[1.05] contrast-[1.02]',
    position: 'object-[center_28%]',
    quote: "Practical skills I use every single day at work. Best investment I've made for my career.",
    courses: ['AI & ML', 'Python Dev'],
    rating: 5,
  },
  {
    name: 'Jaanvi Nair',
    role: 'Rising Digital Marketing Intern',
    college: 'SIES College of Arts, Science & Commerce, Mumbai',
    avatar: '/testimonials/janvinayar.jpg',
    filter: 'brightness-[1.0] contrast-[1.0]',
    position: 'object-[center_20%]',
    quote: "Valuable guidance helped me gain practical skills, real-world experience, and clear career path clarity.",
    courses: ['Digital Marketing', 'Content Strategy'],
    rating: 5,
  },
  {
    name: 'Nandini Katiyar',
    role: 'Digital Marketing & Social Media Intern',
    college: 'PSIT College of Higher Education, Kanpur',
    avatar: '/testimonials/nandini.png',
    bgGradient: 'bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB]',
    filter: 'brightness-[1.0] contrast-[1.0]',
    position: 'object-[center_12%]',
    quote: "The campaigns and live strategies at SARTHI gave me real expertise that classrooms don't teach. High value experience.",
    courses: ['Digital Marketing', 'Social Media'],
    rating: 5,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
});

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Testimonials() {
  return (
    <section className="relative py-16 lg:py-24 bg-[#F8FAFC] border-t border-b border-slate-200/80 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-screen-xl relative z-10">
        {/* ── 1. Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 lg:mb-16">
          <motion.div {...fade(0)} className="max-w-2xl">
            {/* Minimal Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] lg:text-[12px] font-extrabold tracking-wider uppercase mb-4 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Learner Testimonials</span>
            </div>

            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
              Shaping Careers.<br />
              <span className="text-[#10B981]">
                Building Real Expertise.
              </span>
            </h2>

            <p className="text-[15px] sm:text-[16.5px] text-slate-600 leading-relaxed max-w-xl font-medium">
              Hear from our alumni who transitioned from baseline learning to launching production-grade industry solutions and building impactful careers.
            </p>
          </motion.div>
        </div>

        {/* ── 2. Testimonials Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STORIES.map((s, i) => (
            <motion.div
              key={s.name}
              {...fade(0.1 + i * 0.08)}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden group"
            >
              {/* Subtle top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 z-20" />

              {/* Cover Image */}
              <div className={`relative w-full aspect-[16/9] overflow-hidden ${(s as any).bgGradient || 'bg-slate-100'} border-b border-slate-100`}>
                <Image
                  src={s.avatar}
                  alt={s.name}
                  fill
                  className={`object-cover ${s.position || 'object-center'} ${s.filter || ''} transition-transform duration-500 group-hover:scale-105`}
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col justify-between gap-4 flex-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="text-[15.5px] font-extrabold text-slate-900 truncate">{s.name}</p>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM10.97 15.707L7.293 12.03L8.707 10.616L10.97 12.879L15.293 8.556L16.707 9.97L10.97 15.707Z" fill="#0EA5E9"/>
                      </svg>
                    </div>
                    <Stars n={s.rating} />
                  </div>

                  <p className="text-[12px] font-medium text-slate-500 leading-snug line-clamp-2">{s.role}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {s.courses.map(c => (
                      <span key={c} className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-0.5" />

                <div className="space-y-2">
                  {s.college && (
                    <span className="inline-block text-[10.5px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                      {s.college}
                    </span>
                  )}
                  <blockquote className="text-[13.5px] text-slate-700 leading-relaxed italic font-normal">
                    &ldquo;{s.quote}&rdquo;
                  </blockquote>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
