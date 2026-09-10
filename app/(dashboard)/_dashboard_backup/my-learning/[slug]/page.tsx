'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayCircle, 
  MessageSquare, 
  FileText, 
  Download, 
  Calendar, 
  Award, 
  Clock, 
  ChevronRight,
  Video,
  FileCode,
  Zap,
  Info,
  Star,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

export default function SummerCampDashboard() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isSummerCamp = slug === 'summer-camp-2026';

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden">
      
      {/* ── CONDITIONAL CINEMATIC BACKGROUND (Summer Camp Only) ── */}
      {isSummerCamp && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=2000&q=80')` }}
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 40%, rgba(2,6,23,0.4) 0%, rgba(2,6,23,0.85) 50%, rgba(2,6,23,0.98) 100%)'
            }}
          />
          <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-[#FBBF24]/[0.05] blur-[140px] -translate-x-1/4 -translate-y-1/4" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.svg')] mix-blend-soft-light" />
        </div>
      )}

      {/* ── CONTENT AREA ── */}
      <div className="relative z-10 max-w-[1400px] mx-auto py-6">
          
          {/* Welcome Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
             >
                <div className="flex items-center gap-3 mb-2">
                   <span className="px-3 py-1 bg-[#FBBF24]/10 text-[#FBBF24] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#FBBF24]/20">
                      Active Enrollment
                   </span>
                   <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Summer Batch 2026</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                   Happy Learning, <span className="text-[#FBBF24]">{user?.name?.split(' ')[0] || 'Innovator'}!</span>
                </h1>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex items-center gap-4"
             >
                <button className="bg-[#FBBF24] text-[#020617] px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:scale-105 transition-all">
                   <Video className="w-5 h-5" />
                   Join Live Class
                </button>
             </motion.div>
          </div>

          {/* GRID SYSTEM */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* Main Content (8 SPAN) */}
             <div className="lg:col-span-8 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative h-[400px] rounded-[40px] overflow-hidden group shadow-2xl border border-white/5"
                >
                   <Image 
                     src="/images/summer-camp-perfect-thumb.png" 
                     fill 
                     alt="Hero" 
                     className="object-cover group-hover:scale-105 transition-transform duration-1000 opacity-70" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                   <div className="absolute bottom-0 left-0 p-10 flex justify-between items-end w-full">
                      <div>
                         <h2 className="text-3xl font-black text-white mb-2">Python Masterclass</h2>
                         <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#FBBF24]" /> July 1st Launch</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#FBBF24]" /> 7:00 PM IST</span>
                         </div>
                      </div>
                      <div className="hidden md:block w-48 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                            <span className="text-xs font-black text-[#FBBF24]">0%</span>
                         </div>
                         <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="w-[2%] h-full bg-[#FBBF24]" />
                         </div>
                      </div>
                   </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <DashboardCard title="Upcoming Sessions">
                      <div className="space-y-4 mt-4">
                         <SessionItem title="Python Foundations" date="July 1" status="live" />
                         <SessionItem title="Logic & Conditionals" date="July 2" />
                         <SessionItem title="Logic Building with Loops" date="July 3" />
                      </div>
                   </DashboardCard>

                   <DashboardCard title="Community Highlights">
                      <div className="mt-4 p-6 rounded-[32px] bg-[#FBBF24]/5 border border-[#FBBF24]/10">
                         <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="text-[#FBBF24]" size={16} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FBBF24]">Discord Active</span>
                         </div>
                         <p className="text-sm font-black text-white mb-2">&quot;Python for AI setup help needed!&quot;</p>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed">Connect with 142 other students in the summer camp channel.</p>
                         <button className="mt-6 w-full py-3.5 bg-white text-[#020617] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FBBF24] transition-all">
                            Join Discussion
                         </button>
                      </div>
                   </DashboardCard>
                </div>
             </div>

             {/* Sidebar Content (4 SPAN) */}
             <div className="lg:col-span-4 space-y-8">
                <DashboardCard title="Your Mentor">
                   <div className="mt-6 flex flex-col items-center text-center">
                      <div className="relative mb-4">
                         <Image src="/images/instructors/mohit-raj-real.jpg" width={80} height={80} className="rounded-[28px] border-2 border-[#FBBF24]/20" alt="Mentor" />
                         <div className="absolute -bottom-1 -right-1 bg-[#FBBF24] p-1.5 rounded-lg">
                            <Star size={12} className="fill-[#020617] text-[#020617]" />
                         </div>
                      </div>
                      <h4 className="text-lg font-black text-white">Mohit Raj</h4>
                      <p className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-widest italic">Python Architect</p>
                      <button className="w-full py-4 bg-white/[0.05] border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FBBF24] hover:text-[#020617] transition-all">
                         Ask a Question
                      </button>
                   </div>
                </DashboardCard>

                <DashboardCard title="Course Records">
                   <div className="space-y-4 mt-6">
                      <RecordItem label="Invoice Status" value="Processing" status="warning" icon={<FileText size={14} />} />
                      <RecordItem label="Batch Access" value="Confirmed" icon={<ShieldCheck size={14} />} />
                      <RecordItem label="Course Type" value="Masterclass" icon={<Award size={14} />} />
                   </div>
                   <p className="mt-6 text-center text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">
                      “Innovation starts with one line of code.”
                   </p>
                </DashboardCard>
             </div>
          </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] rounded-[35px] p-8 shadow-2xl relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
          <Sparkles className="w-12 h-12" />
       </div>
       <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{title}</h3>
       {children}
    </div>
  );
}

function SessionItem({ title, date, status = 'upcoming' }: { title: string; date: string; status?: 'live' | 'upcoming' }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-all group cursor-pointer">
       <div className="flex items-center gap-4">
          <div className={cn(
             "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
             status === 'live' ? "bg-[#FBBF24]/10 text-[#FBBF24] shadow-[0_0_15px_rgba(251,191,36,0.15)]" : "bg-white/5 text-slate-600"
          )}>
             {status === 'live' ? <Zap size={14} className="animate-pulse" /> : <PlayCircle size={14} />}
          </div>
          <div>
             <p className="text-sm font-black text-white group-hover:text-[#FBBF24] transition-colors">{title}</p>
             <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{date}</p>
          </div>
       </div>
       <ChevronRight size={12} className="text-slate-700 group-hover:text-white transition-all" />
    </div>
  );
}

function RecordItem({ label, value, status = 'normal', icon }: { label: string; value: string; status?: 'normal' | 'warning'; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
       <div className="flex items-center gap-3">
          <div className="text-slate-600">{icon}</div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{label}</span>
       </div>
       <span className={cn(
          "text-[9px] font-black px-3 py-1 rounded-full border",
          status === 'warning' ? "bg-[#FBBF24]/5 border-[#FBBF24]/10 text-[#FBBF24]" : "bg-white/5 border-white/5 text-slate-400"
       )}>
          {value}
       </span>
    </div>
  );
}
