'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, UserCheck, FolderCode, Award, Gift, ShieldAlert, FileText } from 'lucide-react';

const TERMS = [
  {
    icon: ShieldCheck,
    num: '01',
    title: 'Merit-Based Selection',
    desc: 'Selection into the SARTHI Internship Program is subject to technical/content review and is non-guaranteed.',
    color: 'border-t-4 border-t-cyan-500',
  },
  {
    icon: UserCheck,
    num: '02',
    title: 'Professional Conduct',
    desc: 'Interns must maintain professional conduct in all mentor communications, code reviews, and community channels.',
    color: 'border-t-4 border-t-purple-500',
  },
  {
    icon: FolderCode,
    num: '03',
    title: 'Portfolio Rights',
    desc: 'Submitted project work may be showcased by SARTHI for internal review, benchmarking, and portfolio highlights.',
    color: 'border-t-4 border-t-yellow-500',
  },
  {
    icon: Award,
    num: '04',
    title: 'Certificate Eligibility',
    desc: 'Certificates are issued only upon satisfying both attendance rules and minimum deliverable standards set by mentors.',
    color: 'border-t-4 border-t-teal-500',
  },
  {
    icon: Gift,
    num: '05',
    title: 'Stipends & Referral Rewards',
    desc: 'Stipends, swag kits, and recruiter referrals are awarded at sole discretion based on milestone achievements.',
    color: 'border-t-4 border-t-emerald-500',
  },
  {
    icon: ShieldAlert,
    num: '06',
    title: 'Code of Conduct Enforcement',
    desc: 'SARTHI reserves the right to offboard any intern for plagiarism, misconduct, or repeated policy violations.',
    color: 'border-t-4 border-t-red-500',
  },
];

export default function InternshipTerms() {
  return (
    <section className="py-24 px-6 md:px-8 bg-[#FCFBF8] border-t border-[#ECECEC]">
      <div className="container mx-auto max-w-[1500px]">
        {/* Section Header */}
        <div className="text-left mb-12 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A] block mb-3 select-none">
            Program Guidelines
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1A3C2E] tracking-tight mb-4">
            Terms & Conditions
          </h2>
          <p className="text-[#6B7280] text-sm md:text-base leading-relaxed">
            Please read our standard program terms. By applying, candidates agree to these guidelines alongside our site policies.
          </p>
        </div>

        {/* 6 Cards Grid (Matching Intern Resources Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TERMS.map((term) => {
            const Icon = term.icon;
            return (
              <div
                key={term.title}
                className={`bg-white border border-[#ECECEC] rounded-2xl p-6 text-left flex flex-col justify-between min-h-[220px] hover:shadow-md transition-all duration-300 ${term.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#FCFBF8] border border-[#ECECEC] flex items-center justify-center text-[#1A3C2E]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#16A34A] px-2.5 py-1 bg-[#16A34A]/10 rounded-lg">
                      {term.num}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#1A3C2E] text-base mb-2.5 tracking-tight">{term.title}</h4>
                  <p className="text-[#6B7280] text-xs md:text-sm leading-relaxed">{term.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Policy Link Card */}
        <div className="mt-8 p-6 bg-white border border-[#ECECEC] rounded-2xl text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs md:text-sm text-[#4B5563]">
            <FileText className="w-5 h-5 text-[#16A34A] shrink-0" />
            <span>
              By applying, candidates agree to SARTHI&apos;s standard{' '}
              <Link href="/terms" className="text-[#16A34A] font-bold underline hover:text-[#15803D]">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#16A34A] font-bold underline hover:text-[#15803D]">
                Privacy Policy
              </Link>.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
