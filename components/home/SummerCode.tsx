'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Code2, Bot, Users, Award, Calendar, Clock, MapPin, Users2 } from 'lucide-react';
import { motion } from 'framer-motion';

const featureCards = [
  { Icon: Code2, title: 'Fun Projects', sub: '& Real Skills' },
  { Icon: Bot,   title: 'AI, Robotics', sub: '& More' },
  { Icon: Users, title: 'Make Friends', sub: '& Collaborate' },
  { Icon: Award, title: 'Certificate',  sub: 'of Completion' },
];

const stats = [
  { Icon: Calendar, label: 'AGES',     value: '10–18' },
  { Icon: Clock,    label: 'DURATION', value: '1–4 Weeks' },
  { Icon: MapPin,   label: 'LOCATION', value: 'Online' },
];

export default function SummerCode() {
  return (
    /* Full-viewport-width section — no horizontal padding, flush against edges */
    <section className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full overflow-hidden"
        style={{ minHeight: 480 }}
      >
        {/* ── Campsite background image ── */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1800&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 60%',
          }}
        />

        {/* ── Navy gradient overlays ── */}
        {/* Left-heavy overlay so text is always readable */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(105deg, #0a1a5e 0%, #0d2478 28%, #0f2d8acc 50%, rgba(14,38,120,0.75) 65%, rgba(14,38,120,0.30) 82%, transparent 100%)',
          }}
        />
        {/* Bottom darkening */}
        <div
          className="absolute inset-0 z-[1]"
          style={{ background: 'linear-gradient(to top, rgba(6,12,42,0.65) 0%, transparent 40%)' }}
        />

        {/* ── Circular Stamp Badge ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.55, ease: 'easeOut' }}
          className="absolute top-6 right-10 z-20 hidden md:block"
        >
          {/*
            Circle center: (100,100), viewBox 200x200
            Outer border radius: 95
            Arc text radius: 80 → path from (20,100) arc to (180,100) over top
          */}
          <svg width="190" height="190" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Top arc: left midpoint → over top → right midpoint, r=80 */}
              <path id="sc-top-arc" d="M 20,100 A 80,80 0 0,1 180,100" />
            </defs>

            {/* Dark fill */}
            <circle cx="100" cy="100" r="96" fill="rgba(6,14,58,0.60)" />
            {/* Outer white border */}
            <circle cx="100" cy="100" r="96" stroke="white" strokeWidth="2.5" fill="none" />
            {/* Inner subtle ring */}
            <circle cx="100" cy="100" r="88" stroke="rgba(255,255,255,0.20)" strokeWidth="1" fill="none" />

            {/* ── Curved top text ── */}
            <text
              fill="white"
              fontSize="11.5"
              fontWeight="800"
              fontFamily="ui-sans-serif,system-ui,-apple-system,sans-serif"
              letterSpacing="2.8"
            >
              <textPath href="#sc-top-arc" startOffset="50%" textAnchor="middle">
                LEARN · BUILD · INNOVATE
              </textPath>
            </text>

            {/* ── Mountain icon ── */}
            {/* Left mountain (taller) */}
            <polygon
              points="88,48 65,88 111,88"
              stroke="#FBBF24" strokeWidth="2.5" strokeLinejoin="round" fill="rgba(6,14,58,0.3)"
            />
            {/* Right mountain (shorter, overlapping) */}
            <polygon
              points="108,60 92,88 124,88"
              stroke="#FBBF24" strokeWidth="2" strokeLinejoin="round" fill="rgba(6,14,58,0.3)"
            />
            {/* Sun — above left peak */}
            <circle cx="71" cy="53" r="6" fill="#FBBF24" />
            {/* Sun rays */}
            <line x1="71" y1="43" x2="71" y2="40" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>
            <line x1="79" y1="46" x2="81" y2="44" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>
            <line x1="63" y1="46" x2="61" y2="44" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>
            <line x1="83" y1="53" x2="86" y2="53" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>
            <line x1="56" y1="53" x2="59" y2="53" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>

            {/* ── SUMMER ── */}
            <text
              x="100" y="128"
              textAnchor="middle"
              fill="white"
              fontSize="30"
              fontWeight="900"
              fontFamily="ui-sans-serif,system-ui,-apple-system,sans-serif"
              letterSpacing="2"
            >SUMMER</text>

            {/* ── OF POSSIBILITIES ── */}
            <text
              x="100" y="150"
              textAnchor="middle"
              fill="rgba(255,255,255,0.82)"
              fontSize="10.5"
              fontWeight="700"
              fontFamily="ui-sans-serif,system-ui,-apple-system,sans-serif"
              letterSpacing="3"
            >OF POSSIBILITIES</text>
          </svg>
        </motion.div>

        {/* ── Content ── */}
        {/* Constrain text to 1280px max but keep bg edge-to-edge */}
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-16 py-14 lg:py-20">

          {/* SARTHI pill */}
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 border border-white/25 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-7"
          >
            <Code2 size={13} className="text-[#FBBF24]" />
            <span className="text-white text-[11px] font-black uppercase tracking-[3px]">SARTHI</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mb-5"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.02] tracking-tight"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
              SARTHI
            </h2>
            <div className="flex items-center gap-4 flex-wrap mt-1">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#FBBF24] leading-[1.02] tracking-tight"
                  style={{ textShadow: '0 2px 30px rgba(251,191,36,0.5)' }}>
                Summer Camp
              </h2>
              <span className="text-4xl lg:text-5xl" style={{ filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.9))' }}>
                ☀️
              </span>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            className="text-white/75 text-base sm:text-lg leading-relaxed max-w-md mb-9 font-medium"
          >
            A hands-on summer experience for young innovators to{' '}
            <span className="text-[#FBBF24] font-bold">build</span>,{' '}
            <span className="text-white font-bold">create</span>, and{' '}
            <span className="text-[#FBBF24] font-bold">explore</span> the future of technology.
          </motion.p>
          {/* Feature grids removed */}

          {/* CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.33 }}
            className="flex flex-wrap items-center gap-6"
          >
            <div
              className="inline-flex items-center gap-3.5 font-black text-[15px] px-8 py-3.5 rounded-2xl cursor-default"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <span>🔒 Camp Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-[10px] font-black uppercase tracking-[2px]">
                Summer Camp 2026 has concluded. See you next year!
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
