'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Clock, 
  Award,
  ChevronDown,
  BookOpen,
  HelpCircle,
  Check,
  Star,
  PlayCircle,
  ArrowRight,
  ShieldCheck,
  Globe,
  X,
  Video
} from 'lucide-react';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';

// ── FALLING LIGHT SNOW & ICE EFFECT ──────────────────────────────────────────

function SnowfallEffect() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const snowflakes = Array.from({ length: 32 }).map((_, i) => ({
    id: i,
    size: (i % 4) * 4 + 10,
    left: (i * 3.1) % 100,
    duration: (i % 5) * 2 + 7,
    delay: (i % 7) * 0.7,
    opacity: 0.35 + (i % 4) * 0.15,
    symbol: ['❄', '❅', '❆', '•'][i % 4]
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[40] overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          initial={{ y: -30, x: 0, opacity: 0 }}
          animate={{ 
            y: '105vh', 
            opacity: [0, flake.opacity, flake.opacity, 0],
            x: [0, Math.sin(flake.id) * 30, 0] 
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            left: `${flake.left}%`,
            fontSize: `${flake.size}px`,
            color: '#38BDF8',
            filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.4))'
          }}
        >
          {flake.symbol}
        </motion.div>
      ))}
    </div>
  );
}

// ── PROGRAM DATA ─────────────────────────────────────────────────────────────

const winterCampProgram = {
  id: 'winter-camp-2026',
  name: 'SARTHI Winter Camp 2026: Python, AI & Automation',
  description: 'A hands-on 4-week winter experience where young innovators learn Python from scratch, build GUI desktop applications, explore AI, and master the future of technology.',
  ageGroup: '10 – 18 Years',
  duration: '4 Weeks (Live + Recorded)',
  level: 'Beginners to Intermediate',
  category: 'Winter Camp 2026',
  price: 1000,
  thumbnail: '/course-thumbnails/winter-camp-2026.jpg',
  points: [
    'Python Foundations & Computational Logic Building',
    'Real-World Programming (Lists, Dicts, File I/O)',
    'Desktop Utility Automation & OS Scripting',
    'GUI Development with Tkinter Framework',
    'Introduction to Web APIs & AI Voice Bots',
    'Object-Oriented Programming & Data Science',
  ],
  curriculum: [
    {
      title: 'MODULE 1 — Python Essentials & Logic Building',
      desc: 'Setting up Python & VS Code IDE, variables, data types, operators, conditionals (if/elif/else), and for/while loops.'
    },
    {
      title: 'MODULE 2 — Data Structures & File Automation',
      desc: 'Mastering lists, tuples, dictionaries, functions, parameters, local file reading/writing, and automating desktop folder cleanup scripts.'
    },
    {
      title: 'MODULE 3 — GUI Engineering with Tkinter',
      desc: 'Introduction to Tkinter desktop UIs, building a smart calculator app, and designing an interactive quiz & flashcard desktop application.'
    },
    {
      title: 'MODULE 4 — Introduction to AI, APIs & Capstone Showcase',
      desc: 'Connecting Python to REST Web APIs, building a voice/text AI assistant bot, and presenting capstone projects during mentored code reviews.'
    }
  ]
};

const faqs = [
  { q: "Is this course aligned with standard school STEM learning?", a: "Yes, designed to build strong computational logic, Python mastery, and AI foundations for school students." },
  { q: "What age group is this camp for?", a: "School students aged 10 to 18 years (Class 5 to 12)." },
  { q: "What if my child misses a live session?", a: "All live sessions are recorded in HD and uploaded to the portal within 2 hours with project source files." },
  { q: "Do students get a certificate?", a: "Yes, an official QR-enabled verifiable certificate of completion from SARTHI." },
  { q: "What software tools will students use?", a: "VS Code, Python 3.12, Tkinter, Pygame logic, and REST Web APIs." }
];

// ── JOIN ADVENTURE ENROLLMENT MODAL ───────────────────────────────────────

function JoinAdventureModal({
  isOpen,
  onClose,
  currentUser
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<'solo' | 'group'>('solo');
  const [members, setMembers] = useState([
    { name: currentUser?.name || '', email: currentUser?.email || '' },
    { name: '', email: '' },
    { name: '', email: '' },
    { name: '', email: '' },
    { name: '', email: '' }
  ]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setMembers(prev => [
        { name: currentUser.name || prev[0].name, email: currentUser.email || prev[0].email },
        ...prev.slice(1)
      ]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (selectedType === 'solo') {
      router.push('/register/winter-camp-2026');
      onClose();
    } else {
      if (step === 1) {
        setStep(2);
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (let i = 0; i < 5; i++) {
          const m = members[i];
          if (!m.name.trim()) {
            setError(`Please fill in Name for Team Member ${i + 1}`);
            return;
          }
          if (!m.email.trim() || !emailRegex.test(m.email.trim())) {
            setError(`Please fill in a valid Email for Team Member ${i + 1}`);
            return;
          }
        }
        localStorage.setItem('winter_camp_group_members', JSON.stringify(members));
        router.push('/register/winter-camp-2026?type=group');
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          className="relative w-full max-w-[880px] bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col my-auto text-slate-900"
        >
          {/* Header */}
          <div className="px-8 py-6 flex justify-between items-start border-b border-slate-100 bg-[#f8fafc] sticky top-0 z-10 shrink-0">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-black text-[#1a5c3a] bg-[#e8f5ee] border border-[#bbf7d0] px-3 py-1 rounded-full uppercase tracking-wider">
                SARTHI Winter Camp 2026
              </span>
              <h3 className="text-2xl font-extrabold text-[#0F172A]">
                {step === 1 ? 'Choose Enrollment Pass' : 'Enter Squad Member Details'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {step === 1 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Solo Pass */}
                <div
                  onClick={() => setSelectedType('solo')}
                  className={`p-7 rounded-[24px] border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    selectedType === 'solo'
                      ? 'border-[#1a5c3a] bg-[#f0fdf4] shadow-lg'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Individual Pass</span>
                    <h4 className="text-xl font-extrabold text-[#0F172A] mt-1 mb-2">Solo Innovator</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Secure your seat instantly. Perfect for individual learning and self-paced mastery.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-emerald-200 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#1a5c3a]">₹1,000</span>
                    <span className="text-sm font-bold text-slate-400 line-through">₹4,999</span>
                  </div>
                </div>

                {/* Group Pass */}
                <div
                  onClick={() => setSelectedType('group')}
                  className={`p-7 rounded-[24px] border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    selectedType === 'group'
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Squad Pass Bundle</span>
                    <h4 className="text-xl font-extrabold text-[#0F172A] mt-1 mb-2">Squad Sync Bundle</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Register 5 squad members together to claim a flat 50% discount on all seats.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-indigo-200 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-indigo-700">₹2,500</span>
                    <span className="text-sm font-bold text-slate-400 line-through">₹5,000</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>}
                {members.map((m, idx) => (
                  <div key={idx} className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Member {idx + 1} Name</label>
                      <input
                        type="text"
                        value={m.name}
                        onChange={e => {
                          const updated = [...members];
                          updated[idx].name = e.target.value;
                          setMembers(updated);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#1a5c3a]"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Member {idx + 1} Email</label>
                      <input
                        type="email"
                        value={m.email}
                        onChange={e => {
                          const updated = [...members];
                          updated[idx].email = e.target.value;
                          setMembers(updated);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#1a5c3a]"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
            {step === 2 ? (
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
            ) : <div />}
            <button
              onClick={handleProceed}
              className="px-8 py-3.5 rounded-2xl bg-[#1a5c3a] hover:bg-[#155232] text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              {step === 1 && selectedType === 'group' ? 'Next: Enter Members' : 'Proceed to Checkout →'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── MAIN PAGE COMPONENT (OPTIMIZED PADDING & FLUSH THUMBNAIL) ─────────────

export default function WinterCampPage() {
  const router = useRouter();
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [openUnit, setOpenUnit] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => (res.ok && res.headers.get('content-type')?.includes('json')) ? res.json() : null)
      .then(data => {
        if (data && data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleUnitToggle = (idx: number) => {
    setOpenUnit(openUnit === idx ? -1 : idx);
  };

  useEffect(() => {
    const handleScroll = () => setIsHeaderSticky(window.scrollY > 280);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Orb parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const orbs = document.querySelectorAll('.jr-orb-animate');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 18;
        const xOffset = (0.5 - x) * speed;
        const yOffset = (0.5 - y) * speed;
        (orb as HTMLElement).style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll-triggered count-up for stats bar
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);

  const STATS = [
    { target: 2400, suffix: '+', label: 'Students Enrolled', decimals: 0 },
    { target: 4.9,  suffix: '★', label: 'Average Rating',    decimals: 1 },
    { target: 100,  suffix: '%', label: 'CBSE Coverage',     decimals: 0 },
    { target: 210,  suffix: ' Hrs', label: 'Theory & Practical', decimals: 0 },
  ];

  const [counts, setCounts] = useState(STATS.map(() => 0));

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsStarted) {
          setStatsStarted(true);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [statsStarted]);

  useEffect(() => {
    if (!statsStarted) return;
    const duration = 1600;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts(STATS.map(s => parseFloat((s.target * eased).toFixed(s.decimals))));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [statsStarted]);

  return (
    <LazyMotion features={domAnimation}>
      <SnowfallEffect />
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif" }} className="min-h-screen bg-white text-[#0f172a] overflow-x-hidden antialiased pb-16 relative pt-4">

        <style>{`
          .jr-floating-orbs {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
          }
          .jr-orb {
            position: absolute;
            border-radius: 50%;
            opacity: 0.07;
            animation: jr-float 22s infinite ease-in-out;
            transition: transform 0.12s ease-out;
          }
          .jr-orb-1 {
            width: 560px; height: 560px;
            background: #1a5c3a;
            top: -180px; right: -80px;
            animation-delay: 0s;
          }
          .jr-orb-2 {
            width: 380px; height: 380px;
            background: #2d9e6b;
            bottom: -80px; left: -80px;
            animation-delay: 6s;
          }
          .jr-orb-3 {
            width: 240px; height: 240px;
            background: #1a5c3a;
            bottom: 120px; right: -60px;
            animation-delay: 12s;
            opacity: 0.05;
          }
          @keyframes jr-float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%  { transform: translate(28px, -44px) scale(1.08); }
            66%  { transform: translate(-18px, 28px) scale(0.94); }
          }
        `}</style>

        {/* Floating background orbs */}
        <div className="jr-floating-orbs">
          <div className="jr-orb jr-orb-1 jr-orb-animate" />
          <div className="jr-orb jr-orb-2 jr-orb-animate" />
          <div className="jr-orb jr-orb-3 jr-orb-animate" />
        </div>

        {/* Sticky Top Header Bar */}
        <AnimatePresence>
          {isHeaderSticky && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-[#e2e8f0] flex items-center px-6"
              style={{ height: 56 }}
            >
              <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.back()}
                    className="w-8 h-8 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  </button>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-[#e8f5ee] text-[#166534] text-[10px] font-semibold uppercase tracking-[0.05em] rounded mr-2">{winterCampProgram.category}</span>
                    <span className="text-sm font-semibold text-[#0f172a]">{winterCampProgram.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <span className="hidden md:block text-base font-bold text-[#0f172a]">₹{winterCampProgram.price.toLocaleString()}</span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-[18px] py-2 bg-[#1a5c3a] hover:bg-[#155232] text-white rounded-lg text-[13px] font-semibold transition-colors duration-200 cursor-pointer"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Page Layout — Clean top padding (pt-24 sm:pt-28) to prevent fixed header overlap */}
        <div className="w-full max-w-[1530px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-24 sm:pt-28">

          {/* Breadcrumb */}
          <div style={{ marginBottom: 14 }}>
            <Link href="/programs" className="inline-flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Programs
            </Link>
          </div>

          <div className="grid lg:grid-cols-[1fr_372px] gap-8 lg:gap-12 items-start">

            {/* LEFT COLUMN */}
            <div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 14 }}>
                <span style={{ background: '#e8f5ee', color: '#166534', borderRadius: 6, fontSize: 11, fontWeight: 600, padding: '4px 12px', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'inline-flex', items: 'center', gap: 5 }}>
                  ❄️ {winterCampProgram.category}
                </span>
                <span style={{ background: '#fefce8', color: '#854d0e', borderRadius: 6, fontSize: 11, fontWeight: 600, padding: '4px 12px', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'inline-flex', items: 'center' }}>
                  STEM & AI Innovation
                </span>
              </div>

              {/* Title */}
              <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, marginBottom: 12 }}>
                {winterCampProgram.name}
              </h1>

              {/* Description */}
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, maxWidth: 580, marginBottom: 20 }}>
                {winterCampProgram.description}
              </p>

              {/* Stat Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: 36 }}>
                {[
                  { label: 'Age Group', value: winterCampProgram.ageGroup, icon: Users },
                  { label: 'Duration', value: winterCampProgram.duration, icon: Clock },
                  { label: 'Subject Level', value: winterCampProgram.level, icon: Star },
                  { label: 'Weightage', value: '100 Marks Scale', icon: Award }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="group bg-white flex flex-col justify-between cursor-default transition-colors duration-150"
                    style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', minHeight: 90 }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#1a5c3a')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  >
                    <item.icon size={16} color="#1a5c3a" />
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{item.label}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* WHAT YOU'LL LEARN */}
              <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>What You&apos;ll Learn</h2>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {winterCampProgram.points.map((point, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 items-start transition-all duration-150 cursor-default"
                      style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#bbf7d0'; e.currentTarget.style.background = '#fafffe'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
                    >
                      <div className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5" style={{ background: '#1a5c3a' }}>
                        <Check size={10} color="white" strokeWidth={3} />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', lineHeight: 1.4 }}>{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* COURSE CURRICULUM */}
              <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Course Curriculum</h2>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                  {winterCampProgram.curriculum.map((unit, i) => {
                    const isOpen = openUnit === i;
                    const isPopular = i === 2;
                    return (
                      <div key={i} style={{ borderBottom: '1px solid #f1f5f9', background: isOpen ? '#fafffe' : 'white' }}>
                        <button
                          onClick={() => handleUnitToggle(i)}
                          className="w-full flex items-center gap-3 text-left cursor-pointer"
                          style={{ padding: '14px 16px' }}
                        >
                          <div
                            className="flex items-center justify-center shrink-0 rounded-full transition-colors duration-200"
                            style={{
                              width: 24, height: 24,
                              background: isOpen ? '#1a5c3a' : '#f1f5f9',
                              color: isOpen ? 'white' : '#64748b',
                              fontSize: 12, fontWeight: 700
                            }}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 flex flex-wrap items-center gap-2">
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{unit.title}</span>
                            {isPopular && (
                              <span style={{ border: '1px solid #d97706', color: '#d97706', background: 'transparent', fontSize: 9, fontWeight: 600, padding: '2px 5px', borderRadius: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Popular</span>
                            )}
                          </div>
                          <ChevronDown
                            size={16}
                            color="#94a3b8"
                            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div style={{ padding: '0 16px 14px 52px' }}>
                                <div style={{ borderLeft: '2px solid #bbf7d0', paddingLeft: 12 }}>
                                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{unit.desc}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COURSE OUTCOMES & CERTIFICATION */}
              <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Course Outcomes & Skill Certification</h2>
                <p style={{ fontSize: 14, color: '#64748b', maxWidth: 560, marginBottom: 16 }}>
                  Empowers students with real Python projects, algorithmic thinking, and verifiable STEM credentials.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                    <div className="flex items-center justify-center shrink-0 rounded-full mb-3" style={{ width: 36, height: 36, background: '#e8f5ee' }}>
                      <BookOpen size={16} color="#1a5c3a" />
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Hands-On Project Portfolio</h4>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                      Students build real games, GUI desktop applications, and AI voice scripts during live workshops.
                    </p>
                  </div>
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                    <div className="flex items-center justify-center shrink-0 rounded-full mb-3" style={{ width: 36, height: 36, background: '#e8f5ee' }}>
                      <Award size={16} color="#1a5c3a" />
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Official Digital Certification</h4>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                      Receive a blockchain-verified course completion certificate with an online QR verification page.
                    </p>
                  </div>
                </div>
              </div>

              {/* STATS BAR */}
              <div ref={statsRef} style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: 'white', padding: 20, marginBottom: 36 }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-y-0 md:divide-x divide-[#f1f5f9]">
                  {STATS.map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center text-center py-1.5 px-3">
                      <span style={{ fontSize: 24, fontWeight: 800, color: '#1a5c3a', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                        {stat.decimals > 0
                          ? counts[idx].toFixed(stat.decimals)
                          : Math.round(counts[idx]).toLocaleString()}
                        {stat.suffix}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Frequently Asked Questions</h2>
                <div className="space-y-2">
                  {faqs.map((faq, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div
                        key={i}
                        style={{
                          border: isOpen ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          borderRadius: 8,
                          background: isOpen ? '#fafffe' : 'white',
                          padding: '14px 16px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          className="w-full flex items-center justify-between text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <HelpCircle size={14} color={isOpen ? '#1a5c3a' : '#94a3b8'} style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>{faq.q}</span>
                          </div>
                          <ChevronDown
                            size={15}
                            color={isOpen ? '#1a5c3a' : '#94a3b8'}
                            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0, marginLeft: 12 }}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 10, paddingTop: 10 }}>
                                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{faq.a}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FINAL CTA */}
              <div style={{ background: '#f0fdf4', borderRadius: 14, padding: '36px 28px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                  Ready to Start Your AI & Coding Journey?
                </h2>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>
                  Join 2,400+ students already mastering Python, GUI Apps & AI Automation.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="transition-colors duration-200 cursor-pointer w-full sm:w-auto"
                    style={{ background: '#1a5c3a', color: 'white', border: 'none', borderRadius: 8, padding: '12px 30px', fontSize: 14, fontWeight: 700, letterSpacing: '0.02em' }}
                    onMouseEnter={e => ((e.target as HTMLButtonElement).style.background = '#155232')}
                    onMouseLeave={e => ((e.target as HTMLButtonElement).style.background = '#1a5c3a')}
                  >
                    Enroll Now for ₹{winterCampProgram.price.toLocaleString()} →
                  </button>
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
                  100-Mark CBSE Coverage · Expert Mentorship · Verifiable Certificate
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN — OPTIMIZED EDGE-TO-EDGE THUMBNAIL SIDEBAR */}
            <aside className="hidden lg:block sticky top-24">
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }} className="shadow-sm">
                
                {/* FLUSH OPTIMIZED 16:9 THUMBNAIL WITH PLAY OVERLAY */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={winterCampProgram.thumbnail}
                    alt={winterCampProgram.name}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsModalOpen(true)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer shadow-xl relative z-10 bg-[#1a5c3a] text-white"
                    >
                      <PlayCircle size={28} />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-center text-white text-[11px] font-bold">
                    <span className="flex items-center gap-1 bg-slate-950/60 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                      <Video size={12} className="text-emerald-400" />
                      Live Interactive
                    </span>
                    <span className="bg-[#1a5c3a] text-white px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider">
                      Ages 10-18
                    </span>
                  </div>
                </div>

                <div style={{ padding: 20 }} className="space-y-4">
                  {/* Price row */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Tuition</span>
                      <span style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>₹{winterCampProgram.price.toLocaleString()}</span>
                    </div>
                    <span style={{ background: '#e8f5ee', color: '#166534', fontSize: 11, fontWeight: 700, borderRadius: 4, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      80% OFF
                    </span>
                  </div>

                  {/* Enroll button */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full transition-colors duration-200 cursor-pointer"
                    style={{ background: '#1a5c3a', color: 'white', border: 'none', borderRadius: 8, padding: 13, fontSize: 14, fontWeight: 700, letterSpacing: '0.02em' }}
                    onMouseEnter={e => ((e.target as HTMLButtonElement).style.background = '#155232')}
                    onMouseLeave={e => ((e.target as HTMLButtonElement).style.background = '#1a5c3a')}
                  >
                    Enroll Now — Join Winter Camp ❄️
                  </button>

                  {/* Included List */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 10 }}>What is Included?</p>
                    <ul className="space-y-2">
                      {[
                        '16+ Hours Live Interactive Sprints',
                        '5+ Hands-on Python & AI Projects',
                        '24/7 Expert Mentor Doubt Resolution',
                        'Official QR-Verifiable Certificate'
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check size={13} color="#1a5c3a" strokeWidth={3} className="shrink-0 mt-0.5" />
                          <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* WhatsApp Counselor Box */}
                  <div className="p-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] space-y-1.5">
                    <p className="text-[11px] font-bold text-[#166534]">Need Counselor Guidance?</p>
                    <a 
                      href="https://wa.me/919153898018?text=Hi%20Tech%20Tomorrow,%20I%20want%20to%20know%20more%20about%20Winter%20Camp%202026"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Globe size={13} />
                      <span>WhatsApp Counselor (+91 91538 98018)</span>
                    </a>
                  </div>

                </div>
              </div>
            </aside>

          </div>
        </div>

        <JoinAdventureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentUser={currentUser}
        />
      </div>
    </LazyMotion>
  );
}
