'use client';

import { motion } from 'framer-motion';

export default function TrustSignals() {
  const stats = [
    { label: 'Active Learners', value: '10,000+' },
    { label: 'Industry Mentors', value: '100+' },
    { label: 'Hiring Partners', value: '50+' },
    { label: 'Course Completion', value: '94%' },
  ];

  return (
    <section className="py-16 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-between items-center gap-8 md:gap-16 px-4 md:px-12"
        >
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center flex-1 min-w-[150px]">
              <span className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                {stat.value}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-3 text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

