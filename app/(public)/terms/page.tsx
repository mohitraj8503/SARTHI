'use client';

import { motion } from 'framer-motion';
import {
  Scale, Shield, User, ShoppingBag, CreditCard, Lock,
  RefreshCcw, ArrowRight, Sparkles, Mail, CheckCircle2,
  FileCheck, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
            <Scale className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Platform Service Agreement
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A3C2E] tracking-tight leading-[1.08] mb-6"
          >
            Terms of <span className="text-[#2D6A4F]">Service.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#5D705C] text-[16px] sm:text-[17px] leading-[1.65] max-w-[620px] font-medium"
          >
            These terms govern your access to SARTHI&apos;s educational ecosystem, cohort masterclasses, verifiable certifications, and developer tools.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#2D6A4F] uppercase tracking-wider bg-white/70 border border-[#E8E2D9] px-4 py-1.5 rounded-full"
          >
            <span>Last Updated: {lastUpdated}</span>
            <span>•</span>
            <span>Jurisdiction: Jamshedpur, Jharkhand, India</span>
          </motion.div>
        </section>

        {/* 2. SUMMARY PREAMBLE */}
        <section className="mb-14">
          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 sm:p-10 shadow-[0_4px_24px_rgba(26,60,46,0.04)]">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A3C2E] tracking-tight mb-4">
              Welcome to SARTHI
            </h2>
            <p className="text-[#5D705C] text-[15px] leading-relaxed font-medium mb-4">
              This digital agreement is entered into between you (&ldquo;User&rdquo;, &ldquo;Student&rdquo;, &ldquo;Intern&rdquo;) and <strong>SARTHI</strong> (Proprietorship firm registered in India under the laws of the Republic of India). By accessing <code className="bg-[#F5F0E8] text-[#1A3C2E] px-2 py-0.5 rounded text-xs font-mono font-bold">sarthi-woad.vercel.app</code> or enrolling in any program, you accept these terms in full.
            </p>
            <div className="p-4 bg-[#F5F0E8]/70 border border-[#E8E2D9] rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#E8B84B] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#1A3C2E] font-medium leading-relaxed">
                <strong>Key Summary:</strong> We provide high-quality, practical learning experiences, verifiable certifications, and real-world internships. In return, we require mutual respect, academic integrity, and strict adherence to intellectual property laws.
              </p>
            </div>
          </div>
        </section>

        {/* 3. DETAILED TERMS SECTIONS */}
        <section className="space-y-8 mb-16">

          {/* Term 1 */}
          <TermCard
            num="01"
            title="User Accounts, Eligibility & Security"
            icon={<User className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                • <strong>Account Creation:</strong> You must provide accurate, complete information when signing up via Google OAuth or direct credentials. You are solely responsible for maintaining the confidentiality of your credentials.
              </p>
              <p>
                • <strong>No Account Sharing:</strong> Each enrollment and credential is tied strictly to a single individual. Sharing your student account, credentials, or course access with unauthorized third parties is prohibited and subject to immediate termination.
              </p>
              <p>
                • <strong>SARTHI Juniors:</strong> Learners under 18 must register with parental or guardian consent, or through participating school educational partnerships.
              </p>
            </div>
          </TermCard>

          {/* Term 2 */}
          <TermCard
            num="02"
            title="Intellectual Property & Limited Educational License"
            icon={<Shield className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                • <strong>Exclusive Ownership:</strong> All course content, including lecture videos, project architectures, downloadable code templates, quizzes, and documentation, is the proprietary property of SARTHI.
              </p>
              <p>
                • <strong>Personal Learning License:</strong> Enrolled students receive a limited, revocable, non-exclusive, non-transferable license to view and study content for personal educational growth.
              </p>
              <p>
                • <strong>Zero Tolerance for Piracy:</strong> Screen-recording, extracting, redistributing, or selling SARTHI course content or examination test banks is strictly prohibited under the <strong>Indian Copyright Act, 1957</strong> and relevant international copyright treaties.
              </p>
            </div>
          </TermCard>

          {/* Term 3 */}
          <TermCard
            num="03"
            title="Academic Integrity & Verifiable Credentials"
            icon={<FileCheck className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                • <strong>Earned Credentials:</strong> Certificates of Completion, Certification Exam Badges, and Letters of Recommendation are awarded strictly upon meeting passing thresholds and assignment milestones.
              </p>
              <p>
                • <strong>Permanent Verification Registry:</strong> All official credentials issued by SARTHI are permanently logged on our public verification portal at <code className="bg-[#F5F0E8] text-[#1A3C2E] px-1.5 py-0.5 rounded text-xs font-mono">sarthi-woad.vercel.app/verify</code>.
              </p>
              <p>
                • <strong>Credential Revocation:</strong> SARTHI reserves the absolute right to revoke any certificate if fraudulent examination submissions, plagiarism, or impersonation is discovered post-issuance.
              </p>
            </div>
          </TermCard>

          {/* Term 4 */}
          <TermCard
            num="04"
            title="Internship Cohorts & Offer Letters"
            icon={<ShoppingBag className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                • <strong>Primary Authority:</strong> The official offer letter issued to an intern contains their permanent, immutable Intern ID (<code className="text-xs font-mono font-bold text-[#1A3C2E]">TTIXXXXXX</code>) and Reference Number (<code className="text-xs font-mono font-bold text-[#1A3C2E]">TT-INT-2026-XXXX</code>).
              </p>
              <p>
                • <strong>Professional Conduct:</strong> Interns are expected to uphold professional standards, submit work punctually, communicate respectfully with project leads, and adhere to intellectual property rules during their tenure.
              </p>
            </div>
          </TermCard>

          {/* Term 5 */}
          <TermCard
            num="05"
            title="Payment Processing, GST & Razorpay Gateway"
            icon={<CreditCard className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                • <strong>Currencies & Settlement:</strong> All transactions are conducted in Indian Rupees (INR) via our payment gateway partner, <strong>Razorpay</strong>.
              </p>
              <p>
                • <strong>Immediate Access:</strong> Course and program access is unlocked immediately following real-time payment confirmation by the banking network.
              </p>
              <p>
                • <strong>Invoicing:</strong> Automatic GST-compliant tax invoices are generated and emailed for every completed purchase.
              </p>
              <p>
                • <strong>Refunds:</strong> All refund requests are governed by our separate <Link href="/refund-policy" className="text-[#2D6A4F] font-bold underline">Refund & Cancellation Policy</Link>.
              </p>
            </div>
          </TermCard>

          {/* Term 6 */}
          <TermCard
            num="06"
            title="Classroom Code of Conduct"
            icon={<Lock className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                • <strong>Harassment-Free Space:</strong> Our live classes, Discord/chat spaces, and community forums are committed to being respectful and harassment-free environments.
              </p>
              <p>
                • <strong>Prohibited Actions:</strong> Spamming, trolling, hate speech, inappropriate video streaming, commercial solicitations, or security vulnerability exploits will result in immediate ban without refund.
              </p>
            </div>
          </TermCard>

          {/* Term 7 */}
          <TermCard
            num="07"
            title="Disclaimer of Warranties & Limitation of Liability"
            icon={<AlertTriangle className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                • <strong>Educational Scope:</strong> SARTHI provides educational programs, mentorship, and practical training. We do not guarantee employment, salaries, or specific career promotions.
              </p>
              <p>
                • <strong>Service Availability:</strong> We maintain high availability via resilient cloud architecture. However, we are not liable for temporary service interruptions arising from ISP outages, maintenance windows, or force majeure events.
              </p>
            </div>
          </TermCard>

          {/* Term 8 */}
          <TermCard
            num="08"
            title="Governing Law & Exclusive Legal Jurisdiction"
            icon={<Scale className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <div className="space-y-3 text-[#5D705C] text-[15px] font-medium leading-relaxed">
              <p>
                • <strong>Indian Law:</strong> These terms and any disputes arising from or related to the platform shall be governed by, construed, and enforced in accordance with the substantive laws of the <strong>Republic of India</strong>.
              </p>
              <p>
                • <strong>Exclusive Jurisdiction:</strong> Any dispute, claim, or controversy shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Jamshedpur, Jharkhand, India</strong>.
              </p>
            </div>
          </TermCard>

        </section>

        {/* 4. LEGAL CONTACT CARD */}
        <section className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 sm:p-10 shadow-sm mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold text-[#1A3C2E]">Have a question regarding our Terms?</h3>
              <p className="text-[#5D705C] text-sm">Our legal and support compliance team is available to assist you.</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <a
                href="mailto:support@sarthi.in"
                className="bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#E8B84B]" /> Email Support Desk
              </a>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

function TermCard({
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
          <span className="text-[11px] font-black tracking-[2px] uppercase text-[#2D6A4F] block">Article {num}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#1A3C2E] tracking-tight">{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}
