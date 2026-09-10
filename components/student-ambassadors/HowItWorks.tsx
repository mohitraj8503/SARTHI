'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, FileInput, Laptop, Star, Award, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    icon: FileInput,
    title: '1. Online Application',
    desc: 'Fill out the application form with your details, social links, resume, and express your motivation to lead.',
  },
  {
    icon: UserCheck,
    title: '2. Review & Interview',
    desc: 'Our community coordinators will review your submission and schedule a short virtual interview with shortlisted candidates.',
  },
  {
    icon: Laptop,
    title: '3. Onboarding & Training',
    desc: 'Get access to official ambassador dashboard, marketing collateral, event guides, and exclusive peer community.',
  },
  {
    icon: Star,
    title: '4. Start Contributing',
    desc: 'Begin hosting workshops, representing SARTHI at campus events, and earning monthly rewards.',
  },
];

const ELIGIBILITY = [
  'Must be currently enrolled in an undergraduate or postgraduate program at a registered university.',
  'Passionate about technology, programming, design, writing, or community leading.',
  'Eager to learn, collaborate, and help peers build real-world skills.',
  'Prior experience organising college club events or leading campus projects is a plus, but not required.',
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-[#FCFBF8] relative">
      <div className="container mx-auto max-w-[1200px]">
        {/* Eligibility Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-28">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">Eligibility</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#111111] tracking-tight mt-2 mb-6">
              Who Can Join the{' '}
              <span className="text-[#16A34A]">
                Ambassador Network?
              </span>
            </h2>
            <p className="text-[#6B7280] text-sm md:text-base leading-relaxed mb-8">
              We look for passionate students who want to bridge the gap between academic theory and real-world software engineering practice.
            </p>
            <div className="space-y-4">
              {ELIGIBILITY.map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <CheckCircle className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                  <p className="text-[#4B5563] text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="relative bg-white border border-[#ECECEC] p-8 rounded-3xl max-w-md w-full shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-[#111111] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#EAB308]" />
                Ideal Profiles We Seek:
              </h3>
              <ul className="space-y-3 text-sm text-[#4B5563] list-disc list-inside">
                <li>Undergraduate CS/IT/Engineering students</li>
                <li>Hobbyist programmers or design enthusiasts</li>
                <li>Dynamic speakers and club volunteers</li>
                <li>Content writers or technical bloggers</li>
              </ul>
              <div className="mt-8 pt-6 border-t border-[#ECECEC] text-center">
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Applications Close Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline / How it works */}
        <div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111111] tracking-tight mb-4">
              Timeline & Recruitment{' '}
              <span className="text-[#16A34A]">
                Process
              </span>
            </h2>
            <p className="text-[#6B7280] text-sm md:text-base max-w-xl mx-auto">
              A transparent, straightforward timeline from submitting your online application to leading your first workshop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white border border-[#ECECEC] rounded-2xl p-6 relative hover:border-[#16A34A]/55 transition-all shadow-sm"
                >
                  {/* Step icon */}
                  <div className="w-10 h-10 rounded-xl bg-[#FCFBF8] border border-[#ECECEC] flex items-center justify-center text-[#16A34A] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#111111] mb-2">{step.title}</h4>
                  <p className="text-[#6B7280] text-xs leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
