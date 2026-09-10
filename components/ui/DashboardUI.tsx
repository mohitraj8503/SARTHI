'use client';

import { ReactNode } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// --- 1. UNIFIED HEADER ---
export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const parts = title.split(' ');
  const first = parts[0] || '';
  const rest = parts.slice(1).join(' ') || '';

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-10 mb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1B4332] mb-3 font-outfit uppercase tracking-tight">
            {first} <span className="text-[#D4915C]">{rest}</span>
          </h1>
          <p className="text-slate-600 font-bold text-base sm:text-lg lg:text-xl font-sans not-italic">{subtitle}</p>
        </motion.div>
      </div>
    </div>
  );
}

// --- 2. UNIFIED STAT CARD ---
export function StatCard({ icon, label, value, sublabel, index = 0 }: { 
  icon: ReactNode; 
  label: string; 
  value: string | number;
  sublabel?: string;
  index?: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-default"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-4xl lg:text-[44px] font-black text-[#1B4332] font-outfit leading-none mb-1">{value}</p>
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{sublabel}</p>
        </div>
      </div>
      <p className="text-sm font-black text-gray-800 uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

// --- 3. UNIFIED EMPTY STATE ---
export function EmptyState({ 
  icon, 
  title, 
  message, 
  buttonText, 
  buttonHref,
  buttonIcon 
}: { 
  icon: ReactNode;
  title: string;
  message: string;
  buttonText: string;
  buttonHref: string;
  buttonIcon?: ReactNode;
}) {
  return (
    <div className="bg-white rounded-[3rem] p-16 sm:p-20 text-center border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F8F5F0] rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
      <div className="relative z-10">
        <div className="w-24 h-24 bg-[#F8F5F0] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          {icon}
        </div>
        <h3 className="text-3xl sm:text-4xl font-black text-[#1B4332] mb-4 font-outfit uppercase">{title}</h3>
        <p className="text-slate-600 mb-10 max-w-md mx-auto font-bold text-base sm:text-lg lg:text-xl leading-relaxed">
          {message}
        </p>
        <Link 
          href={buttonHref}
          className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4915C] text-white rounded-2xl font-black uppercase text-sm tracking-[2px] shadow-2xl shadow-[#D4915C]/30 hover:bg-[#c4814c] hover:scale-105 active:scale-95 transition-all"
        >
          {buttonIcon}
          {buttonText}
        </Link>
      </div>
    </div>
  );
}

// --- 4. UNIFIED SEARCH BAR ---
export function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-[2rem] p-6 mb-12 shadow-sm border border-gray-100"
    >
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-16 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332]/20 transition-all text-base font-semibold text-slate-900 placeholder:text-slate-400"
        />
      </div>
    </motion.div>
  );
}

