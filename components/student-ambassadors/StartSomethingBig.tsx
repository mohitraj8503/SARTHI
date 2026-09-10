'use client';

import React from 'react';

const HIGHLIGHTS = [
  {
    num: '01',
    title: 'Earn Global Certifications',
    desc: 'Access free prep paths and official vouchers for Cloud, AI, and Software Engineering. Stand out in tech recruitment.',
  },
  {
    num: '02',
    title: 'Build Campus Networks',
    desc: 'Host events and code labs. Gain confidence in public speaking, community building, and technical leadership.',
  },
  {
    num: '03',
    title: 'Direct Industry Mentor Channels',
    desc: 'Get direct Slack/Discord channels to senior developers, project coordinators, and mentors at SARTHI.',
  },
  {
    num: '04',
    title: 'Access Sponsored Budgets',
    desc: 'Get up to Rs. 5,000 sponsored budget per semester to host campus workshops, hackathons, and local meetups.',
  },
];

export default function StartSomethingBig() {
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
            We don&apos;t do generic workshops or copy-paste slide presentations. As a Student Ambassador, you are the technical hub of your campus. You build, you teach, you inspire, and you lead your cohort into the future of tech.
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
