'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    num: 'QUESTION 01',
    question: 'Who can apply for the Internship?',
    answer: "Any current college student or recent graduate with a genuine interest in digital marketing, advertising, content, design, or video — no matter your degree background. We've had BBA, B.Com, B.Tech, and even Psychology students thrive here. What matters most is initiative, not your transcript.",
  },
  {
    num: 'QUESTION 02',
    question: 'Do I need prior experience?',
    answer: "No. We look for potential and hustle, not a resume full of internships. If you've made content for fun, run a small Instagram page, edited a few reels, or just love the craft — that counts.",
  },
  {
    num: 'QUESTION 03',
    question: 'Is the internship paid?',
    answer: "Top performers unlock performance-based stipends as they progress through the Alpha, Beta, and Gold milestones. It's merit-based, not a flat stipend from day one — the better you perform, the more you unlock.",
  },
  {
    num: 'QUESTION 04',
    question: 'Will I work on real client projects?',
    answer: "Real projects, from week one. You'll be running actual ad campaigns, writing content that goes live, designing posters/reels used in real promotions, and getting real feedback from mentors — not dummy assignments sitting in a folder no one reads.",
  },
  {
    num: 'QUESTION 05',
    question: 'No strong portfolio — should I apply?',
    answer: 'Yes. This program exists specifically to help you build that portfolio. Show us your willingness to learn and create — the Statement of Purpose in your application is where that comes through.',
  },
];

export default function InternshipFAQ() {
  // Initially null so all 5 cards start equal/unopened in vertical orientation
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    setOpenIdx((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-24 px-6 md:px-8 bg-[#FCFBF8] border-t border-[#ECECEC]">
      <div className="container mx-auto max-w-[1500px]">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[11px] font-bold uppercase tracking-widest text-[#16A34A]">
            FAQ
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#1A3C2E] tracking-tight">
            Frequently Asked <span className="text-[#16A34A]">Questions.</span>
          </h2>
        </div>

        {/* PresenceX Layout: Flex Container for dynamic shrink/expand transition */}
        <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[500px] w-full">
          {FAQS.map((faq, index) => {
            const isOpen = openIdx === index;
            const hasAnyOpen = openIdx !== null;

            return (
              <motion.div
                key={faq.num}
                onClick={() => handleCardClick(index)}
                layout
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`relative rounded-[32px] p-6 cursor-pointer flex flex-col justify-between overflow-hidden select-none transition-colors duration-500 ${
                  isOpen
                    ? 'flex-[2.5] bg-[#1B4332] text-white shadow-xl ring-2 ring-[#2D6A4F]'
                    : hasAnyOpen
                    ? 'flex-[0.85] bg-[#F0F7F4] hover:bg-[#E2F0EA] text-[#1A3C2E] border border-[#D0E6DC]'
                    : 'flex-1 bg-[#F0F7F4] hover:bg-[#E2F0EA] text-[#1A3C2E] border border-[#D0E6DC]'
                }`}
              >
                {/* Card Top Row: Question Label & Animated Plus/Minus */}
                <div className="flex items-center justify-between z-10 w-full shrink-0">
                  <span
                    className={`text-[11px] font-mono font-extrabold tracking-wider ${
                      isOpen ? 'text-emerald-300' : 'text-[#2D6A4F]/80'
                    }`}
                  >
                    {faq.num}
                  </span>

                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(index);
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    aria-label={isOpen ? 'Collapse Question' : 'Expand Question'}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isOpen
                        ? 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                        : 'bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20 border border-[#16A34A]/20'
                    }`}
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </motion.button>
                </div>

                {/* Card Body */}
                <div className="my-auto z-10 w-full h-full flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {isOpen ? (
                      /* OPEN STATE: Horizontal Layout with Title & Full Answer */
                      <motion.div
                        key="open"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-4 md:space-y-6 text-left py-2 md:py-4"
                      >
                        <h3 className="text-lg md:text-2xl font-extrabold leading-snug tracking-tight text-white">
                          {faq.question}
                        </h3>
                        <div className="pt-3 md:pt-4 border-t border-emerald-800/60">
                          <p className="text-[11px] md:text-sm font-bold uppercase tracking-wider text-emerald-400 mb-1.5 md:mb-2">
                            Question Answer:
                          </p>
                          <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-medium">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      /* CLOSED STATE: Horizontal text on Mobile, Vertical text on Desktop */
                      <motion.div
                        key="closed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="h-full flex items-center md:items-end justify-start pt-3 md:pt-8 pb-2 md:pb-4 text-left"
                      >
                        {/* Desktop & Mobile Title (Standard Horizontal Text) */}
                        <h3 className="text-sm md:text-base font-bold text-[#1A3C2E] tracking-tight leading-snug line-clamp-3">
                          {faq.question}
                        </h3>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subtle Background Glow for Active Card */}
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -bottom-10 -right-10 w-44 h-44 bg-[#40916C]/25 rounded-full blur-2xl pointer-events-none"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
