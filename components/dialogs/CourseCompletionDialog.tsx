'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Linkedin, Share2, ArrowRight, Trophy, X, ExternalLink, Star } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import Link from 'next/link';

interface CourseCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseSlug: string;
  certificateUrl?: string;
}

export default function CourseCompletionDialog({
  isOpen,
  onClose,
  courseTitle,
  courseSlug,
  certificateUrl = '/dashboard/certificates',
}: CourseCompletionDialogProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const linkedInShareText = encodeURIComponent(
    `🎓 I just completed "${courseTitle}" on SARTHI! Thrilled to add this to my skills. #SARTHI #LearningNeverStops`
  );
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://sarthi-woad.vercel.app')}&summary=${linkedInShareText}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${linkedInShareText}&url=${encodeURIComponent('https://sarthi-woad.vercel.app')}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti layer */}
          <div className="fixed inset-0 z-[150] pointer-events-none">
            <Confetti
              width={width}
              height={height}
              recycle={showConfetti}
              numberOfPieces={showConfetti ? 500 : 0}
              gravity={0.15}
              colors={['#1A3C2E', '#2D6A4F', '#D4956A', '#f59e0b', '#22c55e', '#ffffff']}
            />
          </div>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[101] bg-brand-dark/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[102] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
              className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto border border-[#E8E2D9] relative"
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Hero */}
              <div className="bg-gradient-to-br from-[#1A3C2E] to-[#2D6A4F] p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="w-64 h-64 bg-[#D4956A] rounded-full blur-[80px] absolute -top-16 -right-16" />
                  <div className="w-48 h-48 bg-white rounded-full blur-[60px] absolute bottom-0 left-0" />
                </div>

                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
                  className="w-24 h-24 bg-[#D4956A] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl relative z-10"
                >
                  <Trophy className="w-12 h-12 text-white" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative z-10"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 mb-4">
                    <Star className="w-3 h-3 text-[#D4956A] fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Course Mastered</span>
                    <Star className="w-3 h-3 text-[#D4956A] fill-current" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
                    You Did It! 🎉
                  </h2>
                  <p className="text-white/70 text-sm font-medium max-w-xs mx-auto leading-relaxed">
                    You&apos;ve completed <span className="text-white font-bold">{courseTitle}</span>. Your certificate is being prepared.
                  </p>
                </motion.div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* XP Earned */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Rewards Unlocked</p>
                    <p className="text-2xl font-black text-[#1A3C2E]">+100 XP & Certificate</p>
                  </div>
                  <Award className="w-10 h-10 text-[#D4956A]" />
                </motion.div>

                {/* Share buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <p className="text-[10px] font-black text-[#5D705C] uppercase tracking-widest">Share Your Achievement</p>
                  <div className="flex gap-3">
                    <a
                      href={linkedInShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0077B5] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#006197] transition-all shadow-lg active:scale-95"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                    <a
                      href={twitterShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1DA1F2] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#0c85d0] transition-all shadow-lg active:scale-95"
                    >
                      <Share2 className="w-4 h-4" />
                      Twitter / X
                    </a>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-3 pt-2"
                >
                  <Link
                    href={certificateUrl}
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#1A3C2E] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#D4956A] transition-all shadow-xl active:scale-95"
                  >
                    <Award className="w-4 h-4" />
                    View Certificate
                  </Link>
                  <Link
                    href="/courses"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 px-5 py-4 bg-[#F7F4EF] text-[#1A3C2E] rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#EAE6DF] transition-all border border-[#EAE6DF] active:scale-95"
                  >
                    Next Course
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

