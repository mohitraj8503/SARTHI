'use client';

import { useRef, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollSectionProps {
  title: string;
  children: ReactNode;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export default function ScrollSection({
  title,
  subtitle,
  badge,
  children,
  className
}: ScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className={cn("space-y-6 group antialiased", className)}>
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
             {badge && (
               <span className="px-2.5 py-0.5 bg-[#D4956A]/10 text-[#D4956A] text-[9px] font-bold rounded-full uppercase tracking-[0.1em] border border-[#D4956A]/20">
                 {badge}
               </span>
             )}
             <h2 className="text-[20px] md:text-[24px] font-bold text-[#1A3C2E] tracking-tight">
               {title}
             </h2>
          </div>
          {subtitle && (
            <p className="text-[12px] font-semibold text-[#5D705C]/70 uppercase tracking-[0.1em]">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => scroll('left')}
            className="p-2.5 rounded-full bg-white border border-[#EAE6DF] hover:bg-[#F7F4EF] transition-all shadow-sm active:scale-90"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-[#1A3C2E]" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2.5 rounded-full bg-white border border-[#EAE6DF] hover:bg-[#F7F4EF] transition-all shadow-sm active:scale-90"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-[#1A3C2E]" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6 scroll-smooth px-2"
      >
        {children}
      </div>
    </section>
  );
}

