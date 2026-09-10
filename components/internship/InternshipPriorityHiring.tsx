'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, ArrowRight } from 'lucide-react';

export default function InternshipPriorityHiring() {
  const CHIPS = [
    'Digital Marketing & Growth',
    'Advertising & Ad Campaigns',
    'Poster & Graphic Design',
    'Video Editing & Reels',
    'Content & Copywriting',
  ];

  return (
    <section className="w-full bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-y border-amber-500/20 py-12 px-6 md:px-8 text-[#111111] relative overflow-hidden">
      <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        
        {/* Left Column: Copy & Badges */}
        <div className="w-full md:w-[75%] text-left space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-[10px] font-black text-amber-700 uppercase tracking-widest border border-amber-500/20 shadow-sm select-none">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" /> URGENTLY HIRING
          </span>

          <h2 className="text-2xl md:text-3.5xl font-extrabold text-[#1A3C2E] tracking-tight">
            We need active marketers & advertisers, not just engineers.
          </h2>

          <p className="text-[#4B5563] text-sm md:text-base leading-relaxed font-medium max-w-4xl">
            We&apos;ve built strong engineering talent — now we&apos;re heavily expanding our growth and marketing engine. If you can run ad campaigns, design high-converting ad visuals, edit viral reels, or execute growth marketing strategies, we have priority tracks built for you. Digital marketers, active advertisers, poster designers, video editors, and growth strategists are in highest demand this cohort.
          </p>

          <p className="text-[#1A3C2E] text-xs md:text-sm font-semibold italic pt-1">
            If this sounds like you, we&apos;re not just hiring — we&apos;re already making room for you.
          </p>

          {/* 5 Compact Priority Track Chips */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {CHIPS.map((chip) => (
              <span 
                key={chip}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-200/80 text-xs font-bold text-[#1A3C2E] shadow-sm flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: CTA */}
        <div className="w-full md:w-[25%] flex justify-start md:justify-end items-center shrink-0 pt-2 md:pt-0">
          <Link
            href="/internship/apply?track=content-marketing"
            className="group w-full md:w-auto px-7 py-4 bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 text-center"
          >
            Apply for a Content/Marketing Track
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        </div>

      </div>
    </section>
  );
}
