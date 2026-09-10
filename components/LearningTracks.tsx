'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Layers, Target, ChevronRight, MoveRight } from 'lucide-react';
import Link from 'next/link';

const TRACKS = [
  {
    id: 'finance',
    title: 'Finance & Taxation Elite',
    icon: <Target className="w-6 h-6" />,
    color: 'bg-emerald-500',
    description: 'Master the Indian taxation ecosystem from basic bookkeeping to professional GST filing.',
    steps: [
      { title: 'Excel Mastery', duration: '4 weeks', status: 'Core' },
      { title: 'GST Professional', duration: '16 weeks', status: 'Specialist' },
      { title: 'Tax Strategy', duration: '6 weeks', status: 'Excellence' }
    ]
  },
  {
    id: 'programming',
    title: 'Python Software Systems',
    icon: <Layers className="w-6 h-6" />,
    color: 'bg-orange-500',
    description: 'Transform from a script writer to a systems architect with our deep technical track.',
    steps: [
      { title: 'Python Fundamentals', duration: '6 weeks', status: 'Core' },
      { title: 'Backend Arch', duration: '10 weeks', status: 'Specialist' },
      { title: 'AI Implementation', duration: '16 weeks', status: 'Excellence' }
    ]
  }
];

export default function LearningTracks() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[3px] bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              Structured Journeys
            </span>
            <h2 className="text-[40px] md:text-[56px] font-black text-[#1A3C2E] leading-tight tracking-tighter uppercase font-outfit">
              Learning <span className="text-emerald-500">Tracks</span>
            </h2>
            <p className="text-xl text-[#5F6E5F] max-w-2xl font-medium">
              Don&apos;t just take courses. Follow a proven curriculum designed for industry excellence.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {TRACKS.map((track, idx) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#F8FDF9] rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-10 border border-[#E8E2D9] relative group hover:border-emerald-500/30 transition-all duration-500 shadow-sm"
            >
              <div className={`w-14 h-14 ${track.color} text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/10`}>
                {track.icon}
              </div>
              
              <h3 className="text-3xl font-black text-[#1A3C2E] mb-4 font-outfit uppercase">{track.title}</h3>
              <p className="text-[#5F6E5F] mb-10 font-medium leading-relaxed">{track.description}</p>
              
              <div className="space-y-4 mb-10">
                {track.steps.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-4 bg-white rounded-2xl p-3 sm:p-4 border border-[#E8E2D9] group-hover:border-emerald-100 transition-all">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black shrink-0">
                      {sIdx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] sm:text-sm font-bold text-[#1A3C2E] uppercase tracking-tight">{step.title}</p>
                      <p className="text-[10px] font-black text-[#5F6E5F]/60 uppercase tracking-widest">{step.duration} • {step.status}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>

              <Link href="/courses" className="flex items-center justify-center gap-3 w-full h-[52px] sm:h-16 bg-[#1A3C2E] text-white rounded-2xl font-bold text-[13px] uppercase tracking-[0.1em] hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
                Join Track <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Swipe Hint for Mobile */}
        <div className="flex lg:hidden items-center justify-center gap-2 mt-8 text-[#5D705C]/60">
            <span className="text-[10px] font-bold uppercase tracking-widest">Swipe for more tracks</span>
            <MoveRight className="w-4 h-4 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

