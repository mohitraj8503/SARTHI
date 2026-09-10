'use client';

import { motion } from 'framer-motion';
import {
  RefreshCcw, CheckCircle2, XCircle, Clock, CreditCard,
  AlertCircle, ArrowRight, Sparkles, Mail, ShieldCheck,
  FileText, HelpCircle
} from 'lucide-react';
import Link from 'next/link';

export default function RefundPolicyPage() {
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
            <RefreshCcw className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Fair & Transparent Policy
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A3C2E] tracking-tight leading-[1.08] mb-6"
          >
            Refund & <span className="text-[#2D6A4F]">Cancellation.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#5D705C] text-[16px] sm:text-[17px] leading-[1.65] max-w-[620px] font-medium"
          >
            We strive to provide world-class educational programs and verifiable outcomes. Here is our straightforward cancellation and refund policy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#2D6A4F] uppercase tracking-wider bg-white/70 border border-[#E8E2D9] px-4 py-1.5 rounded-full"
          >
            <span>Effective Date: {lastUpdated}</span>
            <span>•</span>
            <span>Razorpay Fast Refund Settlement</span>
          </motion.div>
        </section>

        {/* 2. OVERVIEW HIGHLIGHT GRID */}
        <section className="grid md:grid-cols-3 gap-6 mb-14">
          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-6 sm:p-7 shadow-[0_4px_20px_rgba(26,60,46,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center text-[#2D6A4F]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1A3C2E]">48-Hour Course Window</h3>
            <p className="text-xs sm:text-sm text-[#5D705C] leading-relaxed font-medium">
              Cancel any on-demand course within 48 hours if you&apos;ve completed less than 20% of curriculum.
            </p>
          </div>

          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-6 sm:p-7 shadow-[0_4px_20px_rgba(26,60,46,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center text-[#2D6A4F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1A3C2E]">100% Duplicate Refund</h3>
            <p className="text-xs sm:text-sm text-[#5D705C] leading-relaxed font-medium">
              Any accidental double payment or bank debit without access is refunded in full automatically.
            </p>
          </div>

          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-6 sm:p-7 shadow-[0_4px_20px_rgba(26,60,46,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center text-[#2D6A4F]">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1A3C2E]">5-7 Day Settlement</h3>
            <p className="text-xs sm:text-sm text-[#5D705C] leading-relaxed font-medium">
              Approved refunds are disbursed straight to the original payment method (Bank/UPI/Card).
            </p>
          </div>
        </section>

        {/* 3. POLICY DETAILS */}
        <section className="space-y-8 mb-16">

          {/* Section 1 */}
          <PolicyCard
            num="01"
            title="Self-Paced Courses & Masterclasses"
            icon={<Clock className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-4 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                We want you to be completely satisfied with your learning investment on SARTHI.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#F5F0E8]/70 p-4 rounded-2xl border border-[#E8E2D9]">
                  <h5 className="text-xs font-black uppercase text-[#1A3C2E] mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" /> Eligible for Refund
                  </h5>
                  <ul className="space-y-1.5 text-xs text-[#5D705C]">
                    <li>• Request made within 48 hours of purchase</li>
                    <li>• Less than 20% of total video lessons completed</li>
                    <li>• No downloadable code templates or certificates downloaded</li>
                  </ul>
                </div>

                <div className="bg-[#F5F0E8]/70 p-4 rounded-2xl border border-[#E8E2D9]">
                  <h5 className="text-xs font-black uppercase text-[#1A3C2E] mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-500" /> Ineligible for Refund
                  </h5>
                  <ul className="space-y-1.5 text-xs text-[#5D705C]">
                    <li>• Request made after 48 hours of enrollment</li>
                    <li>• More than 20% of the program completed</li>
                    <li>• An official certificate of completion has been generated</li>
                  </ul>
                </div>
              </div>
            </div>
          </PolicyCard>

          {/* Section 2 */}
          <PolicyCard
            num="02"
            title="Live Interactive Cohorts & Bootcamps"
            icon={<RefreshCcw className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                • <strong>Prior to Kickoff:</strong> You may cancel your seat in a live cohort up to <strong>24 hours before the inaugural live session</strong> for a full refund minus minimal gateway processing charges.
              </p>
              <p>
                • <strong>Post Kickoff:</strong> Once live classes commence, mentor hours, interactive compute resources, and cohort seats are irrevocably committed, making fees non-refundable. If unforeseen medical emergencies arise, you may request deferral to the subsequent batch.
              </p>
            </div>
          </PolicyCard>

          {/* Section 3 */}
          <PolicyCard
            num="03"
            title="Certification Exams & Internship Processing"
            icon={<FileText className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                • <strong>Exam Registrations:</strong> Fees paid for professional certification exams (e.g. Python, Full Stack, Data) are non-refundable once an assessment attempt has started or a certificate has been awarded.
              </p>
              <p>
                • <strong>Internship Programs:</strong> Administrative onboarding and verification costs are non-refundable once an official offer letter and cohort kit has been generated.
              </p>
            </div>
          </PolicyCard>

          {/* Section 4 */}
          <PolicyCard
            num="04"
            title="Duplicate Charges & Billing Failures"
            icon={<ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <p className="text-[#5D705C] text-[15px] leading-relaxed font-medium">
              In the rare event of a network disruption where money is deducted from your bank account without your enrollment activating, or if you are debited more than once, our system automatically triggers a reversal. If your enrollment is not visible within 30 minutes, email us with your bank transaction reference ID, and we will issue an immediate 100% refund.
            </p>
          </PolicyCard>

          {/* Section 5 */}
          <PolicyCard
            num="05"
            title="How to Request a Refund"
            icon={<Mail className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-4 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                To request a refund, follow these simple steps:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-3 bg-[#F5F0E8]/70 p-3.5 rounded-xl border border-[#E8E2D9]">
                  <span className="w-6 h-6 rounded-full bg-[#1A3C2E] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <p className="text-xs sm:text-sm text-[#1A3C2E]">Send an email to <a href="mailto:support@sarthi.in" className="text-[#2D6A4F] font-bold underline">support@sarthi.in</a> with subject: &ldquo;Refund Request - [Your Order ID]&rdquo;.</p>
                </div>
                <div className="flex items-start gap-3 bg-[#F5F0E8]/70 p-3.5 rounded-xl border border-[#E8E2D9]">
                  <span className="w-6 h-6 rounded-full bg-[#1A3C2E] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <p className="text-xs sm:text-sm text-[#1A3C2E]">Include your registered email address, course title, and reason for the refund.</p>
                </div>
                <div className="flex items-start gap-3 bg-[#F5F0E8]/70 p-3.5 rounded-xl border border-[#E8E2D9]">
                  <span className="w-6 h-6 rounded-full bg-[#1A3C2E] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <p className="text-xs sm:text-sm text-[#1A3C2E]">Our billing team will review eligibility and process the refund via Razorpay within 24-48 business hours.</p>
                </div>
              </div>
            </div>
          </PolicyCard>

        </section>

        {/* 4. HELP CONTACT BANNER */}
        <section className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-[#1A3C2E]">Need assistance with a recent payment?</h4>
            <p className="text-xs sm:text-sm text-[#5D705C]">Our support desk operates 24/7 to resolve billing inquiries quickly.</p>
          </div>
          <Link href="/contact">
            <button className="bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shrink-0">
              Open Support Ticket <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </section>

      </main>
    </div>
  );
}

function PolicyCard({
  num,
  title,
  icon,
  children
}: {
  num: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(26,60,46,0.03)]">
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-[#E8E2D9]">
        <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <span className="text-[11px] font-black tracking-[2px] uppercase text-[#2D6A4F] block">Policy {num}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#1A3C2E] tracking-tight">{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}
