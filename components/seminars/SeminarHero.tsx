import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function SeminarHero({ seminar }: { seminar: any }) {
  const formattedDate = seminar.startTime
    ? new Date(seminar.startTime).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'March 27, 2026';

  return (
    <section className="relative bg-[#F5F0E8] overflow-hidden pt-5 pb-4 md:pt-6 md:pb-5 border-b border-[#E8E2D9]/80">
      {/* Background Patterns - Sync with /courses */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: 'radial-gradient(#1A3C2E 0.5px, transparent 0.5px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Subtle top gradient for depth */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#EDE8DD]/40 to-transparent" />

      <div className="relative max-w-6xl xl:max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-center text-center">
        {/* Breadcrumb Row */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <Link
            href="/seminars"
            className="inline-flex items-center gap-2 text-[#5D705C] hover:text-[#2D6A4F] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">
              Back to Strategic Library
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8E2D9] shadow-sm">
            <Sparkles className="w-3 h-3 text-[#2D6A4F]" />
            <span className="text-[9px] font-black text-[#2D6A4F] uppercase tracking-[0.2em] whitespace-nowrap">
              {seminar.status === 'LIVE' ? 'Broadcast Live' : 'Strategic Seminar'}
            </span>
          </div>
        </div>

        {/* Title Block */}
        <div className="max-w-3xl space-y-3">
          <h1 className="text-[30px] sm:text-[40px] md:text-[50px] font-black leading-[1.08] tracking-[-0.02em] text-[#1A3C2E]">
            {seminar.title}
          </h1>

          {/* Optional Description */}
          <p className="text-[15px] md:text-[16px] text-[#6B7D6A] font-medium max-w-xl mx-auto leading-[1.7]">
            {seminar.description ||
              'Master strategic time management techniques for peak professional performance.'}
          </p>

          {/* Tag Pills */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <span className="px-3 py-1 rounded-full bg-[#2D6A4F]/8 text-[#2D6A4F] text-[10px] font-bold uppercase tracking-[0.15em]">
              {seminar.category || 'Productivity'}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#1A3C2E]/5 text-[#1A3C2E] text-[10px] font-bold uppercase tracking-[0.15em]">
              {seminar.level || 'Beginner'}
            </span>
          </div>

          {/* Meta Information Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 pt-5 max-w-xl mx-auto">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.25em] leading-none">
                Expert Speaker
              </span>
              <span className="text-[14px] font-black text-[#1A3C2E] leading-none">
                {seminar.speakerName || 'SARTHI'}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.25em] leading-none">
                Date Scheduled
              </span>
              <span className="text-[14px] font-black text-[#1A3C2E] leading-none">
                {formattedDate}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-black text-[#5D705C] uppercase tracking-[0.25em] leading-none">
                Total Runtime
              </span>
              <span className="text-[14px] font-black text-[#1A3C2E] leading-none">
                {seminar.duration || 60} Minutes
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

