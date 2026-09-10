'use client';

import Link from 'next/link';
import { Home, Compass, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6 selection:bg-[#1B4332]/10">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#1B4332]/5 mb-8 border border-[#1B4332]/10">
            <Compass className="w-10 h-10 text-[#1B4332]" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-[#1B4332] tracking-tighter mb-6">
            404 <span className="text-[#40916C]">/ Lost</span>
          </h1>
          
          <p className="text-xl text-[#5F6E5F] font-medium max-w-lg mx-auto mb-12 leading-relaxed">
            The coordinates you&apos;ve entered lead to uncharted territory. Let&apos;s redirect you to the main mission.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link 
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-[#1B4332] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#1B4332]/20 hover:bg-[#2D6A4F] hover:-translate-y-1 transition-all active:scale-95"
            >
              <Home className="w-5 h-5" />
              Return Home
            </Link>
            
            <Link 
              href="/courses"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-white border border-[#EAE6DF] text-[#1B4332] rounded-2xl font-bold text-lg hover:bg-[#FDFBF7] hover:border-[#1B4332]/20 transition-all group"
            >
              Explore Courses
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-20 flex items-center justify-center gap-8">
            <div className="h-px w-12 bg-[#EAE6DF]" />
            <span className="text-xs font-black text-[#1B4332]/20 uppercase tracking-[0.4em]">SARTHI Core</span>
            <div className="h-px w-12 bg-[#EAE6DF]" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

