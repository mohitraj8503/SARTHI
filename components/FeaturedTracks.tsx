'use client';

import { motion } from 'framer-motion';
import { Code2, BrainCircuit, Cloud, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const tracks = [
  {
    id: 1,
    title: 'Web Development',
    description: 'Full stack mastery with real-world projects.',
    icon: Code2,
    gradient: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
  },
  {
    id: 2,
    title: 'AI & Machine Learning',
    description: 'Build intelligent systems for the future.',
    icon: BrainCircuit,
    gradient: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
  },
  {
    id: 3,
    title: 'Cloud & DevOps',
    description: 'Master scalable infrastructure & deployment.',
    icon: Cloud,
    gradient: 'from-sky-500/20 to-sky-600/5',
    iconColor: 'text-sky-400',
  },
  {
    id: 4,
    title: 'Cyber Security',
    description: 'Protect digital assets and networks.',
    icon: ShieldCheck,
    gradient: 'from-teal-500/20 to-teal-600/5',
    iconColor: 'text-teal-400',
  },
];

export default function FeaturedTracks() {
  return (
    <section className="relative section-spacing bg-slate-900 overflow-hidden">
      {/* Subtle connect-the-dots background noise or element could go here */}

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 lg:mb-20">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4"
            >
              Explore Our <span className="text-slate-500">Tracks</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-400 font-medium max-w-lg"
            >
              Curated learning paths designed to take you from beginner to industry-ready professional.
            </motion.p>
          </div>

          <Link href="/courses" className="hidden md:flex items-center gap-2 text-white font-medium hover:text-orange-400 transition-colors group">
            View all courses <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="group relative p-8 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col h-full active:scale-[0.98] cursor-pointer"
            >
              {/* Subtle Gradient Hover Effect */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${track.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-slate-900/50 border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                  <track.icon className={`w-7 h-7 ${track.iconColor}`} />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  {track.title}
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  {track.description}
                </p>

                <div className="mt-auto flex items-center gap-2 text-sm font-bold text-white group-hover:gap-3 transition-all">
                  Start Track <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 md:hidden flex justify-center">
          <Link href="/courses">
            <button className="px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white font-bold text-sm hover:bg-white/10 active:scale-95 transition-all cursor-pointer">
              View All Courses
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

