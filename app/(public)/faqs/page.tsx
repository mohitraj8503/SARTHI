'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Minus, Search, HelpCircle, BookOpen, Briefcase, Award,
  CreditCard, ShieldCheck, MessageSquare, ArrowRight, Sparkles, Mail
} from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  badge?: string;
}

const categories = [
  { id: 'all', name: 'All Questions', icon: <HelpCircle className="w-4 h-4" /> },
  { id: 'learning', name: 'Courses & Programs', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'internship', name: 'Internship Cohorts', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'certification', name: 'Exams & Credentials', icon: <Award className="w-4 h-4" /> },
  { id: 'billing', name: 'Fees & Payments', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'account', name: 'Security & Access', icon: <ShieldCheck className="w-4 h-4" /> }
];

const faqs: FAQItem[] = [
  // Courses & Programs
  {
    id: 'l1',
    category: 'learning',
    question: 'How do I access my enrolled courses and learning material?',
    answer: 'Once you enroll in any program or course, it is instantly unlocked in your Student Dashboard under "Enrolled Courses". You will have lifetime access to self-paced videos, project source code, downloadable cheat sheets, and future curriculum updates.',
    badge: 'Instant Access'
  },
  {
    id: 'l2',
    category: 'learning',
    question: 'Are classes live or self-paced recording sessions?',
    answer: 'SARTHI offers both! Our signature cohort programs feature live interactive weekend masterclasses via our ultra-low latency WebRTC classroom, along with on-demand HD lecture recordings, project walkthroughs, and code repos available 24/7.',
    badge: 'Hybrid Mode'
  },
  {
    id: 'l3',
    category: 'learning',
    question: 'Can I interact with mentors and ask technical doubts?',
    answer: 'Yes! Every enrolled student gets access to our dedicated community forums, live session doubt clearance, and Discord/community groups where industry mentors and fellow builders provide 1-on-1 code reviews and troubleshooting.',
  },
  {
    id: 'l4',
    category: 'learning',
    question: 'What is SARTHI Juniors?',
    answer: 'SARTHI Juniors is our specialized wing designed for young innovators (grades 6-12), offering curated coding, AI basics, robotics, and Olympiad problem-solving tracks with parental progress tracking and school partnerships.',
    badge: 'K-12 Wing'
  },

  // Internship Cohorts
  {
    id: 'i1',
    category: 'internship',
    question: 'How do I apply for the SARTHI Internship Program?',
    answer: 'You can apply directly through our /internship page by choosing your domain (Web Dev, Full-Stack, AI/ML, Digital Marketing, Graphic Design, Content Creation). After review, shortlisted applicants receive an official Offer Letter with a permanent Intern ID (TTIXXXXXX).',
    badge: 'Verified Batches'
  },
  {
    id: 'i2',
    category: 'internship',
    question: 'Is the internship remote and flexible for college students?',
    answer: 'Yes, our internships are 100% remote with milestone-driven sprint tasks. Students and working learners can manage their tasks around academic commitments while attending weekly mentor syncs.',
  },
  {
    id: 'i3',
    category: 'internship',
    question: 'Do interns receive an official letter of recommendation and certificate?',
    answer: 'Upon successful milestone submission and evaluation, every intern receives an official Internship Completion Certificate and Letter of Recommendation (LOR) verifiable publicly on our verification portal.',
    badge: 'Verifiable LOR'
  },

  // Exams & Credentials
  {
    id: 'c1',
    category: 'certification',
    question: 'How do I verify a certificate issued by SARTHI?',
    answer: 'Every credential issued has a tamper-proof reference ID (e.g. TT-FSWDM-*, TT-INT-*, TT-BIA-*). Anyone, including employers and universities, can verify its validity 24/7 by entering the ID at sarthi-woad.vercel.app/verify or by scanning the certificate QR code.',
    badge: 'QR Verifiable'
  },
  {
    id: 'c2',
    category: 'certification',
    question: 'What are SARTHI Professional Certification Exams?',
    answer: 'These are proctored technical assessments that evaluate industry-readiness in domains like Python, Data Analytics, and Full Stack Web Development. Passing score earners receive an official accredited certificate with verifiable grade metadata.',
  },
  {
    id: 'c3',
    category: 'certification',
    question: 'Can I add my certificate to LinkedIn and my resume?',
    answer: 'Yes! Our digital credentials come with one-click "Add to LinkedIn" integration, verifiable digital badges, and high-resolution downloadable PDFs suitable for printing and portfolio sharing.',
  },

  // Fees & Payments
  {
    id: 'b1',
    category: 'billing',
    question: 'What payment methods are supported on SARTHI?',
    answer: 'We process all transactions securely in INR via Razorpay. You can pay using UPI (Google Pay, PhonePe, Paytm), credit/debit cards (Visa, MasterCard, RuPay), net banking across all major Indian banks, and approved wallet options.',
    badge: 'Secure Razorpay'
  },
  {
    id: 'b2',
    category: 'billing',
    question: 'Will I receive a GST tax invoice for my purchase?',
    answer: 'Yes! An official GST-compliant payment invoice is automatically generated and sent to your registered email address upon checkout completion. You can also view and download invoices from your dashboard anytime.',
  },
  {
    id: 'b3',
    category: 'billing',
    question: 'What is your refund policy?',
    answer: 'We maintain a transparent refund policy. For self-paced courses, you can request a cancellation within 48 hours of purchase if less than 20% of the course has been accessed. For live cohorts, cancellations are accommodated up to 24 hours before the inaugural kickoff session. Please review our Refund & Cancellation page for complete details.',
    badge: 'Transparent Terms'
  },

  // Account & Security
  {
    id: 's1',
    category: 'account',
    question: 'How is my personal data and account protected?',
    answer: 'We use enterprise-grade HTTPS encryption, secure HTTP-only session cookies, and Google OAuth 2.0 authentication. We never store payment card credentials on our servers; all transaction processing is handled via RBI-compliant payment aggregators.',
    badge: 'DPDP Compliant'
  },
  {
    id: 's2',
    category: 'account',
    question: 'What should I do if I cannot log into my account?',
    answer: 'If you signed in with Google, ensure you are using the same Google account. If using email and password, click "Forgot Password" on the login page or contact support@sarthi.in for quick account recovery assistance.',
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openId, setOpenId] = useState<string | null>('l1');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        (faq.badge && faq.badge.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

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

      <main className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1. HERO HEADER */}
        <section className="pt-10 pb-12 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#E8F5EE] border border-[#C5D5C0] text-[#2D6A4F] px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[2.5px] mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Knowledge Base & Helpdesk
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A3C2E] tracking-tight leading-[1.08] mb-6"
          >
            Frequently Asked <span className="text-[#2D6A4F]">Questions.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#5D705C] text-[16px] sm:text-[17px] leading-[1.65] max-w-[620px] font-medium mb-10"
          >
            Everything you need to know about our courses, cohorts, verifiable credentials, and ecosystem. Can&apos;t find your answer? Our support team is ready to help.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full max-w-[640px] relative group"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D705C] group-focus-within:text-[#2D6A4F] transition-colors" />
            <input
              type="text"
              placeholder="Search by topic, e.g. certificates, refund, internship..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-[#E8E2D9] rounded-full text-[#1A3C2E] font-medium text-[15px] placeholder-[#5D705C]/70 shadow-[0_4px_20px_rgba(26,60,46,0.04)] focus:outline-none focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-[#5D705C] hover:text-[#1A3C2E]"
              >
                Clear
              </button>
            )}
          </motion.div>
        </section>

        {/* 2. CATEGORY PILLS */}
        <section className="mb-12">
          <div className="flex items-center justify-start md:justify-center gap-2.5 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#1A3C2E] text-white shadow-md shadow-[#1A3C2E]/15'
                      : 'bg-white border border-[#E8E2D9] text-[#5D705C] hover:text-[#1A3C2E] hover:border-[#C5D5C0]'
                  }`}
                >
                  <span className={isActive ? 'text-[#E8B84B]' : 'text-[#2D6A4F]'}>{cat.icon}</span>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. ACCORDION FAQ LIST */}
        <section className="max-w-[900px] mx-auto mb-20">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-12 text-center">
              <HelpCircle className="w-12 h-12 text-[#5D705C]/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#1A3C2E] mb-2">No matching questions found</h3>
              <p className="text-[#5D705C] text-sm max-w-md mx-auto mb-6">
                We couldn&apos;t find an answer for &ldquo;{searchQuery}&rdquo;. Try using different keywords or message our support desk directly.
              </p>
              <Link href="/contact">
                <button className="bg-[#1A3C2E] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#2D6A4F] transition-all">
                  Contact Support
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openId === faq.id;
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`bg-white border rounded-[20px] transition-all overflow-hidden ${
                      isOpen
                        ? 'border-[#2D6A4F]/40 shadow-[0_8px_30px_rgba(45,106,79,0.06)] ring-1 ring-[#2D6A4F]/20'
                        : 'border-[#E8E2D9] hover:border-[#C5D5C0]'
                    }`}
                  >
                    <button
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[16px] sm:text-[17px] font-bold text-[#1A3C2E] leading-snug">
                          {faq.question}
                        </span>
                        {faq.badge && (
                          <span className="hidden sm:inline-block bg-[#E8F5EE] text-[#2D6A4F] border border-[#C5D5C0] text-[10px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full uppercase shrink-0">
                            {faq.badge}
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isOpen ? 'bg-[#1A3C2E] text-white' : 'bg-[#F5F0E8] text-[#1A3C2E]'
                        }`}
                      >
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                          <div className="px-6 sm:px-8 pb-6 pt-1 border-t border-[#E8E2D9]/60">
                            <p className="text-[#5D705C] text-[15px] leading-[1.7] font-medium">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. STILL HAVE QUESTIONS BANNER */}
        <section className="mb-16">
          <div className="bg-[#1A3C2E] text-white rounded-[28px] p-8 sm:p-12 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2D6A4F]/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center md:text-left max-w-xl">
                <div className="inline-flex items-center gap-2 bg-white/10 text-[#E8B84B] px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest">
                  <MessageSquare className="w-3.5 h-3.5" /> 24/7 Dedicated Helpdesk
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Still have questions? We&apos;re here to assist.
                </h3>
                <p className="text-white/70 text-sm leading-relaxed font-medium">
                  Can&apos;t locate what you&apos;re seeking? Connect directly with our mentorship and support coordinators for swift resolution.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Link href="/contact">
                  <button className="bg-[#E8B84B] hover:bg-[#d9a83d] text-[#1A3C2E] px-7 py-3.5 rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-md cursor-pointer flex items-center gap-2">
                    Open Support Desk <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <a
                  href="mailto:support@sarthi.in"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-[#E8B84B]" /> Email Directly
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
