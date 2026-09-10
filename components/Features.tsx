'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Features() {
  return (
    <section className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Title Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center mb-14 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#f0a535]" />
            <span className="text-[13px] font-bold tracking-[0.18em] uppercase text-[#606b68]">
              Why Us
            </span>
          </div>
          <h2 className="text-[38px] sm:text-[50px] lg:text-[56px] font-bold text-[#0c211d] tracking-tight font-instrument">
            Why SARTHI
          </h2>
        </motion.div>

        {/* Why Area: Left Cards, Center 3D Robot, Right Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-12 xl:gap-16">
          {/* Left Cards */}
          <div className="flex flex-col gap-10 sm:gap-12 max-w-md mx-auto lg:mx-0">
            {/* Card 1: Verified Certification */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-start text-left group"
            >
              <div className="w-14 h-14 mb-6 flex items-center justify-start">
                <img
                  src="/images/why-icon-01.svg"
                  alt="Verified Certification"
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="text-[22px] sm:text-[24px] font-bold text-[#0c211d] font-instrument mb-3">
                Verified Certification
              </h3>
              <p className="text-[15px] sm:text-[16px] text-[#606b68] leading-relaxed font-normal">
                Earn recognized certificates on successful course and assessment completion.
              </p>
            </motion.div>

            <div className="w-full h-[1px] bg-[#ced3d2]/70" />

            {/* Card 2: Competency Mapping */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col items-start text-left group"
            >
              <div className="w-14 h-14 mb-6 flex items-center justify-start">
                <img
                  src="/images/why-icon-02.svg"
                  alt="Competency Mapping"
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="text-[22px] sm:text-[24px] font-bold text-[#0c211d] font-instrument mb-3">
                Competency Mapping
              </h3>
              <p className="text-[15px] sm:text-[16px] text-[#606b68] leading-relaxed font-normal">
                Identify the right trainers and learning paths mapped to your subject expertise.
              </p>
            </motion.div>
          </div>

          {/* Center 3D Green Robot Video */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="flex justify-center items-center my-4 lg:my-0 order-first lg:order-none"
          >
            <div className="w-[300px] sm:w-[380px] lg:w-[420px] max-w-full rounded-2xl overflow-hidden flex items-center justify-center">
              <video
                autoPlay
                loop
                muted
                playsInline
                poster="/images/why-video-poster-00001.jpg"
                className="w-full h-auto object-contain rounded-2xl"
              >
                <source src="/images/why-video-transcode.mp4" type="video/mp4" />
                <source src="/images/why-video-transcode.webm" type="video/webm" />
              </video>
            </div>
          </motion.div>

          {/* Right Cards */}
          <div className="flex flex-col gap-10 sm:gap-12 max-w-md mx-auto lg:mx-0 lg:ml-auto">
            {/* Card 3: Expert Trainers */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-start lg:items-end text-left lg:text-right group"
            >
              <div className="w-14 h-14 mb-6 flex items-center justify-start lg:justify-end">
                <img
                  src="/images/why-icon-03.svg"
                  alt="Expert Trainers"
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="text-[22px] sm:text-[24px] font-bold text-[#0c211d] font-instrument mb-3">
                Expert Trainers
              </h3>
              <p className="text-[15px] sm:text-[16px] text-[#606b68] leading-relaxed font-normal">
                Learn from IMD&apos;s experienced trainers through recorded lectures and live sessions.
              </p>
            </motion.div>

            <div className="w-full h-[1px] bg-[#ced3d2]/70" />

            {/* Card 4: Structured Assessments */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col items-start lg:items-end text-left lg:text-right group"
            >
              <div className="w-14 h-14 mb-6 flex items-center justify-start lg:justify-end">
                <img
                  src="/images/why-icon-04.svg"
                  alt="Structured Assessments"
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="text-[22px] sm:text-[24px] font-bold text-[#0c211d] font-instrument mb-3">
                Structured Assessments
              </h3>
              <p className="text-[15px] sm:text-[16px] text-[#606b68] leading-relaxed font-normal">
                Subject-wise MCQ assessments track and validate your domain progress.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
