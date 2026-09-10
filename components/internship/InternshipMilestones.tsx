'use client';

import React from 'react';
import { Zap, Award, Crown } from 'lucide-react';

const TIERS = [
  {
    name: 'Alpha',
    icon: Zap,
    badgeColor: 'from-[#E6F4EA] to-[#CEEAD6] border-[#34A853]/35 text-[#16A34A]',
    glowColor: 'shadow-[0_8px_20px_rgba(52,168,83,0.15)]',
    desc: 'Unlock foundational project assignments, developer tools access, and mentor code reviews.',
  },
  {
    name: 'Beta',
    icon: Award,
    badgeColor: 'from-[#F3E8FF] to-[#E9D5FF] border-[#A855F7]/35 text-[#7C3AED]',
    glowColor: 'shadow-[0_8px_20px_rgba(168,85,247,0.15)]',
    desc: 'Unlocks upon completing first production pull request. Get official intern swag kit, priority mentor support, and verified project badges.',
  },
  {
    name: 'Gold',
    icon: Crown,
    badgeColor: 'from-[#FEF3C7] to-[#FDE68A] border-[#F59E0B]/35 text-[#D97706]',
    glowColor: 'shadow-[0_8px_20px_rgba(245,158,11,0.15)]',
    desc: 'Awarded to top performers. Unlock paid client project assignments, recommendation letters, and direct recruiter referrals.',
  },
];

export default function InternshipMilestones() {
  return (
    <section className="w-full bg-[#FCFBF8] border-t border-[#ECECEC] py-16 px-6 md:px-8 text-[#111111]">
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        
        {/* Left column */}
        <div className="lg:col-span-1 text-left">
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 text-[#111111]">
            Internship Program<br />
            <span className="text-[#16A34A]">+ Milestones</span>
          </h3>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
            Progress through three distinct milestones by completing build sprints and shipping quality code. Each tier unlocks additional career benefits.
          </p>
        </div>

        {/* Right column (3 badges) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div 
                key={tier.name} 
                className="bg-white border border-[#ECECEC] rounded-2xl p-6 text-left flex flex-col justify-between min-h-[240px] shadow-sm hover:shadow-md transition-all duration-355 hover:-translate-y-1 hover:border-[#16A34A]/25"
              >
                <div>
                  {/* High fidelity Badge Shield shape */}
                  <div className={`relative w-16 h-16 mb-6 flex items-center justify-center rounded-xl bg-gradient-to-br border ${tier.badgeColor} ${tier.glowColor}`}>
                    <Icon className="w-8 h-8 filter drop-shadow-sm" />
                    {/* Badge ribbon / border styling */}
                    <div className="absolute inset-0.5 rounded-lg border border-white/40 pointer-events-none" />
                  </div>
                  
                  <h4 className="font-bold text-[#111111] text-lg mb-2">{tier.name} Milestone</h4>
                  <p className="text-[#6B7280] text-xs leading-relaxed">{tier.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
