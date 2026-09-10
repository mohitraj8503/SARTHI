'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Zap, Globe, Clock, ShieldCheck, Code2, 
  FileText, User, ArrowRight, Upload, Trophy, CheckCircle2,
  AlertCircle, Github, Play, Layout, Check, ChevronRight,
  X, Loader2, Camera, BarChart3, Award, Sparkles, Briefcase,
  Search, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'evaluation', label: 'EVALUATION' },
  { id: 'rewards', label: 'REWARDS' },
];

export default function FaceDetectionInduction() {
  const [activeTab, setActiveTab] = useState('overview');

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const orbs = document.querySelectorAll('.induction-orb');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (0.5 - x) * speed;
        const yOffset = (0.5 - y) * speed;
        (orb as HTMLElement).style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans selection:bg-[#1B4332]/10 selection:text-[#1B4332] overflow-x-hidden relative">
      {/* Decorative Background */}
      <div className="fixed top-0 right-0 w-[60%] h-[80%] bg-[#F0EDE8] rounded-bl-[400px] -z-10 opacity-60" />
      <div className="induction-orbs fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="induction-orb induction-orb-1 absolute rounded-full opacity-12 bg-[#1B4332] w-[600px] h-[600px] -top-[200px] -right-[100px] transition-transform duration-100 ease-out animate-pulse" style={{ animationDuration: '20s' }} />
          <div className="induction-orb induction-orb-2 absolute rounded-full opacity-12 bg-[#40916C] w-[400px] h-[400px] -bottom-[100px] -left-[100px] transition-transform duration-100 ease-out animate-pulse" style={{ animationDuration: '20s', animationDelay: '2s' }} />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-24 md:pt-32 relative z-10">
        <Link href="/internship" className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 hover:text-[#1B4332] transition-colors mb-8 md:mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform stroke-[2]" />
          BACK TO INTERNSHIP TRACKS
        </Link>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-24">
          <div className="lg:col-span-8 space-y-8 md:space-y-10">
            <div className="flex flex-wrap gap-3">
              <div className="px-5 py-2.5 bg-[#1B4332] text-white rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#1B4332]/20">
                <Zap className="w-3.5 h-3.5 fill-current" />
                FEATURED CHALLENGE
              </div>
              <div className="px-5 py-2.5 bg-white border border-[#E5E2DD] text-[#1B4332] rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Camera size={14} className="w-3.5 h-3.5" />
                BUILDER TRACK
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[76px] font-black text-[#1B4332] leading-[1] lg:leading-[0.9] tracking-tighter uppercase">
              FACE DETECTION <br />
              & ANALYSIS
            </h1>

            <p className="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl italic">
              “If you’ve built something real—prove it. We’ll evaluate it.”
            </p>

            <div className="pt-12">
              <div className="flex border-b border-[#E5E2DD] gap-6 sm:gap-10 lg:gap-16 overflow-x-auto scrollbar-none pb-px">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "pb-5 text-[12px] font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap",
                      activeTab === tab.id ? "text-[#1B4332]" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#1B4332] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="py-16 min-h-[400px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 bg-white border border-[#E5E2DD] rounded-[2.5rem] space-y-6 group hover:border-[#1B4332]/20 transition-all shadow-sm">
                          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#1B4332] group-hover:scale-110 transition-transform">
                            <Camera size={24} />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-lg font-black text-[#1B4332] uppercase tracking-tight">Real-time Recognition</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                              Implement high-accuracy face detection algorithms that work seamlessly across various lighting conditions and angles.
                            </p>
                          </div>
                        </div>

                        <div className="p-8 bg-white border border-[#E5E2DD] rounded-[2.5rem] space-y-6 group hover:border-[#1B4332]/20 transition-all shadow-sm">
                          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#1B4332] group-hover:scale-110 transition-transform">
                            <Target size={24} />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-lg font-black text-[#1B4332] uppercase tracking-tight">Behavior Tracking</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                              Go beyond simple detection to track user engagement, gaze, and micro-expressions for deep behavioral insights.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'evaluation' && (
                    <motion.div key="evaluation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 pb-12">
                       {/* Simplified Process */}
                       <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3 sm:gap-4 py-8 border-b border-slate-50">
                          {["Submit", "Screen", "Review", "Score", "Result"].map((step, i) => (
                             <div key={i} className="flex items-center gap-2 sm:gap-4">
                                <div className="flex items-center gap-2">
                                   <span className="w-5 h-5 rounded-full bg-[#1B4332] text-white text-[10px] flex items-center justify-center font-bold">{i+1}</span>
                                   <span className="text-[10px] font-black uppercase tracking-widest text-[#111827]">{step}</span>
                                </div>
                                {i < 4 && <ChevronRight size={12} className="text-slate-300 hidden sm:block" />}
                             </div>
                          ))}
                       </div>

                       <div className="grid lg:grid-cols-2 gap-16">
                          {/* Rubric */}
                          <div className="space-y-8">
                             <h3 className="text-xl font-black text-[#111827] uppercase tracking-tighter">The Rubric</h3>
                             <div className="grid grid-cols-2 gap-4">
                                {[
                                  { l: "Technical", v: "45%" },
                                  { l: "Execution", v: "25%" },
                                  { l: "Innovation", v: "20%" },
                                  { l: "Evidence", v: "10%" }
                                ].map((item, i) => (
                                  <div key={i} className="p-4 bg-[#F8F5F0] rounded-2xl border border-[#E5E2DD]/50">
                                     <p className="text-[10px] font-black uppercase tracking-tight text-[#1B4332]">{item.l}</p>
                                     <p className="text-xl font-black text-[#111827]">{item.v}</p>
                                  </div>
                                ))}
                             </div>
                          </div>

                          {/* Rewards */}
                          <div className="space-y-8">
                             <h3 className="text-xl font-black text-[#111827] uppercase tracking-tighter">The Tiers</h3>
                             <div className="space-y-3">
                                {[
                                  { t: "Elite", s: "80+", b: "🥇", c: "text-amber-500" },
                                  { t: "Selected", s: "65+", b: "🥈", c: "text-slate-400" },
                                  { t: "Qualified", s: "50+", b: "🥉", c: "text-amber-700" }
                                ].map((m, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                                     <div className="flex items-center gap-4">
                                        <span className="text-xl">{m.b}</span>
                                        <span className="text-sm font-black uppercase text-[#111827]">{m.t}</span>
                                     </div>
                                     <span className={`text-lg font-black ${m.c}`}>{m.s}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'rewards' && (
                    <motion.div key="rewards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
                       <div className="text-center max-w-3xl mx-auto space-y-4">
                          <h3 className="text-4xl font-black text-[#1B4332] uppercase tracking-tighter">Reward Progression</h3>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                             “Unlock premium recognition and industry opportunities as you improve your project quality.”
                          </p>
                       </div>
                       <div className="grid md:grid-cols-3 gap-8">
                          {[
                            { t: "Community Elite", d: "Direct access to private networks", i: Sparkles },
                            { t: "Industry Badge", d: "Verified credentials for CV", i: Briefcase },
                            { t: "Live Mentorship", d: "Direct review sessions", i: User }
                          ].map((item, i) => (
                            <div key={i} className="p-8 bg-white border border-[#E5E2DD] rounded-[2.5rem] space-y-4 hover:border-[#1B4332]/20 transition-all text-center group shadow-sm">
                               <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#1B4332] mx-auto group-hover:scale-110 transition-transform">
                                  <item.i size={28} />
                               </div>
                               <h4 className="text-base font-black text-[#1B4332] uppercase tracking-tight">{item.t}</h4>
                               <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.d}</p>
                            </div>
                          ))}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:pt-32">
            <div className="sticky top-[120px] space-y-8">
              <div className="bg-[#1B4332] rounded-[3rem] overflow-hidden shadow-2xl shadow-[#1B4332]/30 border border-white/10 group">
                {/* Sidebar Header */}
                <div className="px-10 pt-10 pb-8 border-b border-white/5 bg-white/5 backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">Program Tracks</p>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl p-1 overflow-hidden shrink-0 border border-white/10">
                      <Image 
                        src="/sarthi-logo.png" 
                        alt="SARTHI" 
                        width={56} 
                        height={56} 
                        priority
                        className="object-contain"
                      />
                    </div>
                    <p className="text-white font-black text-2xl tracking-tighter leading-none uppercase">Builder Track</p>
                  </div>
                </div>

                {/* Metadata List */}
                <div className="px-10 py-10 space-y-8 border-b border-white/5">
                  {[
                    { label: "Duration", value: "Performance Based", icon: Clock },
                    { label: "Commitment", value: "40+ Engineering Hours", icon: Activity },
                    { label: "Track Type", value: "Technical / Builder", icon: Layout },
                    { label: "Awarded", value: "Builder Badge", icon: Trophy },
                    { label: "Deadline", value: "June 15, 2026", icon: Clock },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between group gap-6">
                      <div className="flex items-center gap-4 shrink-0 pt-1">
                        <item.icon className="text-white/20 w-5 h-5 stroke-[1.5] group-hover:text-emerald-400 transition-colors" />
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</p>
                      </div>
                      <p className="text-white text-sm font-black tracking-tight text-right leading-tight uppercase">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Action Section */}
                <div className="px-10 py-10 bg-white/5 backdrop-blur-sm space-y-6">
                  <Link 
                    href="/internship/upload-project" 
                    className="w-full py-6 bg-white text-[#1B4332] rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                  >
                    SUBMIT PROJECT
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <p className="text-center text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                    Enterprise verification active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Industry Opportunity Section - Standardized */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mt-32 relative group mb-24"
        >
           <div className="p-8 md:p-12 lg:p-20 bg-[#1B4332] rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[4rem] text-white overflow-hidden relative shadow-2xl border border-white/5">
              <div className="grid lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center relative z-10">
                 <div className="space-y-10">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 text-white">
                       <Zap size={14} className="text-amber-400 fill-amber-400" />
                       ELITE OPPORTUNITY
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black leading-[1] md:leading-[0.9] tracking-tighter uppercase text-white">
                       INDUSTRY <br />
                       OPPORTUNITY
                    </h2>
                    
                    <p className="text-base md:text-lg text-white/80 font-medium leading-relaxed max-w-xl">
                       Best performers get a chance to work on real client-facing tasks. Selection is based on delivery quality, review score, and consistency.
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-10 pt-4">
                       <div className="space-y-3">
                          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">- ELIGIBILITY CRITERIA</h4>
                          <p className="text-[10px] text-white font-bold uppercase leading-relaxed tracking-wider">
                             COMPLETE THE INTERNSHIP PROJECT, SUBMIT DEMO PROOF, AND MAINTAIN A STRONG EVALUATION SCORE.
                          </p>
                       </div>
                       <div className="space-y-3">
                          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">- SELECTION SIGNAL</h4>
                          <p className="text-[10px] text-white font-bold uppercase leading-relaxed tracking-wider">
                             ARCHITECTURE CLARITY, PRODUCTION READINESS, DEBUGGING DEPTH, AND COMMUNICATION QUALITY.
                          </p>
                       </div>
                       <div className="space-y-3">
                          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">- WHAT YOU GET</h4>
                          <p className="text-[10px] text-white font-bold uppercase leading-relaxed tracking-wider">
                             PROJECT ASSIGNMENT PRIORITY, MENTOR FEEDBACK LOOP, AND POSSIBLE PAID EXECUTION OPPORTUNITIES.
                          </p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-8 md:space-y-10">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] space-y-8 md:space-y-10">
                       <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-white">HOW IT WORKS</h3>
                       
                       <div className="space-y-8">
                          <div className="space-y-1">
                             <p className="text-sm font-medium leading-relaxed">
                                <span className="text-amber-400 font-black">Step 1:</span> Build and submit your induction project with clear README, demo video, and source code.
                             </p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm font-medium leading-relaxed">
                                <span className="text-amber-400 font-black">Step 2:</span> Internal review scores technical quality, implementation depth, and reliability.
                             </p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm font-medium leading-relaxed">
                                <span className="text-amber-400 font-black">Step 3:</span> Shortlisted candidates receive assignment invites for live tasks and mentor syncs.
                             </p>
                          </div>
                       </div>
                       
                       <div className="p-8 bg-black/20 rounded-[2rem] border border-white/5">
                          <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2">STATUS: MERIT BASED</p>
                          <p className="text-xs text-white/80 font-medium leading-relaxed">
                             Selection is limited and non-guaranteed. Priority goes to high-scoring submissions with consistent delivery and clear problem-solving.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
}

const Target = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
