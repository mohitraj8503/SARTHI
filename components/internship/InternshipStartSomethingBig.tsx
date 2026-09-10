'use client';

import React from 'react';

const HIGHLIGHTS = [
  {
    num: '01',
    title: 'Work on Production Systems',
    desc: 'Contribute directly to live client projects, internal tech stacks, and real-world microservices with mentor guidance.',
  },
  {
    num: '02',
    title: 'Git-Based Submission & Code Reviews',
    desc: 'Sync code via GitHub/GitLab. Receive structured pull request reviews and constructive feedback from senior engineers.',
  },
  {
    num: '03',
    title: 'Direct Industry Mentor Syncs',
    desc: 'Get access to dedicated channels with lead developers, product managers, and mentors at SARTHI.',
  },
  {
    num: '04',
    title: 'Performance Stipends & Hiring Referral',
    desc: 'Top performers in each cohort unlock performance-based stipends, verified project credentials, and direct job referrals.',
  },
];

export default function InternshipStartSomethingBig() {
  return (
    <section className="py-24 px-6 md:px-8 bg-white border-t border-[#ECECEC]">
      <div className="container mx-auto max-w-[1500px]">
        
        {/* Full-width Editorial Header */}
        <div className="text-left mb-20 max-w-4xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A] block mb-4 select-none">
            The Opportunity
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1A3C2E] tracking-tight leading-[1.1] mb-6">
            Start something big.
          </h2>
          <p className="text-[#6B7280] text-sm md:text-base leading-relaxed max-w-3xl">
            We don&apos;t do passive video watching or dummy assignments. As a SARTHI Intern, you enter a real corporate simulation. You write clean code, solve production bugs, design user flows, and build a verified portfolio.
          </p>
        </div>

        {/* 2-Column Wide Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 pt-12 border-t border-[#ECECEC]">
          {HIGHLIGHTS.map((item) => (
            <div 
              key={item.num} 
              className="flex items-start gap-6 pb-6"
            >
              <span className="text-4xl font-light text-[#16A34A]/30 tracking-tight font-mono select-none">
                {item.num}
              </span>
              <div className="text-left">
                <h4 className="font-bold text-[#1A3C2E] text-lg mb-2 tracking-tight">
                  {item.title}
                </h4>
                <p className="text-[#6B7280] text-sm leading-relaxed">
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
