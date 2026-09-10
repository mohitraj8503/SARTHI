'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface MobileStickyCTAProps {
  course: any;
  onEnroll: () => void;
  enrollLoading: boolean;
  enrollment: any;
}

export default function MobileStickyCTA({ 
  course, 
  onEnroll, 
  enrollLoading, 
  enrollment 
}: MobileStickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling past the main video card (approx 600px)
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 z-[100] safe-area-pb animate-in slide-in-from-bottom duration-500">
      <div className="flex gap-4 items-center max-w-lg mx-auto">
        <div className="flex-1 font-plus-jakarta">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Lifetime Access</p>
          <p className="text-xl font-bold text-[#1A1916]">
            {course.price === 0 || course.pricing_type === 'FREE' ? 'Free' : `₹${course.price.toLocaleString()}`}
          </p>
        </div>
        <button 
          onClick={onEnroll}
          disabled={enrollLoading}
          className="flex-[1.5] h-12 bg-[#1A3C2E] hover:bg-[#153025] text-white font-semibold text-sm rounded-xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {enrollLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{enrollment ? 'Continue' : (course.slug === 'summer-camp-2026' ? 'Reserve Your Seat' : 'Enroll Now')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

