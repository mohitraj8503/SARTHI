'use client';

import { motion } from 'framer-motion';

export default function TrustStrip() {
  return (
    <section className="relative bg-white border-y border-[#E9ECEF] py-8 sm:py-10 lg:py-12 overflow-hidden">
      {/* Subtle micro dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.025] pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative z-10 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center"
        >
          {/* Institutional Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] sm:text-[12px] font-semibold uppercase tracking-wider mb-4 font-instrument">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Ministry of Earth Sciences • Govt. of India</span>
          </div>

          {/* Statement Headline */}
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-medium text-slate-800 tracking-[-0.02em] leading-[1.35] max-w-3xl mx-auto font-instrument">
            Centralized Capacity Building &amp; Competency Development for the{' '}
            <span className="text-slate-950 font-semibold underline decoration-emerald-500/40 decoration-2 underline-offset-4">
              India Meteorological Department
            </span>.
          </h2>


        </motion.div>
      </div>
    </section>
  );
}
