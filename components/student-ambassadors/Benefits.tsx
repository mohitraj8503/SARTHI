'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Users, CheckCircle2 } from 'lucide-react';

const BENEFITS = [
  {
    icon: Users,
    title: 'Lead & Build Community',
    desc: 'Establish and run the official SARTHI hub on your campus. Organise bootcamps, workshops, and hackathons with our resources.',
    iconColor: 'text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]/20',
  },
  {
    icon: BookOpen,
    title: 'Accelerate Tech Growth',
    desc: 'Gain exclusive access to SARTHI courses, certification prep, and learning pathways. Learn directly from industry experts.',
    iconColor: 'text-[#EAB308] bg-[#EAB308]/10 border-[#EAB308]/20',
  },
  {
    icon: Award,
    title: 'Professional Mentorship',
    desc: 'Get direct 1-on-1 mentorship from senior software engineers, AI developers, and tech managers to launch your professional career.',
    iconColor: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20',
  },
];

const PERKS = [
  { name: 'Exclusive Ambassador Swag Kit', desc: 'Premium t-shirts, hoodies, stickers, and custom tech gear.' },
  { name: 'Official Experience Certificate', desc: 'A verified letter of recommendation and internship-equivalent certificate.' },
  { name: 'Networking Opportunities', desc: 'Access to a private Discord/Slack with fellow ambassadors globally.' },
  { name: 'Early Access & Beta Testing', desc: 'Try out new SARTHI platforms, APIs, and courses before anyone else.' },
  { name: 'LinkedIn & Resume Boost', desc: 'Showcase your official ambassador title with custom digital badges.' },
  { name: 'Fully Sponsored Events', desc: 'Budget support to host local campus meetups, workshops, and code labs.' },
];

export default function Benefits() {
  return (
    <section id="why-join" className="py-24 px-6 bg-white border-y border-[#ECECEC]">
      <div className="container mx-auto max-w-[1200px]">
        {/* Why Join Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#111111] tracking-tight mb-4">
            Why Become a Student{' '}
            <span className="text-[#16A34A]">
              Ambassador?
            </span>
          </h2>
          <p className="text-[#5D705C] text-lg max-w-2xl mx-auto">
            Take the leap from being just a student to a community builder. Gain the tools, prestige, and experience needed to stand out.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-[#FCFBF8] border border-[#ECECEC] rounded-3xl p-8 hover:border-[#16A34A]/50 hover:shadow-md transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 ${benefit.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#111111] mb-3 group-hover:text-[#16A34A] transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-[#6B7280] leading-relaxed text-sm">
                  {benefit.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* What You Get / Perks Section */}
        <div className="mt-12 bg-[#FCFBF8] border border-[#ECECEC] rounded-[32px] p-8 md:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">Exclusive Perks</span>
              <h3 className="text-3xl font-extrabold text-[#111111] mt-2 mb-4">
                What you&apos;ll get from the program
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                We believe in recognizing our leaders. Here are the rewards, resources, and benefits you will receive upon joining.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {PERKS.map((perk) => (
                <div key={perk.name} className="flex gap-4 p-4 rounded-2xl hover:bg-white border border-transparent hover:border-[#ECECEC] transition-all">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#111111] text-sm">{perk.name}</h4>
                    <p className="text-xs text-[#6B7280] mt-1">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
