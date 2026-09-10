'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, 
  ChevronRight,
  ArrowRight,
  Monitor,
  Cpu,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INDUCTION_PROGRAMMES = [
  {
    id: 'face-detection',
    title: 'Real-Time Face Detection',
    subtitle: 'Build Live Systems that See',
    description: 'Master computer vision with our premium Python internship programme. Learn to process high-speed video streams and identify faces in milliseconds.',
    image: '/images/programmes/face-detection.jpg',
    color: 'emerald',
    href: '/internship/face-detection',
    badge: 'Limited Intake',
    stats: '240+ students'
  }
];

export default function InductionShowcase() {
  const [activeTab, setActiveTab] = useState(INDUCTION_PROGRAMMES[0]);

  return (
    <section className="py-24 bg-[#F5F0E8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header with Tabs */}
        <div className="flex flex-col items-center mb-16 space-y-8">
          <div className="text-center space-y-3">
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A3C2E]/5 border border-[#1A3C2E]/10 rounded-full text-[#1A3C2E] text-[10px] font-black uppercase tracking-[0.3em]"
             >
               <Cpu className="w-3.5 h-3.5" />
               Technical Induction 2026
             </motion.div>
             <h2 className="text-4xl lg:text-5xl font-black text-[#1A3C2E] tracking-tighter">
               Choose Your <span className="italic">Specialization</span>
             </h2>
          </div>

          {/* Premium Tabs */}
          <div className="flex p-1.5 bg-white/50 backdrop-blur-md rounded-2xl border border-[#1A3C2E]/5 shadow-sm">
            {INDUCTION_PROGRAMMES.map((prog) => (
              <button
                key={prog.id}
                onClick={() => setActiveTab(prog)}
                className={cn(
                  "relative px-6 py-3 text-sm font-bold transition-all duration-300 rounded-xl",
                  activeTab.id === prog.id 
                    ? "text-white" 
                    : "text-[#1A3C2E]/60 hover:text-[#1A3C2E]"
                )}
              >
                {activeTab.id === prog.id && (
                  <motion.div 
                    layoutId="activeTabBackground"
                    className={cn(
                      "absolute inset-0 rounded-xl shadow-lg",
                      prog.color === 'emerald' ? "bg-emerald-600" : "bg-blue-600"
                    )}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{prog.title}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab.id}
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className={cn(
              "relative p-[1px] rounded-[42px] overflow-hidden group transition-colors duration-500",
              activeTab.color === 'emerald' 
                ? "bg-gradient-to-br from-emerald-500/30 via-slate-500/10 to-emerald-500/30" 
                : "bg-gradient-to-br from-blue-500/30 via-slate-500/10 to-blue-500/30"
            )}>
              <div className="bg-[#0A0A0C] rounded-[40px] overflow-hidden shadow-2xl">
                <div className="grid lg:grid-cols-12 gap-0 items-stretch">
                  
                  {/* Image Side */}
                  <div className="lg:col-span-7 relative min-h-[350px] lg:min-h-[500px]">
                    <Image 
                      src={activeTab.image}
                      alt={activeTab.title}
                      fill
                      className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0C] via-[#0A0A0C]/20 to-transparent hidden lg:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent lg:hidden" />
                    
                    <div className="absolute top-8 left-8">
                      <div className={cn(
                        "px-4 py-2 backdrop-blur-md rounded-full text-[11px] font-black text-white uppercase tracking-[0.2em] shadow-2xl border border-white/10",
                        activeTab.color === 'emerald' ? "bg-emerald-600/80" : "bg-blue-600/80"
                      )}>
                        {activeTab.badge}
                      </div>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="lg:col-span-5 p-10 lg:p-16 flex flex-col justify-center">
                    <div className="space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px] font-bold uppercase tracking-[0.3em]">
                        <Scan className="w-3.5 h-3.5" />
                        Premium Module
                      </div>
                      
                      <div className="space-y-4">
                        <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95]">
                          {activeTab.title.split(' ')[0]} <br />
                          <span className={cn(
                            "italic",
                            activeTab.color === 'emerald' ? "text-emerald-500" : "text-blue-500"
                          )}>
                            {activeTab.title.split(' ').slice(1).join(' ')}
                          </span>
                        </h2>
                        <p className="text-slate-400/90 text-lg lg:text-xl font-medium leading-relaxed max-w-sm">
                          {activeTab.description}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link
                          href={activeTab.href}
                          className={cn(
                            "inline-flex items-center justify-center gap-3 px-8 py-5 text-white rounded-2xl font-black text-[13px] tracking-widest uppercase transition-all shadow-xl active:scale-95 group",
                            activeTab.color === 'emerald' 
                              ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20" 
                              : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                          )}
                        >
                          ENTER PROGRAMME
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                          href="/courses"
                          className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-white/[0.03] hover:bg-white/[0.08] text-white rounded-2xl font-black text-[13px] tracking-widest uppercase transition-all border border-white/10 active:scale-95"
                        >
                          EXPLORE ALL
                          <ChevronRight className="w-4 h-4 opacity-50" />
                        </Link>
                      </div>

                      {/* Redesigned Social Proof Card */}
                      <div className="pt-10 flex items-center gap-5">
                        <div className="flex -space-x-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0C] overflow-hidden relative shadow-xl">
                               <Image 
                                 src={`https://ui-avatars.com/api/?name=U${i}&background=random&color=fff&bold=true`}
                                 alt="Student"
                                 fill
                               />
                            </div>
                          ))}
                          <div className={cn(
                            "w-10 h-10 rounded-full border-2 border-[#0A0A0C] flex items-center justify-center text-[10px] font-black shadow-xl",
                            activeTab.color === 'emerald' ? "bg-emerald-500 text-gray-950" : "bg-blue-500 text-gray-950"
                          )}>
                            +240
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-black text-sm tracking-tight flex items-center gap-1.5">
                             <Users className="w-3.5 h-3.5 text-slate-500" />
                             Community Growth
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            {activeTab.stats} this week
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
