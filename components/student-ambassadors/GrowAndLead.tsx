'use client';

import React from 'react';

const TRACKS = [
  {
    tag: 'Technical Mastery',
    title: 'Grow technical depth',
    desc: 'Deep dive into full-stack development, cloud pipelines, and AI engineering. Gain sandbox environments and direct assistance from SARTHI engineers to master modern tech.',
  },
  {
    tag: 'Leadership & Brand',
    title: 'Build your public profile',
    desc: 'Present at seminars, organize campus coding labs, and collaborate with student networks. Gain confidence, visibility, and a distinct professional network.',
  },
  {
    tag: 'Local Impact',
    title: 'Make a campus footprint',
    desc: 'Bridge the gap between theoretical syllabus and modern production code. Run hackathons, mentor juniors, and create a lasting engineering community on campus.',
  },
];

export default function GrowAndLead() {
  return (
    <section className="py-24 px-6 md:px-8 bg-[#FCFBF8] border-t border-[#ECECEC]">
      <div className="container mx-auto max-w-[1500px]">
        {/* Section Header */}
        <div className="text-left mb-16 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A] block mb-3">
            Your Growth
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1A3C2E] tracking-tight leading-[1.1] mb-4">
            Grow and lead
          </h2>
          <p className="text-[#6B7280] text-sm md:text-base leading-relaxed">
            Expand your practical skillset, lead a cohort of developers, and establish your professional brand before you graduate.
          </p>
        </div>

        {/* Asymmetrical 3-Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {TRACKS.map((track, idx) => (
            <div 
              key={track.title} 
              className={`bg-white border border-[#ECECEC] rounded-[24px] p-8 flex flex-col justify-between h-full text-left shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-md hover:border-[#16A34A]/30 ${
                idx === 1 ? 'md:-translate-y-2 border-[#16A34A]/10 shadow-[0_8px_30px_rgba(0,0,0,0.03)]' : ''
              }`}
            >
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#FCFBF8] border border-[#ECECEC] text-[10px] font-bold text-[#16A34A] uppercase tracking-wider mb-6">
                  {track.tag}
                </span>
                <h4 className="font-bold text-[#1A3C2E] text-xl mb-4 tracking-tight">
                  {track.title}
                </h4>
                <p className="text-[#6B7280] text-sm leading-relaxed">
                  {track.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
