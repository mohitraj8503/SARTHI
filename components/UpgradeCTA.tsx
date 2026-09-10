'use client';

import Link from 'next/link';
import { ArrowRight, Ticket } from 'lucide-react';

export default function UpgradeCTA() {
  return (
    <section className="relative section-spacing bg-slate-900 border-t border-white/5 text-center overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
           Ready to upgrade your skills?
        </h2>
        
        <p className="text-lg text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
           Join thousands of students and start your journey towards a high-paying career in tech.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link href="/courses">
              <button className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-slate-200 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 min-w-[200px]">
                 Browse All Courses
                 <ArrowRight className="w-5 h-5" />
              </button>
           </Link>
           
           <Link href="/seminars">
              <button className="px-8 py-4 bg-transparent border border-white/10 hover:bg-white/5 text-white rounded-full font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 min-w-[200px]">
                 Upcoming Seminars
                 <Ticket className="w-5 h-5" />
              </button>
           </Link>
        </div>
      </div>
    </section>
  );
}

