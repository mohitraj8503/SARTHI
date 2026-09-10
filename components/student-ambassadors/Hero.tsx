'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onApplyClick: () => void;
}

export default function Hero({ onApplyClick }: HeroProps) {
  return (
    <div className="w-full flex flex-col bg-[#FCFBF8]">
      {/* 1. Full-Width Hero Image Banner */}
      <section className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden">
        {/* Background photo of students collaborating */}
        <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
          <Image
            src="/images/student-ambassador-hero-v3.jpg"
            alt="Campus student collaboration background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center blur-[6px] scale-[1.03]"
          />
        </div>

        {/* Premium Cinematic Overlays (Optimized for Brightness & Text Legibility) */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Overlaid Grid Content (Logo on Left, Heading on Right - Perfectly Centered & Balanced) */}
        <div className="absolute inset-0 w-full h-full p-6 md:px-16 lg:px-24 pt-20 pb-8 flex items-center">
          <div className="max-w-[1500px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-20 z-10">
            
            {/* Left Column: Floating PNG Overlay Graphic (5/12 grid span) with interactive hover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.025, y: -5 }}
              className="lg:col-span-5 flex justify-center lg:justify-start items-center relative w-full cursor-pointer"
            >
              <div className="relative w-[320px] h-[320px] md:w-[440px] md:h-[440px] select-none pointer-events-none transition-all duration-300">
                <Image
                  src="/images/student-ambassador-overlay-v4.png"
                  alt="Student Ambassador Custom Overlay Graphic"
                  fill
                  priority
                  unoptimized
                  className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.55)] hover:drop-shadow-[0_25px_60px_rgba(22,163,74,0.3)]"
                />
              </div>
            </motion.div>

            {/* Right Column: Headline (7/12 grid span) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="lg:col-span-7 text-left flex flex-col justify-center"
            >
              {/* Tagline Badge */}
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-white uppercase tracking-[0.2em] backdrop-blur-md mb-6 shadow-sm select-none w-fit">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                Empowering Campus Leaders
              </span>

              {/* Main Editorial Heading */}
              <h1 
                className="text-4xl md:text-[56px] font-extrabold text-white tracking-tight leading-[1.08] select-none"
                style={{ textShadow: '2px 2px 30px rgba(0,0,0,0.65)' }}
              >
                SARTHI<br />
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-350 bg-clip-text text-transparent">
                  Student Ambassadors
                </span>
              </h1>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. Content Strip directly below the hero banner (Light Mode) */}
      <section className="w-full bg-white border-y border-[#ECECEC] py-12 md:py-16 px-6 md:px-8 relative z-10 shadow-sm">
        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          {/* Left Column (78% width) */}
          <div className="w-full md:w-[78%] text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/10 text-[10px] font-bold text-[#16A34A] uppercase tracking-wider mb-4 border border-[#16A34A]/15 select-none">
              Cohort 2026 Active
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A3C2E] mb-3 tracking-tight">
              Become a Student Ambassador
            </h2>
            <p className="text-[#6B7280] text-sm md:text-base leading-relaxed">
              Join a global community of students exploring what&apos;s possible with SARTHI. Build practical skills, lead tech programs, and establish your leadership brand before graduation.
            </p>
          </div>

          {/* Right Column (22% width, right-aligned) */}
          <div className="w-full md:w-[22%] flex justify-start md:justify-end items-center">
            <button
              onClick={onApplyClick}
              className="group px-8 py-4 bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 hover:scale-102"
            >
              Get Started <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
