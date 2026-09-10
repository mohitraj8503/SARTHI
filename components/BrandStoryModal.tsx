'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BrandStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrandStoryModal({ isOpen, onClose }: BrandStoryModalProps) {
  const [isLogoRotating, setIsLogoRotating] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black backdrop-blur-[18px]"
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Modal Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.94, y: 20, filter: "blur(12px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[760px] bg-white/[0.98] dark:bg-[#0D0F12]/[0.98] rounded-[28px] shadow-[0_40px_120px_rgba(0,0,0,0.3)] border border-black/[0.04] dark:border-white/[0.04] p-5 md:p-12 flex flex-col gap-6 relative overflow-hidden backdrop-blur-3xl z-10 select-none text-left my-4 md:my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 rounded-full flex items-center justify-center bg-black/[0.02] hover:bg-black/[0.06] dark:bg-white/[0.02] dark:hover:bg-white/[0.06] transition-all duration-300 hover:rotate-90 border border-black/[0.04] dark:border-white/[0.04] group cursor-pointer z-20"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
            </button>

            {/* Header and Integrated Text Logo */}
            <div className="flex items-center gap-4 md:gap-6 relative border-b border-black/[0.04] dark:border-white/[0.04] pb-6 pr-10">
              {/* Orbital slow glow */}
              <div className="absolute -left-4 w-[120px] h-[120px] rounded-full bg-[#16A34A]/[0.05] dark:bg-[#16A34A]/[0.08] blur-[25px] animate-pulse" />

              {/* Main Logo Emblem Container */}
              <motion.div
                animate={{
                  y: [0, -4, 0],
                  scale: [1, 1.03, 1],
                  rotateY: isLogoRotating ? 180 : 0
                }}
                transition={{
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                  rotateY: { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                }}
                onClick={() => setIsLogoRotating(!isLogoRotating)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.setProperty('--logo-x', `${x}px`);
                  e.currentTarget.style.setProperty('--logo-y', `${y}px`);
                }}
                style={{
                  background: `radial-gradient(80px circle at var(--logo-x, 50%) var(--logo-y, 50%), rgba(22,163,74,0.06), transparent)`
                }}
                className="relative w-14 h-14 md:w-20 md:h-20 rounded-[14px] md:rounded-2xl flex items-center justify-center border border-black/[0.06] dark:border-white/[0.08] bg-white/[0.8] dark:bg-white/[0.03] shadow-sm backdrop-blur-xl group overflow-hidden flex-shrink-0 cursor-pointer"
              >
                {/* Light Sweep */}
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
                  className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/[0.3] dark:via-white/[0.1] to-transparent pointer-events-none"
                />

                <div className="flex items-center justify-center font-black select-none text-base md:text-xl tracking-tight">
                  <span className="text-[#FF8A00]">SAR</span>
                  <span className="text-[#16A34A]">THI</span>
                </div>
              </motion.div>

              <div className="flex flex-col gap-1 z-10">
                <span className="text-[26px] md:text-[34px] font-black tracking-tight text-black dark:text-white leading-none select-none">
                  <span className="text-[#FF8A00]">SAR</span>
                  <span className="text-[#16A34A]">THI</span>
                </span>
                <span className="text-[12px] md:text-[14px] font-bold tracking-wide text-[#16A34A] uppercase">
                  Capacity Connect &bull; Skill Building Platform
                </span>
              </div>
            </div>

            {/* Brand Story Copy */}
            <div className="flex flex-col justify-between max-h-[50vh] md:max-h-[500px] overflow-y-auto pr-1.5 scrollbar-thin">
              <div>
                {/* Philosophy Motto Quote */}
                <div className="flex flex-col gap-1.5 pb-6 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                    Our core belief
                  </span>
                  <p className="text-[15.5px] font-semibold text-gray-700 dark:text-zinc-300 leading-relaxed italic">
                    {`"A true Sarthi doesn't fight the battle for you — it illuminates the path, instills confidence, and guides you to victory."`}
                  </p>
                </div>

                {/* Complete Explanation Sections */}
                <div className="mt-6 flex flex-col gap-6 text-[14px] leading-relaxed text-gray-600 dark:text-zinc-400">

                  {/* SECTION 1 */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[14.5px] font-bold text-black dark:text-white uppercase tracking-wider text-xs">
                      01. The Essence of SARTHI (सारथी — The Eternal Guide)
                    </span>
                    <p>
                      In Indian heritage, <span className="font-extrabold text-black dark:text-white">&quot;SARTHI&quot;</span> embodies the trusted mentor and charioteer who steers the seeker through complexity toward purposeful mastery.
                    </p>
                    <p>
                      • <span className="font-bold text-black dark:text-white">Guidance Over Guesswork:</span> We replace fragmented learning with structured roadmaps, high-bandwidth mentorship, and industry-calibrated technical standards.
                    </p>
                    <p>
                      • <span className="font-bold text-black dark:text-white">Atmanirbhar Vision:</span> Dedicated to building self-reliant technical capability across India, bridging classroom theory with real-world engineering ecosystems.
                    </p>
                  </div>

                  {/* SECTION 2 */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[14.5px] font-bold text-black dark:text-white uppercase tracking-wider text-xs">
                      02. Dual-Color Architecture (Saffron &amp; Emerald)
                    </span>
                    <p>
                      The typographic harmony of Orange and Green represents the synergy between vital energy and sustainable growth.
                    </p>
                    <p>
                      • <span className="font-bold text-black dark:text-white">SAR (#FF8A00 — Saffron Energy):</span> Symbolizes Courage, Initiative, Innovation, and the creative spark of India&apos;s youth. It is the fire to explore, build, and solve national challenges.
                    </p>
                    <p>
                      • <span className="font-bold text-black dark:text-white">THI (#16A34A — Emerald Growth):</span> Represents Stability, Prosperity, Scalability, and Viksit Bharat. It embodies production-ready code, enduring mastery, and grounded execution.
                    </p>
                  </div>

                  {/* SECTION 3 */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[14.5px] font-bold text-black dark:text-white uppercase tracking-wider text-xs">
                      03. Capacity Connect &amp; Borderless Reach
                    </span>
                    <p>
                      • <span className="font-bold text-black dark:text-white">Inclusive Access:</span> Democratizing cutting-edge technical education for students, interns, and aspiring engineers across tier-1, tier-2, and rural institutions alike.
                    </p>
                    <p>
                      • <span className="font-bold text-black dark:text-white">Practical Excellence:</span> Focused on production workflows, hands-on architectures, and verifiable credentials aligned with NEP 2020 and Industry 4.0.
                    </p>
                  </div>

                  {/* FINAL SECTION */}
                  <div className="flex flex-col gap-2 border-t border-black/[0.06] dark:border-white/[0.06] pt-4">
                    <span className="text-[14.5px] font-bold text-black dark:text-white uppercase tracking-wider text-xs">
                      Visualizing The Future
                    </span>
                    <p>
                      The SARTHI identity represents the guiding force behind India&apos;s next generation of builders:
                    </p>
                    <p className="font-medium text-black dark:text-white">
                      <span className="text-[#FF8A00] font-bold">SAR (Energy &amp; Resolve):</span> The catalytic drive to begin and innovate.
                    </p>
                    <p className="font-medium text-black dark:text-white">
                      <span className="text-[#16A34A] dark:text-[#22C55E] font-bold">THI (Growth &amp; Mastery):</span> The steadfast discipline to build lasting solutions.
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-zinc-200 mt-1 leading-relaxed">
                      Together, SARTHI stands as your dedicated companion on the journey from learner to industry-ready engineer.
                    </p>
                  </div>

                </div>

              </div>

              {/* Footer text */}
              <div className="mt-8 text-[11px] font-medium text-gray-400 dark:text-zinc-500 tracking-wide pt-4 border-t border-black/[0.03] dark:border-white/[0.03]">
                Designed for Bharat&apos;s builders. Built for the future.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
