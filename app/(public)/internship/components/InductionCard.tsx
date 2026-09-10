'use client';

import { memo, forwardRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface InductionCardProps {
    programme: {
        id: string;
        title: string;
        category: string;
        duration: string;
        mentor: string;
        seats: number;
        level: string;
        thumbnail: string;
        description: string;
    };
    index: number;
    onJoin: (programme: any) => void;
}

const InductionCard = forwardRef<HTMLDivElement, InductionCardProps>(
  ({ programme: p, index, onJoin }, ref) => {
    const isLCP = index < 2;

    return (
      <motion.div
          ref={ref}
          initial={isLCP ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: isLCP ? 0 : (index % 2) * 0.1 
          }}
          layout
          className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(27,67,50,0.1)] hover:shadow-[0_30px_80px_-20px_rgba(27,67,50,0.2)] transition-all duration-500 border border-white flex flex-col h-full"
      >
          {/* Visual Header Image */}
          <div className="relative w-full aspect-video overflow-hidden shrink-0 group-hover:shadow-2xl transition-all duration-700">
              <Image 
                  src={p.thumbnail} 
                  alt={p.title} 
                  fill 
                  priority
                  quality={100}
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
          </div>

          <div className="p-6 md:p-8 lg:p-12 flex flex-col flex-1 relative z-30">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#40916C]">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      {p.category}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#6B7280] bg-[#F3F4F6] px-3 py-1.5 rounded-full uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 text-[#40916C]" />
                      {p.duration}
                  </div>
              </div>

              <h3 className="text-lg md:text-xl font-extrabold text-[#1F2937] leading-tight mb-2 md:mb-3 group-hover:text-[#1B4332] transition-colors line-clamp-2 min-h-[50px]">
                  {p.title}
              </h3>

              <p className="text-sm text-[#6B7280] leading-relaxed mb-8 line-clamp-2 opacity-80 min-h-[40px] font-medium">
                  {p.description}
              </p>

              <div className="mt-auto pt-4 md:pt-6 border-t border-[#F3F4F6] flex items-center justify-between gap-3 md:gap-4">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1">Status</span>
                      <div className="flex items-center gap-1.5">
                          <span className="text-lg md:text-xl font-black text-[#1B4332]">OPEN</span>
                          <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#40916C]" />
                      </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onJoin(p);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-4 bg-[#1B4332] text-white font-bold rounded-xl md:rounded-2xl text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#2D6A4F] active:scale-95 transition-all shadow-lg shadow-[#1B4332]/20 whitespace-nowrap"
                  >
                      Join Track
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
          </div>
      </motion.div>
    );
  }
);

InductionCard.displayName = 'InductionCard';

export default memo(InductionCard);


