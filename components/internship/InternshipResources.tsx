'use client';

import React from 'react';
import { Trophy, Compass, Library, Users, Award } from 'lucide-react';

const RESOURCES = [
  {
    icon: Trophy,
    title: 'Imagine Cup',
    desc: 'Compete in our premier global student hackathon. Build tech solutions to win cash prizes and mentorship.',
    color: 'border-t-4 border-t-cyan-500',
  },
  {
    icon: Compass,
    title: 'Intern Hub',
    desc: 'Access our central portal for intern profiles, project submissions, leaderboard status, and announcements.',
    color: 'border-t-4 border-t-purple-500',
  },
  {
    icon: Library,
    title: 'Learn Student Hub',
    desc: 'Explore free interactive modules, learning paths, and sandboxes on AI, Cloud, and Software Engineering.',
    color: 'border-t-4 border-t-yellow-500',
  },
  {
    icon: Users,
    title: 'Mentor Resources',
    desc: 'Guides, curricula, and slide decks to help mentors run sprints, review code, and support intern tracks.',
    color: 'border-t-4 border-t-teal-500',
  },
  {
    icon: Award,
    title: 'Certification Verification',
    desc: 'Verify official internship completion credentials, milestone badges, and performance letters on-chain.',
    color: 'border-t-4 border-t-emerald-500',
  },
];

export default function InternshipResources() {
  return (
    <section className="py-20 px-6 md:px-8 bg-[#FCFBF8] border-t border-[#ECECEC]">
      <div className="container mx-auto max-w-[1500px]">
        {/* Section Header */}
        <div className="text-left mb-12">
          <h3 className="text-2xl md:text-3xl font-extrabold text-[#111111] tracking-tight">
            Intern resources
          </h3>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {RESOURCES.map((res) => {
            const Icon = res.icon;
            return (
              <div
                key={res.title}
                className={`bg-white border border-[#ECECEC] rounded-2xl p-6 text-left flex flex-col justify-between min-h-[200px] hover:shadow-md transition-shadow ${res.color}`}
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-[#FCFBF8] border border-[#ECECEC] flex items-center justify-center text-[#111111] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#111111] text-base mb-2">{res.title}</h4>
                  <p className="text-[#6B7280] text-xs leading-relaxed">{res.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
