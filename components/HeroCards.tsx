'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Code, Play, Calendar } from 'lucide-react';

/**
 * Cards Section - Moved from Hero
 * - Equal height cards in single row
 * - Clean, minimal design
 * - No borders, no glow
 */
export default function HeroCards() {
  const router = useRouter();

  return (
    <section className="py-24 lg:py-32 bg-[#050505]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Popular Course */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#0B0F19] rounded-2xl p-8 flex flex-col group cursor-pointer hover:bg-[#0D1424] transition-colors"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <Code className="w-5 h-5 text-white/60" />
                </div>
                <div>
                  <h4 className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Masterclass</h4>
                  <p className="text-xs font-semibold text-white">Popular Course</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-white/5 rounded text-[8px] font-medium text-white/30 uppercase">Popular</span>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">Python Masterclass</h3>
              <p className="text-sm text-white/40">Expert Mentor • 24 Lessons</p>
            </div>

            <div className="mt-8">
              <div className="h-1 w-full bg-white/5 rounded-full mb-4 overflow-hidden">
                <div className="h-full w-[65%] bg-white/20 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Beginner Friendly</span>
                <button
                  onClick={() => router.push('/courses/python-masterclass')}
                  className="text-xs font-medium text-white/60 hover:text-white transition-colors"
                >
                  View Course →
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Live Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0B0F19] rounded-2xl p-8 flex flex-col group cursor-pointer hover:bg-[#0D1424] transition-colors"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">Live Now</span>
              </div>
              <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">183 Watching</span>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-4">System Design Q&A</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Deep dive into scalable architecture patterns with senior engineers from FAANG.
              </p>
            </div>

            <div className="mt-8">
              <button
                onClick={() => router.push('/seminars')}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Join Session
              </button>
            </div>
          </motion.div>

          {/* Card 3: Upcoming Seminars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#0B0F19] rounded-2xl p-8 flex flex-col group cursor-pointer hover:bg-[#0D1424] transition-colors"
          >
            <h4 className="text-[10px] font-medium text-white/20 uppercase tracking-wider mb-8">Upcoming Seminars</h4>

            <div className="flex-1 space-y-6">
              {[
                { date: "APR 12", title: "Intro to JavaScript", time: "4:00 PM • 1h" },
                { date: "APR 14", title: "React Patterns", time: "2:00 PM • 2h" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 cursor-pointer">
                  <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-[10px] font-medium text-white/40 uppercase">{item.date.split(' ')[0]}</span>
                    <span className="text-2xl font-bold text-white leading-none">{item.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-white mb-1">{item.title}</p>
                    <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                onClick={() => router.push('/seminars')}
                className="text-xs font-medium text-white/40 hover:text-white transition-colors flex items-center gap-2"
              >
                View All Sessions
                <Calendar className="w-3 h-3" />
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

