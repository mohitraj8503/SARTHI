'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Scan, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export default function FaceDetectionProgramme() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative p-1 bg-gradient-to-br from-emerald-500/20 via-slate-200 to-blue-500/20 rounded-[42px]">
          <div className="bg-[#111113] rounded-[40px] overflow-hidden">
            <div className="grid lg:grid-cols-12 gap-0 items-center">
              
              {/* Image Side */}
              <div className="lg:col-span-7 relative aspect-video lg:aspect-auto lg:h-[500px]">
                <Image 
                  src="/images/programmes/face-detection.jpg"
                  alt="Real-Time Face Detection Programme"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#111113] via-transparent to-transparent hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent lg:hidden" />
                
                {/* Live Indicator */}
                <div className="absolute top-8 left-8 flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Induction Live
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="lg:col-span-5 p-10 lg:p-16 space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <Scan className="w-3 h-3" />
                    Special Module
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight">
                    Real-Time <br />
                    <span className="text-emerald-500 italic">Face Detection</span>
                  </h2>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                    Master computer vision with our premium Python internship programme. Build live systems that see.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    href="/internship/face-detection"
                    className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm tracking-tight transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] group"
                  >
                    ENTER PROGRAMME
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/courses"
                    className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-sm tracking-tight transition-all border border-white/10"
                  >
                    EXPLORE COURSES
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="pt-8 border-t border-white/5 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111113] bg-slate-800" />
                    ))}
                  </div>
                  <div className="text-xs font-bold text-slate-500 italic">
                    Joined by <span className="text-white font-black not-italic">240+ students</span> this week
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

