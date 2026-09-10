'use client';

import React from 'react';
import { 
  Zap, Users, PenTool, ArrowRight, Sparkles, BookOpen, Clock, TrendingUp, 
  ChevronRight, CheckCircle2, MessageSquare, Briefcase, Globe, Award,
  Database, ShieldCheck, Plus, Download, BarChart3, Edit, AlertCircle,
  Monitor, Code2, Activity, TrendingDown, Layers, Target, Settings, Search, Filter as FilterIcon,
  Layout, PenBox, Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const IconMap: Record<string, React.ComponentType<any>> = {
  Layers,
  Clock,
  Users,
  Target
};

interface Stat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
  footnote: string;
}

interface Hub {
  id: string;
  title: string;
  description: string;
  href: string;
  stats: {
    total: number;
    new: number;
    active: number;
  };
}

interface InductionHubClientProps {
  stats: Stat[];
  hubs: Hub[];
}

const InductionHubClient: React.FC<InductionHubClientProps> = ({ stats, hubs }) => {
  const router = useRouter();

  return (
    <div className="relative flex-1 w-full animate-fade-in overflow-hidden font-nunito bg-[#FCFCFA]">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[80px] animate-pulse" />
        <div className="absolute top-[20%] -right-10 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[60px]" />
        <div className="absolute bottom-[10%] -left-20 w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[70px]" />
      </div>

      <div className="space-y-10 pb-24 pt-2">
        
        {/* HEADER SECTION */}
        <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">INDUCTION PIPELINES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              INDUCTION <span className="text-[#F97316]">DIRECTORY</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
              Manage and monitor your induction pipelines in real-time.
            </p>
          </div>

          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F172A] text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#F97316] transition-all shadow-md active:scale-95 flex-shrink-0">
            <Plus className="w-4 h-4 stroke-[3]" /> Add New Program
          </button>
        </header>

        {/* MODERNIZED STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const IconComponent = IconMap[stat.icon] || Layers;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative group overflow-hidden",
                  i === 0 && "bg-blue-50/40",
                  i === 1 && "bg-emerald-50/40",
                  i === 2 && "bg-amber-50/40"
                )}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn("p-3 rounded-2xl transition-all duration-500", stat.bg, stat.color)}>
                    <IconComponent className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-4xl font-black text-[#0F172A] tracking-tighter font-outfit">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full", stat.color.replace('text', 'bg'))} />
                    {stat.footnote}
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-slate-200 p-8 flex flex-col justify-center items-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
             <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Live Feed</div>
             <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-500">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               System Synced
             </div>
          </div>
        </div>

        {/* UNIFIED SEARCH & ACTION BAR */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search programs, pipelines, or tracks..."
            className="w-full bg-white/80 backdrop-blur-md border border-slate-100 rounded-[2rem] pl-16 pr-[500px] py-6 text-[15px] font-medium text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 focus:outline-none transition-all shadow-[0_10px_40px_rgba(0,0,0,0.02)]"
          />
          
          <div className="absolute inset-y-2 right-2 flex items-center gap-2">
            <div className="h-full w-px bg-slate-100 mx-2" />
            <div className="relative">
              <div className="flex items-center gap-3 px-6 py-3 text-[11px] font-black text-[#0F172A] uppercase tracking-[0.15em] cursor-pointer hover:bg-slate-50 rounded-xl transition-colors">
                All Ecosystem
                <FilterIcon className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.1em] hover:bg-amber-500 transition-all shadow-md group">
              <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" /> Export
            </button>
          </div>
        </div>

        {/* MODERNIZED PIPELINE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hubs.map((hub, i) => (
            <motion.div
              key={hub.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="group relative bg-white/70 backdrop-blur-xl rounded-[3rem] border border-slate-100/80 p-10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] transition-all duration-500"
            >
              {/* Card Aura */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/[0.03] rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-amber-500/[0.08] transition-colors" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-10">
                  <div className="p-4 bg-[#0F172A] text-white rounded-[1.8rem] shadow-2xl group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                    {hub.id === 'blog' && <PenBox className="w-7 h-7" />}
                    {hub.id === 'pro' && <Briefcase className="w-7 h-7" />}
                    {hub.id === 'creator' && <Palette className="w-7 h-7" />}
                    {hub.id === 'builder' && <Code2 className="w-7 h-7" />}
                    {hub.id === 'workshops' && <Zap className="w-7 h-7" />}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active System</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase font-outfit leading-none group-hover:text-amber-600 transition-colors">
                    {hub.title}
                  </h3>
                  <p className="text-[15px] font-medium text-slate-400 leading-relaxed max-w-[280px]">
                    {hub.description}
                  </p>
                </div>

                {/* Performance Metrics Cluster */}
                <div className="grid grid-cols-2 gap-4 mb-10 p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 group-hover:bg-white transition-all shadow-inner">
                  <div className="space-y-1 text-center">
                    <div className="text-3xl font-black text-[#0F172A] font-outfit leading-none tracking-tighter">
                      {hub.stats.new}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</div>
                  </div>
                  <div className="w-px h-10 bg-slate-200 self-center mx-auto" />
                  <div className="space-y-1 text-center">
                    <div className="text-3xl font-black text-[#0F172A] font-outfit leading-none tracking-tighter">
                      {hub.stats.total}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pool</div>
                  </div>
                </div>

                <button 
                  onClick={() => router.push(hub.href)}
                  className="w-full group/btn relative overflow-hidden bg-[#0F172A] text-white py-6 rounded-[2.2rem] font-black uppercase tracking-[0.2em] text-[12px] transition-all duration-500 hover:bg-amber-600 hover:shadow-2xl hover:shadow-amber-500/30 active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    MANAGE PIPELINE <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                  </span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* System Disclaimer */}
        <div className="flex items-center justify-center gap-3 text-slate-300 text-[11px] font-black uppercase tracking-[0.3em] pt-12">
          <AlertCircle className="w-4 h-4 opacity-30" />
          Protocol state logged for audit compliance
        </div>
      </div>
    </div>
  );
};

export default InductionHubClient;
