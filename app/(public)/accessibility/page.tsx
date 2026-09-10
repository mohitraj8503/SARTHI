'use client';

import { motion } from 'framer-motion';
import {
  Accessibility, CheckCircle2, Eye, Keyboard, Volume2,
  Monitor, Sparkles, Mail, ArrowRight, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function AccessibilityPage() {
  const lastUpdated = 'September 2026';

  return (
    <div className="relative min-h-screen bg-[#F5F0E8] text-[#1A3C2E] selection:bg-[#2D6A4F] selection:text-white overflow-x-hidden pt-28 pb-20">

      {/* Ambient Backdrop Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-8%] left-[-4%] w-[600px] h-[600px] bg-[#2D6A4F]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-[#E8B84B]/8 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'radial-gradient(#1A3C2E 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }}
        />
      </div>

      <main className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1. HERO SECTION */}
        <section className="pt-10 pb-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#E8F5EE] border border-[#C5D5C0] text-[#2D6A4F] px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[2.5px] mb-6 shadow-sm"
          >
            <Accessibility className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Inclusive Learning For All
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A3C2E] tracking-tight leading-[1.08] mb-6"
          >
            Accessibility <span className="text-[#2D6A4F]">Statement.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#5D705C] text-[16px] sm:text-[17px] leading-[1.65] max-w-[620px] font-medium"
          >
            At SARTHI, education belongs to everyone. We are deeply committed to ensuring our platform, code workspaces, and masterclasses are accessible to learners of all abilities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#2D6A4F] uppercase tracking-wider bg-white/70 border border-[#E8E2D9] px-4 py-1.5 rounded-full"
          >
            <span>Standard: WCAG 2.1 Level AA Target</span>
            <span>•</span>
            <span>Updated: {lastUpdated}</span>
          </motion.div>
        </section>

        {/* 2. CORE VALUES HIGHLIGHT */}
        <section className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-14">
          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(26,60,46,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center text-[#2D6A4F]">
              <Keyboard className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#1A3C2E]">Keyboard Navigable</h4>
            <p className="text-xs text-[#5D705C] leading-relaxed font-medium">
              Every critical action, interactive quiz, and video player can be operated using standard keyboard shortcuts.
            </p>
          </div>

          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(26,60,46,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center text-[#2D6A4F]">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#1A3C2E]">High Contrast</h4>
            <p className="text-xs text-[#5D705C] leading-relaxed font-medium">
              Our color palette is engineered to meet WCAG AA contrast ratios for visual comfort and readability.
            </p>
          </div>

          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(26,60,46,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center text-[#2D6A4F]">
              <Volume2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#1A3C2E]">Screen Readers</h4>
            <p className="text-xs text-[#5D705C] leading-relaxed font-medium">
              Semantic HTML5 tags, ARIA labels, and live region announcements for NVDA, JAWS, and VoiceOver.
            </p>
          </div>

          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(26,60,46,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center text-[#2D6A4F]">
              <Monitor className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#1A3C2E]">Responsive Scaling</h4>
            <p className="text-xs text-[#5D705C] leading-relaxed font-medium">
              Zoom in up to 200% without loss of content structure, text overlapping, or horizontal scrolling clipping.
            </p>
          </div>
        </section>

        {/* 3. DETAILED ACCESSIBILITY MEASURES */}
        <section className="space-y-8 mb-16">

          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 sm:p-10 shadow-[0_4px_20px_rgba(26,60,46,0.03)]">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A3C2E] tracking-tight mb-4">
              Our Commitment & Conformance Status
            </h3>
            <p className="text-[#5D705C] text-[15px] leading-relaxed font-medium mb-6">
              The Web Content Accessibility Guidelines (WCAG) define requirements for designers and software engineers to improve accessibility for individuals with visual, auditory, motor, or cognitive disabilities. SARTHI is targeted to be <strong>partially conformant with WCAG 2.1 Level AA</strong>.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#F5F0E8]/70 p-5 rounded-2xl border border-[#E8E2D9] space-y-2">
                <h5 className="text-xs font-black uppercase text-[#1A3C2E] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" /> Implemented Features
                </h5>
                <ul className="space-y-1.5 text-xs text-[#5D705C] font-medium leading-relaxed">
                  <li>• Skip to main content navigation links for keyboard-only visitors</li>
                  <li>• Clear visual focus indicators for interactive buttons, links, and inputs</li>
                  <li>• Descriptive alt-text tags on educational diagrams and course thumbnails</li>
                  <li>• Semantic landmark hierarchy (&lt;header&gt;, &lt;main&gt;, &lt;section&gt;, &lt;footer&gt;)</li>
                </ul>
              </div>

              <div className="bg-[#F5F0E8]/70 p-5 rounded-2xl border border-[#E8E2D9] space-y-2">
                <h5 className="text-xs font-black uppercase text-[#1A3C2E] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E8B84B]" /> Continual Improvements
                </h5>
                <ul className="space-y-1.5 text-xs text-[#5D705C] font-medium leading-relaxed">
                  <li>• AI-generated captions and transcriptions for video lectures</li>
                  <li>• High-contrast and dark theme preferences synchronization</li>
                  <li>• Reduced motion support for visitors with vestibular sensitivities</li>
                  <li>• Regular automated accessibility audits with axe-core & Lighthouse</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 sm:p-10 shadow-[0_4px_20px_rgba(26,60,46,0.03)]">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A3C2E] tracking-tight mb-3">
              Feedback & Assistance
            </h3>
            <p className="text-[#5D705C] text-[15px] leading-relaxed font-medium mb-6">
              If you experience any accessibility barrier while browsing our platform, participating in a live cohort, or verifying credentials, please let us know. We treat accessibility feedback with the highest priority and typically implement fixes within 3 to 5 business days.
            </p>

            <div className="bg-[#F5F0E8]/80 p-6 rounded-2xl border border-[#E8E2D9] space-y-2 text-sm text-[#1A3C2E]">
              <p><strong>Accessibility Lead:</strong> Mohit Raj</p>
              <p><strong>Official Email:</strong> <a href="mailto:support@sarthi.in" className="text-[#2D6A4F] font-bold hover:underline">support@sarthi.in</a></p>
              <p><strong>Location:</strong> SARTHI HQ, Baridih, Jamshedpur, Jharkhand - 831017, India</p>
            </div>
          </div>

        </section>

        {/* 4. HELP CONTACT BANNER */}
        <section className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-[#1A3C2E]">Need personalized assistance?</h4>
            <p className="text-xs sm:text-sm text-[#5D705C]">Reach out to our support coordinators directly for dedicated guidance.</p>
          </div>
          <Link href="/contact">
            <button className="bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shrink-0">
              Contact Helpdesk <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </section>

      </main>
    </div>
  );
}
