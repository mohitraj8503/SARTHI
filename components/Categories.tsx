'use client';

import { motion } from 'framer-motion';
import { Terminal, Palette, TrendingUp, Briefcase } from 'lucide-react';

const categories = [
  { id: 1, name: 'Development', icon: Terminal, count: '120+ Courses', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 2, name: 'Design', icon: Palette, count: '85+ Courses', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 3, name: 'Finance', icon: TrendingUp, count: '40+ Courses', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 4, name: 'Business', icon: Briefcase, count: '60+ Courses', color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

export default function Categories() {
  return (
    <section className="py-24 bg-[#070A1E]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
           <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Explore Top Categories</h2>
              <p className="text-slate-400 max-w-lg">Find the right path for your career. Our courses are designed by industry experts.</p>
           </div>
           <button className="text-[#FF5A1F] font-bold hover:text-white transition-colors flex items-center gap-2">
             View All Categories <span className="text-xl">→</span>
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-6 rounded-2xl flex flex-col items-start gap-4 hover:bg-white/[0.08] transition-all cursor-pointer group hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                 <cat.icon className={`w-6 h-6 ${cat.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#FF5A1F] transition-colors">{cat.name}</h3>
                <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">{cat.count}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

