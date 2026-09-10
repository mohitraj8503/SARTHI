'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Star, CheckCircle2, ArrowRight, Sparkles, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

const POINTER_OPTIONS = [
  'Design & UI',
  'Website Speed',
  'Navigation',
  'Courses',
  'Mobile Experience',
  'Content',
  'Other',
];

export default function FeedbackWidget() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [selectedPointers, setSelectedPointers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>(''); // Anti-spam honeypot
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Auto-fill logged-in user details
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Listen for fullscreen or explicit video player state events (do NOT hide on ambient background videos)
  useEffect(() => {
    const checkIsVideoPlaying = () => {
      if (typeof document === 'undefined') return false;
      const bodyHasClass = document.body.classList.contains('video-playing') || document.body.classList.contains('exam-focus-mode');
      const isFullscreen = !!document.fullscreenElement;
      return bodyHasClass || isFullscreen;
    };

    const handleStateEvent = (e: CustomEvent<{ isPlaying: boolean }>) => {
      const playing = e.detail?.isPlaying ?? checkIsVideoPlaying();
      setIsVideoPlaying(playing);
    };

    const handleFullscreenChange = () => {
      setIsVideoPlaying(checkIsVideoPlaying());
    };

    window.addEventListener('video-play-state' as any, handleStateEvent);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Initial check
    setIsVideoPlaying(checkIsVideoPlaying());

    return () => {
      window.removeEventListener('video-play-state' as any, handleStateEvent);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePointer = (pointer: string) => {
    setSelectedPointers((prev) =>
      prev.includes(pointer) ? prev.filter((p) => p !== pointer) : [...prev, pointer]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setErrorMsg('Please tell us what you liked or what we should improve.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/support/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          pointers: selectedPointers,
          feedback,
          email: user?.email || email,
          website_hp: honeypot, // Honeypot trap
          page: pathname || '/',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setIsSuccess(true);
      triggerHaptic('success');

      // Auto close modal after showing success state for 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        // Reset state after transition completes
        setTimeout(() => {
          setIsSuccess(false);
          setFeedback('');
          setSelectedPointers([]);
          setRating(5);
        }, 300);
      }, 2200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Trigger Button (Desktop & Mobile safe placement) */}
      {!isVideoPlaying && (
        <div className="flex fixed right-4 sm:right-6 bottom-24 lg:bottom-8 lg:right-[108px] z-[1000] items-center">
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Share Feedback"
              onClick={() => {
                triggerHaptic('light');
                setIsOpen((prev) => !prev);
              }}
              className={cn(
                "h-11 lg:h-[64px] rounded-full px-3.5 lg:px-5 flex items-center gap-2 lg:gap-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.35)] border-2 lg:border-[4px] border-black transition-all duration-300 cursor-pointer text-white font-bold text-xs lg:text-sm select-none",
                isOpen
                  ? "bg-stone-900 border-[#FF8A00]"
                  : "bg-black/90 hover:bg-black backdrop-blur-xl border-black"
              )}
            >
              <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-[#FF8A00] transition-transform group-hover:scale-110" />
              <span className="font-extrabold tracking-wide text-white text-xs lg:text-[14px]">
                Feedback
              </span>
            </motion.button>

            {/* Desktop Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block pointer-events-none z-20 whitespace-nowrap">
              <div className="bg-black/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-white/10 shadow-lg backdrop-blur-md">
                Share Feedback 💬
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Dark Glass Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-lg bg-[#0F172A] border border-white/15 rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.7)] text-white overflow-hidden z-10"
            >
              {/* Top Accent Gradient Header */}
              <div className="h-2 w-full bg-gradient-to-r from-[#FF8A00] via-amber-500 to-[#138808]" />

              <div className="p-6 sm:p-8">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      Share your feedback <span className="text-xl">💬</span>
                    </h3>
                    <p className="text-sm text-stone-400 font-medium mt-1">
                      Help us improve SARTHI.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isSuccess ? (
                  /* Success Notification State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="w-10 h-10 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black text-white">
                        ✓ Thanks for helping us improve SARTHI.
                      </h4>
                      <p className="text-sm text-stone-400 font-medium">
                        Your feedback has been delivered directly to our engineering team.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* Feedback Form */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Honeypot Spam Protection Field (Hidden) */}
                    <input
                      type="text"
                      name="website_hp"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    {/* 1. Rating Stars */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-amber-400 mb-3">
                        How would you rate the website?
                      </label>
                      <div className="flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setRating(star);
                            }}
                            className={cn(
                              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 cursor-pointer active:scale-95",
                              star <= rating
                                ? "text-amber-400 scale-105"
                                : "text-stone-600 hover:text-stone-400"
                            )}
                          >
                            <Star
                              className={cn(
                                "w-7 h-7 sm:w-8 sm:h-8 transition-transform",
                                star <= rating ? "fill-amber-400 stroke-amber-500" : "stroke-stone-500"
                              )}
                            />
                            <span className="text-[11px] font-bold">{star} ⭐</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Pointers Checkboxes */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-stone-300 mb-3">
                        What could we improve?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {POINTER_OPTIONS.map((option) => {
                          const isSelected = selectedPointers.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => togglePointer(option)}
                              className={cn(
                                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95",
                                isSelected
                                  ? "bg-[#FF8A00] text-black border-[#FF8A00] shadow-[0_4px_12px_rgba(255,138,0,0.3)]"
                                  : "bg-white/5 text-stone-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                              )}
                            >
                              {isSelected ? '✓ ' : '☐ '}
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Feedback Textarea */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-stone-300 mb-2">
                        Your feedback <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us what you liked or what we should improve..."
                        className="w-full bg-white/5 border border-white/10 focus:border-[#FF8A00] rounded-2xl p-4 text-sm text-white placeholder:text-stone-500 focus:outline-none transition-all resize-none font-medium"
                      />
                    </div>

                    {/* 4. Optional Email Field */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-stone-300 mb-2">
                        Your email <span className="text-stone-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        value={user?.email || email}
                        disabled={!!user?.email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={cn(
                          "w-full bg-white/5 border border-white/10 focus:border-[#FF8A00] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:outline-none transition-all font-medium",
                          user?.email && "opacity-70 cursor-not-allowed bg-white/[0.02]"
                        )}
                      />
                      {user && (
                        <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                          ✓ Auto-filled from logged in account ({user.name})
                        </span>
                      )}
                    </div>

                    {errorMsg && (
                      <div className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                        {errorMsg}
                      </div>
                    )}

                    {/* Modal Bottom Action Row */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-5 py-2.5 rounded-full text-xs font-bold text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !feedback.trim()}
                        className="px-6 py-2.5 rounded-full text-xs font-black bg-gradient-to-r from-[#FF8A00] to-amber-500 hover:brightness-110 text-black shadow-[0_6px_20px_rgba(255,138,0,0.3)] disabled:opacity-50 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
