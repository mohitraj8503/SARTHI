'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface InternshipWhatToExpectProps {
  onApplyClick: () => void;
}

const TIMELINE = [
  {
    phase: 'Month 01',
    title: 'Onboarding & Track Alignment',
    desc: 'Enter the cohort, receive your intern dashboard access, match with your assigned mentor, and review your project roadmap.',
  },
  {
    phase: 'Month 02 - 03',
    title: 'Sprint Execution & Code Reviews',
    desc: 'Work on assigned modules, submit weekly progress via Git, receive detailed code reviews, and participate in mentor syncs.',
  },
  {
    phase: 'Month 04',
    title: 'Evaluation & Milestone Elevation',
    desc: 'Present your final project, unlock official internship credentials, gain placement referral status, and showcase your work.',
  },
];

export default function InternshipWhatToExpect({ onApplyClick }: InternshipWhatToExpectProps) {
  return (
    <section className="py-24 px-6 md:px-8 bg-white border-t border-[#ECECEC]">
      <div className="container mx-auto max-w-[1500px]">
        
        {/* Full-width Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
          <div className="text-left max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A] block mb-4 select-none">
              The Journey
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1A3C2E] tracking-tight leading-[1.1] mb-6">
              What to expect.
            </h2>
            <p className="text-[#6B7280] text-sm md:text-base leading-relaxed">
              We look for students with high initiative and potential. Once selected, you enter a structured progression path designed to accelerate both your technical depth and professional execution.
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <p className="text-xs font-semibold italic text-[#1A3C2E]">
              Your seat on the team is one application away.
            </p>
            <button
              onClick={onApplyClick}
              className="group px-8 py-3.5 bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 flex-shrink-0"
            >
              Apply Now <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 3-Column Wide Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-[#ECECEC]">
          {TIMELINE.map((item) => (
            <div 
              key={item.phase} 
              className="flex flex-col items-start gap-4 p-8 rounded-2xl bg-[#FCFBF8] border border-[#ECECEC] hover:border-[#16A34A]/25 transition-all duration-300 text-left shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-sm"
            >
              <span className="inline-flex px-3 py-1.5 rounded-xl bg-white border border-[#ECECEC] text-[11px] font-bold text-[#16A34A] tracking-wider uppercase font-mono select-none">
                {item.phase}
              </span>
              <div>
                <h4 className="font-bold text-[#1A3C2E] text-base mb-2 tracking-tight">
                  {item.title}
                </h4>
                <p className="text-[#6B7280] text-xs md:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
