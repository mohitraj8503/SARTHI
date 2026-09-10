'use client';

import React from 'react';
import { Activity, AlertTriangle, UserX, UserCheck, CalendarX, Award } from 'lucide-react';

const POLICIES = [
  {
    icon: Activity,
    title: 'Active Progress Logging',
    desc: 'Interns are expected to log progress and remain active on assigned tasks throughout the internship duration.',
    color: 'border-t-4 border-t-emerald-500',
  },
  {
    icon: AlertTriangle,
    title: '3-Day Warning Notice',
    desc: 'If an intern is inactive (no submissions, check-in, or notice) for 3 consecutive days, a formal warning notice is issued.',
    color: 'border-t-4 border-t-amber-500',
  },
  {
    icon: UserX,
    title: '4-Day Cohort Removal',
    desc: 'Inactivity for 4 consecutive days leads to cohort removal and forfeiture of the completion certificate regardless of prior progress.',
    color: 'border-t-4 border-t-red-500',
  },
  {
    icon: UserCheck,
    title: 'Approved Leave Request',
    desc: 'Genuine personal or medical issues must be notified to mentors in advance. Approved leaves do not count toward inactivity thresholds.',
    color: 'border-t-4 border-t-[#16A34A]',
  },
  {
    icon: CalendarX,
    title: 'Deadline & Milestone Impact',
    desc: 'Repeated missed deadlines may affect milestone eligibility (Alpha/Beta/Gold) and performance stipend considerations.',
    color: 'border-t-4 border-t-purple-500',
  },
  {
    icon: Award,
    title: 'Merit-Based Certification',
    desc: 'Final certification is contingent on completing all assigned deliverables to satisfactory standards, not attendance alone.',
    color: 'border-t-4 border-t-blue-500',
  },
];

export default function InternshipAttendancePolicy() {
  return (
    <section className="py-24 px-6 md:px-8 bg-white border-t border-[#ECECEC]">
      <div className="container mx-auto max-w-[1500px]">
        {/* Section Header */}
        <div className="text-left mb-12 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A] block mb-3 select-none">
            Cohort Rules
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1A3C2E] tracking-tight mb-4">
            Attendance & Certification Policy
          </h2>
          <p className="text-[#6B7280] text-sm md:text-base leading-relaxed">
            To maintain the credibility of the SARTHI Internship certificate, we require consistent participation throughout the cohort.
          </p>
        </div>

        {/* 6 Cards Grid (Matching Intern Resources Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POLICIES.map((pol) => {
            const Icon = pol.icon;
            return (
              <div
                key={pol.title}
                className={`bg-white border border-[#ECECEC] rounded-2xl p-6 text-left flex flex-col justify-between min-h-[220px] hover:shadow-md transition-all duration-300 ${pol.color}`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#FCFBF8] border border-[#ECECEC] flex items-center justify-center text-[#1A3C2E] mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#1A3C2E] text-base mb-2.5 tracking-tight">{pol.title}</h4>
                  <p className="text-[#6B7280] text-xs md:text-sm leading-relaxed">{pol.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
