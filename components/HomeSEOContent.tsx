'use client';

import React from 'react';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown, ChevronUp, Zap, Target, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    question: "How is SARTHI different from others?",
    answer: "Most platforms are excellent for academic exam prep (JEE/NEET). SARTHI is the best alternative for building a real tech career — where your portfolio, GitHub, and job-ready skills like Python and AI matter more than exam marks."
  },
  {
    question: "Is SARTHI better than others for coding in India?",
    answer: "While many platforms offer content, SARTHI offers execution. Our Python AI courses are designed specifically for the Indian job market, providing mentorship and real projects that ensure you actually become job-ready."
  },
  {
    question: "What job-ready skills will I learn at SARTHI?",
    answer: "You will master high-demand tech skills: Python Programming, Artificial Intelligence (AI), Machine Learning (ML), and Full-Stack Engineering — built specifically to help you land roles at top tech firms."
  }
];

export default function HomeSEOContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-24 lg:py-32 bg-[#FAF9F6] border-y border-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header Area */}
        <div className="max-w-4xl mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Image src="/sarthi-logo.png" alt="SARTHI" width={24} height={24} className="w-6 h-6 object-contain" />
            <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-gray-900">
              Tech <span className="text-[#174F3A]">Tomorrow</span>
            </span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-black text-gray-900 font-outfit leading-[1.1] uppercase mb-8">
            The #1 Alternative to <br />
            others for <br />
            <span className="text-[#174F3A]">Real Tech Careers.</span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
            Most platforms focus on exams. <span className="text-[#174F3A] font-bold">We focus on your career.</span> If your goal is to master <span className="text-gray-900 font-bold underline decoration-[#174F3A]/30">Python AI & Software Development</span>, you need more than just lectures — you need execution.
          </p>
        </div>

        {/* Feature Grid: Optimized for SEO & Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          <div className="space-y-6 group">
            <div className="w-12 h-12 rounded-2xl bg-[#174F3A]/5 flex items-center justify-center text-[#174F3A] group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Not Just Exam Prep</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Unlike others, we don&apos;t prepare you for exams. We build <span className="text-[#174F3A] font-medium italic">job-ready portfolios</span> that stand out to recruiters.
              </p>
            </div>
          </div>

          <div className="space-y-6 group">
            <div className="w-12 h-12 rounded-2xl bg-[#174F3A]/5 flex items-center justify-center text-[#174F3A] group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Real World Execution</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                More structured than others. Our <span className="text-[#174F3A] font-medium italic">best Python AI courses</span> include mentorship and production-grade project building.
              </p>
            </div>
          </div>

          <div className="space-y-6 group">
            <div className="w-12 h-12 rounded-2xl bg-[#174F3A]/5 flex items-center justify-center text-[#174F3A] group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Job-Ready Skills</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Master the high-demand tech skills: <span className="font-bold text-gray-700">Python, AI, and Software Engineering</span>. Built to get you hired at top firms, not just certified.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ & CTA Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start border-t border-gray-100 pt-24">
          <div className="space-y-10">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-gray-900 uppercase italic">Common Questions</h3>
              <p className="text-sm font-bold text-[#174F3A]/40 uppercase tracking-widest">SARTHI vs others</p>
            </div>
            <div className="space-y-2">
              {faqData.map((faq, index) => (
                <div key={index} className="border-b border-gray-100 pb-2">
                  <button 
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full py-5 flex items-center justify-between text-left group"
                  >
                    <span className={`text-[15px] font-black uppercase tracking-tight transition-colors italic leading-tight ${openIndex === index ? 'text-[#174F3A]' : 'text-gray-900 group-hover:text-[#174F3A]'}`}>
                      {faq.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIndex === index ? 'bg-[#174F3A] text-white shadow-lg shadow-[#174F3A]/30' : 'bg-gray-100 text-gray-400 group-hover:bg-[#174F3A]/10 group-hover:text-[#174F3A]'}`}>
                      {openIndex === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-600 text-[13px] font-medium pb-8 leading-relaxed border-l-2 border-[#174F3A]/10 pl-5">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-12 lg:p-20 rounded-[3rem] text-center lg:text-left shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#174F3A]/[0.02] blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-gray-900 uppercase mb-6 italic leading-none">Ready to Master <br /><span className="text-[#174F3A]">Real Skills?</span></h3>
              <p className="text-lg text-gray-500 mb-10 font-medium">
                Join thousands of students who are building their futures with real-world tech skills. No exams, just career growth.
              </p>
              <button className="w-full sm:w-auto px-12 py-6 bg-[#174F3A] text-white rounded-2xl font-black text-[14px] uppercase tracking-widest shadow-xl shadow-[#174F3A]/20 hover:shadow-2xl hover:shadow-[#174F3A]/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-4">
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="mt-10 pt-10 border-t border-gray-50 flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#174F3A]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Industry Trusted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#174F3A]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Job Focused</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
