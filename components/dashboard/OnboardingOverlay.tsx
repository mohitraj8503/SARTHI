'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Target, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  X,
  ArrowRight
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface OnboardingOverlayProps {
  userName?: string;
  onComplete: () => void;
}

const slides = [
  {
    id: 'welcome',
    title: 'Welcome to SARTHI',
    description: (name: string) => `Hello, ${name || 'Explorer'}. Your path to mastery begins here. We've prepared a cinematic experience for you.`,
    icon: Sparkles,
    color: 'from-emerald-400 to-cyan-400',
  },
  {
    id: 'smart-learning',
    title: 'Smart Learning',
    description: () => 'Your AI-powered learning path, synthesized daily to keep you at the edge of technology.',
    icon: Target,
    color: 'from-purple-400 to-pink-400',
  },
  {
    id: 'premium-ecosystem',
    title: 'Premium Ecosystem',
    description: () => 'Access high-end courses, exclusive community, and expert mentorship in one unified space.',
    icon: Zap,
    color: 'from-orange-400 to-amber-400',
  },
  {
    id: 'mastery',
    title: 'Real-world Mastery',
    description: () => 'Move from theory to production-ready skills with hands-on projects and real-world scenarios.',
    icon: CheckCircle2,
    color: 'from-blue-400 to-indigo-400',
  }
];

export default function OnboardingOverlay({ userName, onComplete }: OnboardingOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleNext = () => {
    triggerHaptic('light');
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    triggerHaptic('medium');
    handleComplete();
  };

  const handleComplete = async () => {
     setIsFinishing(true);
     triggerHaptic('success');
     
     try {
       await fetch('/api/onboarding/complete', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ skipped: currentSlide < slides.length - 1 })
       });
     } catch (err) {
       console.error('Failed to mark onboarding as complete:', err);
     } finally {
       onComplete();
     }
  };

  return (
    <AnimatePresence>
      {!isFinishing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden bg-black/40 backdrop-blur-md"
        >
          {/* Main Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]"
          >
            {/* Background cinematic glow */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className={cn(
                "absolute -top-[20%] -right-[20%] w-[60%] h-[60%] blur-[120px] opacity-30 bg-gradient-to-br transition-all duration-1000",
                slides[currentSlide].color
              )} 
            />
            
            <div className="relative p-8 md:p-12 flex flex-col items-center text-center">
              {/* Skip Button */}
              <button 
                onClick={handleSkip}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all group"
                aria-label="Skip onboarding"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Icon Container */}
              <motion.div 
                key={`icon-${currentSlide}`}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-lg bg-gradient-to-br",
                  slides[currentSlide].color
                )}
              >
                {React.createElement(slides[currentSlide].icon, { className: "w-10 h-10 text-white", strokeWidth: 2.5 })}
              </motion.div>

              {/* Content */}
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 max-w-md"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-lg text-white/70 font-medium leading-relaxed">
                  {slides[currentSlide].description(userName || '')}
                </p>
              </motion.div>

              {/* Progress Dots */}
              <div className="flex gap-2.5 mt-12 mb-8">
                {slides.map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      i === currentSlide ? "w-8 bg-white" : "w-1.5 bg-white/20"
                    )}
                  />
                ))}
              </div>

              {/* Primary Action */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className={cn(
                  "group relative w-full h-[64px] rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-500 shadow-xl overflow-hidden",
                  currentSlide === slides.length - 1 
                    ? "bg-white text-black hover:shadow-white/20" 
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                )}
              >
                {currentSlide === slides.length - 1 ? (
                  <>
                    <span>Enter Dashboard</span>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </>
                ) : (
                  <>
                    <span>Next Phase</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>

              <p className="mt-6 text-sm text-white/40 font-medium tracking-wide flex items-center gap-2">
                <Zap size={12} />
                THE NEXT EVOLUTION OF LEARNING
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

