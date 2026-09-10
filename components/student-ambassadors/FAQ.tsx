'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    question: 'What does a SARTHI Student Ambassador do?',
    answer: 'Student Ambassadors act as the primary liaison between SARTHI and their college. You will lead workshops, run coding/AI events, share technical articles, organize hackathons, and help your college peers learn modern production development skills.',
  },
  {
    question: 'How long is the Ambassador program duration?',
    answer: 'The program is typically a 1-year commitment, matching the academic calendar. Active and high-performing ambassadors can be renewed for another year or promoted to regional leads.',
  },
  {
    question: 'Is this a paid or voluntary position?',
    answer: 'This is a voluntary campus leadership role. However, it comes with high-value perks including fully sponsored local event budgets, premium merchandise/swag, free premium platform subscriptions, certification vouchers, and direct access to internship and full-time hiring pools.',
  },
  {
    question: 'How much time do I need to commit weekly?',
    answer: 'We recommend about 4 to 6 hours per week. This includes organizing occasional events, attending monthly cohort syncs, and communicating with peers on campus.',
  },
  {
    question: 'Can students from any field of study apply?',
    answer: 'Yes! While most ambassadors have a CS/IT/Engineering background, we welcome students from all degrees (including Design, Business, and Arts) who are passionate about tech and building communities.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFAQ = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="py-24 px-6 bg-[#FCFBF8] border-t border-[#ECECEC]">
      <div className="container mx-auto max-w-[800px]">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">Frequently Asked Questions</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#111111] mt-2 tracking-tight">
            Have any{' '}
            <span className="text-[#16A34A]">
              Questions?
            </span>
          </h2>
        </div>

        {/* Accordion list */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIdx === index;
            return (
              <div
                key={index}
                className="bg-white border border-[#ECECEC] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#16A34A]/30"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left font-semibold text-[#111111] text-base md:text-lg focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-[#FCFBF8] border border-[#ECECEC] flex items-center justify-center text-[#16A34A] transition-colors">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 text-[#6B7280] text-sm leading-relaxed border-t border-[#ECECEC] pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
