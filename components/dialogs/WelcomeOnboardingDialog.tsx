'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, CheckCircle, ArrowRight, BookOpen, Target, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WelcomeOnboardingDialogProps {
  courseTitle: string;
  courseSlug: string;
  firstLessonId?: string;
}

export default function WelcomeOnboardingDialog({ courseTitle, courseSlug, firstLessonId }: WelcomeOnboardingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only show once per course based on localStorage
    const hasSeenOnboarding = localStorage.getItem(`onboarding_seen_${courseSlug}`);
    if (!hasSeenOnboarding) {
        // slight delay so it doesn't pop immediately
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
    }
  }, [courseSlug]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(`onboarding_seen_${courseSlug}`, 'true');
  };

  const handleStart = () => {
    handleClose();
    if(firstLessonId) {
        // Just reload the page with the lesson ID if not already there, 
        // but typically they are on the learn page. This ensures focus.
         window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-dark/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 py-8 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto border border-[#E8E2D9] relative flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 bg-[#F5F0E8] text-[#5D705C] hover:bg-white hover:text-brand-dark rounded-full transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="bg-brand-dark p-8 md:p-12 text-center relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
                    <Sparkles className="w-8 h-8 text-brand-orange" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white px-8">
                  Welcome to <span className="text-brand-orange">{courseTitle}</span>
                </h2>
                <p className="text-white/70 font-medium mt-3 text-sm max-w-md mx-auto">
                    You&apos;ve made a great decision. Let&apos;s set you up for absolute success.
                </p>
              </div>

              <div className="p-8 md:p-12 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-dark">Set a Goal, Keep Momentum</h4>
                            <p className="text-xs text-[#5D705C] mt-1 font-medium leading-relaxed">
                                Consistency beats intensity. Try to complete one module every day or block out 2 hours every weekend. 
                                Your streak will track your momentum on your dashboard.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-dark">Project-First Learning</h4>
                            <p className="text-xs text-[#5D705C] mt-1 font-medium leading-relaxed">
                                Don&apos;t just watch videos. Code along, take notes, and submit your assignments. 
                                The true value unlocks when you apply what you learn.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <PlayCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-dark">Immersive Focus</h4>
                            <p className="text-xs text-[#5D705C] mt-1 font-medium leading-relaxed">
                                Use the &apos;Zen Toggle&apos; on the video player to eliminate distractions. 
                                We recommend Fullscreen mode for the best conceptual clarity.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-[#E8E2D9]">
                    <button
                        onClick={handleStart}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-brand-dark text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-brand-orange transition-all shadow-xl active:scale-95"
                    >
                        Begin Module 1
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-center text-[10px] uppercase tracking-widest text-[#5D705C] font-bold mt-4">
                        Press Escape to dismiss
                    </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

