'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const HeroBackgroundVideo = dynamic(() => import('@/components/HeroBackgroundVideo'), { ssr: false });

export default function Hero() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full min-h-screen lg:min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#0A1628] pt-16 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20 gpu-accelerated">
      <HeroBackgroundVideo />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-[10] flex justify-center lg:justify-start">
        <div className="max-w-[800px] w-full flex flex-col items-center lg:items-start text-center lg:text-left rounded-3xl">

          {/* 1. MAIN HEADLINE */}
          <div className="mb-6 sm:mb-8 w-full">
            <h1 className="font-instrument text-[36px] sm:text-[52px] lg:text-[66px] xl:text-[72px] font-bold text-white tracking-[-0.03em] leading-[1.12] max-w-[780px] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              SARTHI — Building Capacity, Empowering IMD&apos;s Workforce
            </h1>
            <div className="mt-3 sm:mt-4 flex items-center justify-center lg:justify-start gap-2 text-white/90 text-[15px] sm:text-[18px] font-medium font-instrument tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              <span className="text-lg sm:text-xl select-none" role="img" aria-label="Indian Flag">🇮🇳</span>
              <span>Making India Future Ready</span>
            </div>
          </div>

          {/* 2. ACTION BUTTONS */}
          <div className="flex flex-row flex-wrap gap-4 sm:gap-5 items-center justify-center lg:justify-start w-full sm:w-auto">
            <button
              onClick={() => router.push('/courses')}
              className="h-12 sm:h-[52px] px-7 sm:px-9 rounded-[10px] bg-[#cbff54] hover:bg-[#bbf040] text-[#0c211d] font-semibold text-[15px] sm:text-[16px] transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center cursor-pointer font-instrument"
            >
              Explore Courses
            </button>

            <button
              onClick={() => router.push('/membership')}
              className="h-12 sm:h-[52px] px-7 sm:px-9 rounded-[10px] bg-transparent border border-white hover:border-white hover:bg-white/10 text-white font-medium text-[15px] sm:text-[16px] transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer font-instrument"
            >
              Sign Up Free
            </button>
          </div>

        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:block">
        <div className="opacity-0 animate-fadeIn" style={{ animationDelay: '2.5s', animationFillMode: 'forwards' }}>
          <ChevronDown className="w-6 h-6 text-white/40 animate-bounce" strokeWidth={2.5} />
        </div>
      </div>
    </section>
  );
}

