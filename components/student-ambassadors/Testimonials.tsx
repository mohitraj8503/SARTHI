'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Aarav Sharma',
    role: 'Lead Ambassador, IIT Delhi',
    quote: 'Being a SARTHI Student Ambassador completely transformed my college journey. I gained leadership skills by hosting 3 hackathons, and the direct mentorship from senior devs helped me land my Software Engineer internship at a top-tier tech firm.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
  },
  {
    name: 'Riya Patel',
    role: 'Ambassador, BITS Pilani',
    quote: 'The community and perks are amazing. The premium swag kit made me a mini-celebrity on campus, but more importantly, the exclusive cloud certification prep courses gave me a real edge in my recruitment interviews.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120',
  },
  {
    name: 'Kabir Mehta',
    role: 'Ambassador, DTU',
    quote: 'Hosting collaborative workshops under SARTHI allowed me to connect with thousands of peers. The public speaking confidence I gained is invaluable. Highly recommend the program to any budding student leader.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
  },
];

export default function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  const nextTestimonial = () => {
    setActiveIdx((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveIdx((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  return (
    <section className="py-24 px-6 bg-white border-t border-[#ECECEC]">
      <div className="container mx-auto max-w-[900px] relative">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">Success Stories</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#111111] mt-2 tracking-tight">
            Hear from Past{' '}
            <span className="text-[#16A34A]">
              Ambassadors
            </span>
          </h2>
        </div>

        {/* Carousel Card */}
        <div className="relative bg-[#FCFBF8] border border-[#ECECEC] rounded-[32px] p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-8 left-8 text-slate-100">
            <Quote className="w-12 h-12 text-[#16A34A]/5" />
          </div>

          <div className="min-h-[220px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-[#4B5563] text-base md:text-lg italic leading-relaxed mb-8 relative z-10">
                  &ldquo;{TESTIMONIALS[activeIdx].quote}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  { }
                  <img
                    src={TESTIMONIALS[activeIdx].avatar}
                    alt={TESTIMONIALS[activeIdx].name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#16A34A]"
                  />
                  <div>
                    <h4 className="font-bold text-[#111111] text-sm md:text-base">
                      {TESTIMONIALS[activeIdx].name}
                    </h4>
                    <p className="text-[#6B7280] text-xs font-medium mt-0.5">
                      {TESTIMONIALS[activeIdx].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Navigation */}
            <div className="flex justify-end gap-3 mt-8 md:mt-0">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center text-[#6B7280] hover:border-[#16A34A] hover:text-[#16A34A] transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center text-[#6B7280] hover:border-[#16A34A] hover:text-[#16A34A] transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
