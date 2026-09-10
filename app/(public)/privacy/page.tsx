'use client';

import { motion } from 'framer-motion';
import {
  Shield, Lock, Database, UserCheck, Cookie, Eye,
  FileText, ArrowRight, Sparkles, Mail, MapPin, CheckCircle2,
  Server, HelpCircle
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
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
            <Shield className="w-3.5 h-3.5 text-[#2D6A4F]" />
            DPDP Act 2023 & GDPR Compliant
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A3C2E] tracking-tight leading-[1.08] mb-6"
          >
            Privacy <span className="text-[#2D6A4F]">Policy.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#5D705C] text-[16px] sm:text-[17px] leading-[1.65] max-w-[620px] font-medium"
          >
            We believe trust is built on transparency. Here is how SARTHI collects, safeguards, and respects your personal and academic data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#2D6A4F] uppercase tracking-wider bg-white/70 border border-[#E8E2D9] px-4 py-1.5 rounded-full"
          >
            <span>Last Updated: {lastUpdated}</span>
            <span>•</span>
            <span>Applicable to all sarthi-woad.vercel.app sub-services</span>
          </motion.div>
        </section>

        {/* 2. CORE COMMITMENT HIGHLIGHT CARD */}
        <section className="mb-14">
          <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 sm:p-10 shadow-[0_4px_24px_rgba(26,60,46,0.04)]">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 text-[#2D6A4F] text-xs font-extrabold uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" /> Our Privacy Standard
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1A3C2E] tracking-tight">
                  Zero Data Selling. Total Student Ownership.
                </h2>
                <p className="text-[#5D705C] text-[15px] leading-relaxed font-medium">
                  SARTHI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;platform&rdquo;) respects the privacy of learners, mentors, and partners. We strictly comply with India&apos;s <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> and the Information Technology Act 2000. We do not sell your personal, contact, or academic data to advertising brokers.
                </p>
              </div>

              <div className="md:col-span-4 bg-[#F5F0E8]/70 border border-[#E8E2D9] rounded-2xl p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] border border-[#C5D5C0] flex items-center justify-center text-[#2D6A4F]">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-wider text-[#1A3C2E]">256-Bit SSL Encryption</h4>
                <p className="text-xs text-[#5D705C] font-medium leading-relaxed">
                  All platform sessions, authentication cookies, and verification databases are secured with industry-standard encryption protocols.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. POLICY SECTIONS */}
        <section className="space-y-8 mb-16">

          {/* Section 1 */}
          <PolicyCard
            num="01"
            title="Information We Collect"
            icon={<Database className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <p className="text-[#5D705C] text-[15px] leading-relaxed mb-5 font-medium">
              We collect minimal, necessary information required to authenticate you, personalize your learning portal, deliver cohort masterclasses, and issue accredited credentials:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <DataBlock
                title="Account & Authentication Data"
                items={[
                  'Full Name, avatar, and verified email address from Google OAuth',
                  'Hashed passwords if registering with email directly',
                  'Role designation (Student, Intern, Mentor, Instructor)'
                ]}
              />
              <DataBlock
                title="Academic & Cohort Information"
                items={[
                  'College or University name, graduation year, and degree track',
                  'Internship applications, resumes, GitHub, and portfolio links',
                  'Quiz scores, assignment submissions, and live attendance'
                ]}
              />
              <DataBlock
                title="Billing & Payment Records"
                items={[
                  'Transaction reference ID, order number, and GST invoice data',
                  'Payments processed via RBI-authorized Razorpay aggregator',
                  'SARTHI never stores debit/credit card numbers or UPI PINs'
                ]}
              />
              <DataBlock
                title="Technical & Security Logs"
                items={[
                  'IP address, browser type, and operating system version',
                  'Audit logs for password resets, certificate generation, and logins',
                  'Anonymous performance telemetry for platform optimization'
                ]}
              />
            </div>
          </PolicyCard>

          {/* Section 2 */}
          <PolicyCard
            num="02"
            title="Real-Time Classroom & LiveKit Audio/Video"
            icon={<Server className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <p className="text-[#5D705C] text-[15px] leading-relaxed mb-4 font-medium">
              Our interactive live classrooms use LiveKit WebRTC infrastructure for low-latency media streaming:
            </p>
            <ul className="space-y-2.5 text-[#5D705C] text-[15px] font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-1" />
                <span><strong>Camera & Microphone Controls:</strong> Microphones and webcams are disabled by default upon entering a live class. You maintain voluntary control over turning on audio or video.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-1" />
                <span><strong>Classroom Recordings:</strong> Certain live masterclasses and workshops are recorded so enrolled learners can review lectures. Only registered students in that course have access to recordings.</span>
              </li>
            </ul>
          </PolicyCard>

          {/* Section 3 */}
          <PolicyCard
            num="03"
            title="Cookies & Session Management"
            icon={<Cookie className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <p className="text-[#5D705C] text-[15px] leading-relaxed mb-4 font-medium">
              We use secure, HTTP-only, SameSite cookies (<code className="bg-[#F5F0E8] text-[#1A3C2E] px-2 py-0.5 rounded text-xs font-mono font-bold">tt_session</code>) solely to authenticate your login sessions and prevent cross-site request forgery (CSRF). We do not deploy third-party advertising or retargeting tracking pixels.
            </p>
          </PolicyCard>

          {/* Section 4 */}
          <PolicyCard
            num="04"
            title="How We Use Your Data"
            icon={<Eye className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <ul className="grid sm:grid-cols-2 gap-3 text-[#5D705C] text-[14px] font-medium">
              <li className="flex items-start gap-2 bg-[#F5F0E8]/60 p-3.5 rounded-xl border border-[#E8E2D9]">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                <span>To grant access to enrolled courses, live modules, and coding workspaces.</span>
              </li>
              <li className="flex items-start gap-2 bg-[#F5F0E8]/60 p-3.5 rounded-xl border border-[#E8E2D9]">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                <span>To verify credentials and generate verifiable QR certificates on <code className="text-xs font-mono">/verify/[id]</code>.</span>
              </li>
              <li className="flex items-start gap-2 bg-[#F5F0E8]/60 p-3.5 rounded-xl border border-[#E8E2D9]">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                <span>To communicate critical transactional updates, invoice receipts, and offer letters.</span>
              </li>
              <li className="flex items-start gap-2 bg-[#F5F0E8]/60 p-3.5 rounded-xl border border-[#E8E2D9]">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                <span>To uphold academic integrity and protect the platform against fraud.</span>
              </li>
            </ul>
          </PolicyCard>

          {/* Section 5 */}
          <PolicyCard
            num="05"
            title="Third-Party Subprocessors"
            icon={<UserCheck className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <p className="text-[#5D705C] text-[15px] leading-relaxed mb-4 font-medium">
              To operate a world-class platform, we partner with trusted, SOC2/ISO-compliant infrastructure providers:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[#F5F0E8]/60 p-4 rounded-xl border border-[#E8E2D9]">
                <h5 className="text-xs font-black uppercase text-[#1A3C2E] mb-1">Razorpay</h5>
                <p className="text-xs text-[#5D705C] leading-relaxed">RBI-compliant payment processing, UPI, cards, and automatic GST invoicing.</p>
              </div>
              <div className="bg-[#F5F0E8]/60 p-4 rounded-xl border border-[#E8E2D9]">
                <h5 className="text-xs font-black uppercase text-[#1A3C2E] mb-1">Resend</h5>
                <p className="text-xs text-[#5D705C] leading-relaxed">Transactional email notifications, security alerts, and certificate deliveries.</p>
              </div>
              <div className="bg-[#F5F0E8]/60 p-4 rounded-xl border border-[#E8E2D9]">
                <h5 className="text-xs font-black uppercase text-[#1A3C2E] mb-1">Google Cloud & OAuth</h5>
                <p className="text-xs text-[#5D705C] leading-relaxed">Single Sign-On authentication and secure cloud database backups.</p>
              </div>
            </div>
          </PolicyCard>

          {/* Section 6 */}
          <PolicyCard
            num="06"
            title="Your Legal Rights & Data Portability"
            icon={<FileText className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <p className="text-[#5D705C] text-[15px] leading-relaxed mb-4 font-medium">
              Under India&apos;s DPDP Act 2023 and global privacy frameworks, you have the following inalienable rights regarding your personal information:
            </p>
            <div className="space-y-2 text-[#5D705C] text-[14px] font-medium">
              <p>• <strong>Right of Access:</strong> Request a copy of all personal records and submission histories held in your account.</p>
              <p>• <strong>Right of Rectification:</strong> Request correction of inaccuracies in your profile, college details, or contact information.</p>
              <p>• <strong>Right of Erasure (&ldquo;To Be Forgotten&rdquo;):</strong> Request deletion of your account and personal identifiers, subject only to statutory tax retention laws.</p>
            </div>
          </PolicyCard>

          {/* Section 7 */}
          <PolicyCard
            num="07"
            title="Grievance Officer & Legal Contact"
            icon={<Mail className="w-5 h-5 text-[#2D6A4F]" />}
          >
            <p className="text-[#5D705C] text-[15px] leading-relaxed mb-4 font-medium">
              In accordance with the Information Technology Act 2000 and DPDP rules, our designated Grievance Officer details are provided below:
            </p>
            <div className="bg-[#F5F0E8]/80 p-6 rounded-2xl border border-[#E8E2D9] space-y-2 text-sm text-[#1A3C2E]">
              <p><strong>Entity:</strong> SARTHI (Proprietorship)</p>
              <p><strong>Grievance Officer:</strong> Mohit Raj</p>
              <p><strong>Registered Address:</strong> Baridih, Jamshedpur, Jharkhand - 831017, India</p>
              <p><strong>Direct Inquiries:</strong> <a href="mailto:support@sarthi.in" className="text-[#2D6A4F] font-bold hover:underline">support@sarthi.in</a></p>
              <p><strong>Response Turnaround:</strong> Within 48 business hours</p>
            </div>
          </PolicyCard>

        </section>

        {/* 4. BOTTOM ACTION ROW */}
        <section className="bg-white border border-[#E8E2D9] rounded-[24px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h4 className="text-lg font-bold text-[#1A3C2E] mb-1">Looking for Terms of Service?</h4>
            <p className="text-[#5D705C] text-sm">Read our operational rules, student responsibilities, and platform guidelines.</p>
          </div>
          <Link href="/terms">
            <button className="bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2">
              View Terms of Service <ArrowRight className="w-4 h-4" />
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
          <span className="text-[11px] font-black tracking-[2px] uppercase text-[#2D6A4F] block">Section {num}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#1A3C2E] tracking-tight">{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}

function DataBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-[#F5F0E8]/60 p-4 sm:p-5 rounded-2xl border border-[#E8E2D9]">
      <h5 className="text-xs font-black uppercase tracking-wider text-[#1A3C2E] mb-3">{title}</h5>
      <ul className="space-y-2">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-[#5D705C] font-medium leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
