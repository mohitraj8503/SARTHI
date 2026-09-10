'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface InternshipHeroProps {
  onApplyClick: () => void;
}

export default function InternshipHero({ onApplyClick }: InternshipHeroProps) {
  return (
    <div className="w-full flex flex-col bg-[#FCFBF8]">
      {/* 1. Full-Width Hero Image Banner */}
      <section className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden">
        {/* Background photo of students collaborating */}
        <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
          <Image
            src="/images/student-ambassador-hero-v3.jpg"
            alt="Internship collaboration background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center blur-[6px] scale-[1.03]"
          />
        </div>

        {/* Premium Cinematic Overlays */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Overlaid Grid Content */}
        <div className="absolute inset-0 w-full h-full p-6 md:px-16 lg:px-24 pt-20 pb-8 flex items-center">
          <div className="max-w-[1500px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-20 z-10">
            
            {/* Left Column: Floating SARTHI Logo / Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.025, y: -5 }}
              className="lg:col-span-5 flex justify-center lg:justify-start items-center relative w-full cursor-pointer"
            >
              <div className="relative w-[340px] h-[340px] md:w-[460px] md:h-[460px] select-none pointer-events-none transition-all duration-300">
                <Image
                  src="/images/sarthi-intern-badge.png"
                  alt="SARTHI Intern Badge"
                  fill
                  priority
                  unoptimized
                  className="object-contain filter contrast-[1.05] brightness-[1.02] drop-shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                />
              </div>
            </motion.div>

            {/* Right Column: Headline */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="lg:col-span-7 text-left flex flex-col justify-center"
            >
              {/* Tagline Badge */}
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-white uppercase tracking-[0.2em] backdrop-blur-md mb-6 shadow-sm select-none w-fit">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                Real-World Build Experience
              </span>

              {/* Main Editorial Heading */}
              <h1 
                className="text-4xl md:text-[56px] font-extrabold text-white tracking-tight leading-[1.08] select-none"
                style={{ textShadow: '2px 2px 30px rgba(0,0,0,0.65)' }}
              >
                SARTHI<br />
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-350 bg-clip-text text-transparent">
                  Internship Portal
                </span>
              </h1>
              <p className="text-slate-200 text-sm md:text-base font-semibold mt-3 italic tracking-wide">
                &ldquo;Not just an internship. Your first real team.&rdquo;
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. Content Strip directly below the hero banner */}
      <section className="w-full bg-white border-y border-[#ECECEC] py-12 md:py-16 px-6 md:px-8 relative z-10 shadow-sm">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          {/* Left Column */}
          <div className="w-full md:w-[78%] text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/10 text-[10px] font-bold text-[#16A34A] uppercase tracking-wider mb-4 border border-[#16A34A]/15 select-none">
              Cohort 2026 · Applications Open
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A3C2E] mb-3 tracking-tight">
              Become a SARTHI Intern
            </h2>
            <p className="text-[#6B7280] text-sm md:text-base leading-relaxed">
              Join our 4-month cohort-based internship program. Work on real production-quality projects, get mentored by industry professionals, sync your progress via Git, and build a portfolio that actually gets you hired.
            </p>
            <p className="text-[#1A3C2E] text-xs md:text-sm font-semibold mt-3.5 italic">
              The moment you&apos;re selected, you&apos;re not an outsider learning from the sidelines — you&apos;re on the team, shipping real work alongside us.
            </p>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-[22%] flex justify-start md:justify-end items-center">
            <button
              onClick={() => onApplyClick()}
              className="group px-8 py-4 bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 hover:scale-102"
            >
              Apply Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
