'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, ChevronDown, Star, CheckCircle,
  Code2, Bot, Users, Award, Calendar, Clock, MapPin,
  PlayCircle, Shield, Zap, Users2, BookOpen, BadgeCheck,
  X, Mail, Info, User, Sparkles, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const TABS = ['Overview', 'Curriculum', 'Instructor', 'Feedback'];

const curriculum = [
  {
    id: 'w1', title: 'Week 1: Python Basics & Logic Building',
    lessons: [
      { id: 'l1', title: 'Day 1: Intro to Coding & Python', duration: 60, free: true },
      { id: 'l2', title: 'Day 2: Variables & Data Types', duration: 60, free: true },
      { id: 'l3', title: 'Day 3: Operators & Conditions', duration: 75 },
      { id: 'l4', title: 'Day 4: Loops & Patterns', duration: 75 },
      { id: 'l5', title: 'Day 5: Functions & Reusability', duration: 90 },
      { id: 'p1', title: 'Weekend Project 1: Mini Python Games Pack', duration: 120 },
    ]
  },
  {
    id: 'w2', title: 'Week 2: Real Programming Skills',
    lessons: [
      { id: 'l6', title: 'Day 6: Lists & Tuples', duration: 90 },
      { id: 'l7', title: 'Day 7: Dictionaries & Sets', duration: 90 },
      { id: 'l8', title: 'Day 8: String Mastery', duration: 75 },
      { id: 'l9', title: 'Day 9: File Handling', duration: 90 },
      { id: 'l10', title: 'Day 10: Error Handling & Debugging', duration: 60 },
      { id: 'p2', title: 'Weekend Project 2: Student Management System', duration: 150 },
    ]
  },
  {
    id: 'w3', title: 'Week 3: Automation, Creativity & AI Basics',
    lessons: [
      { id: 'l11', title: 'Day 11: Python Modules (random, math, datetime)', duration: 90 },
      { id: 'l12', title: 'Day 12: GUI Basics with Tkinter', duration: 120 },
      { id: 'l13', title: 'Day 13: Automation with Python', duration: 120 },
      { id: 'l14', title: 'Day 14: Intro to AI & APIs', duration: 90 },
      { id: 'l15', title: 'Day 15: Web Basics for Python Students', duration: 120 },
      { id: 'p3', title: 'Weekend Project 3: AI Utility Tool / Automation App', duration: 180 },
    ]
  },
  {
    id: 'w4', title: 'Week 4: Advanced Beginner to Future Builder',
    lessons: [
      { id: 'l16', title: 'Day 16: Object Oriented Programming (OOP)', duration: 120 },
      { id: 'l17', title: 'Day 17: Advanced Logic Building', duration: 90 },
      { id: 'l18', title: 'Day 18: Intro to Data Science', duration: 120 },
      { id: 'l19', title: 'Day 19: Career Paths in Tech', duration: 60 },
      { id: 'l20', title: 'Day 20: Final Project Planning', duration: 90 },
      { id: 'p4', title: 'Final Mega Project: Build Your Own Future Tech', duration: 240 },
    ]
  }
];

const reviews = [
  { id: 'r1', name: 'Aarav K.', image: '/images/reviews/aarav.png', role: 'Interested Student', text: 'I always wanted to learn coding but most courses felt confusing. This summer camp looks beginner friendly and exciting.' },
  { id: 'r2', name: 'Riya Sharma', image: '/images/reviews/riya.png', role: 'Parent', text: 'The curriculum looks practical and structured. I like that students will build projects instead of just watching videos.' },
  { id: 'r3', name: 'Kabir Patel', image: '/images/reviews/kabir.png', role: 'Aspiring Developer', text: 'The AI and automation part caught my attention. Excited to join and build something real this summer.' },
  { id: 'r4', name: 'Sneha Verma', image: '/images/reviews/sneha.png', role: 'School Student', text: 'I liked how the course starts slowly from basics. The weekly projects make it more fun.' },
];

const features = [
  { Icon: Code2, title: 'Python Projects', sub: '& Real Skills' },
  { Icon: Bot, title: 'AI & Automation', sub: '& More' },
  { Icon: Users, title: 'Make Friends', sub: '& Collaborate' },
  { Icon: Award, title: 'Certificate', sub: 'of Completion' },
];

const TAB_IMAGES: Record<string, string> = {
  Overview: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1000&q=70',
  Curriculum: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=70',
  Instructor: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=70',
  Feedback: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=70',
};

// ── COMPONENTS ─────────────────────────────────────────────────────────

function PriceCard({ isEnrolled, onJoinAdventure }: { isEnrolled: boolean; onJoinAdventure?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      {/* Background Glow */}
      <div className="absolute -inset-4 bg-[#FBBF24]/5 blur-[60px] rounded-[40px] pointer-events-none group-hover:bg-[#FBBF24]/10 transition-colors duration-700" />

      <div
        className="relative rounded-[28px] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(2,6,23,0.96) 100%)',
        }}
      >
        {/* Shine/Reflection effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/[0.03] to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Thumbnail Area */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src="/course-thumbnails/Summer-Camp.png"
            alt="Summer Camp Thumbnail"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl relative z-10"
              style={{ background: '#FBBF24', color: '#020617' }}
            >
              <PlayCircle size={28} />
            </motion.div>
          </div>
        </div>

        <div className="p-7">
          {/* Price */}
          <div className="mb-7">
            <div className="flex items-baseline gap-3 mb-1.5">
              {isEnrolled ? (
                <span className="text-3xl font-black text-white tracking-tighter italic uppercase">Enrolled</span>
              ) : (
                <>
                  <span className="text-4xl font-black text-white tracking-tighter">₹1,000</span>
                  <span className="text-slate-500 line-through text-lg font-bold">₹4,999</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FBBF24]">
              {isEnrolled ? 'WELCOME TO THE SQUAD' : '80% OFF · LIMITED TIME OFFER'}
            </span>
          </div>

          {/* CTA */}
          {isEnrolled ? (
            <Link href="/dashboard">
              <div
                className="w-full py-4.5 rounded-2xl font-black text-center text-[15px] mb-4 cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                style={{ background: '#FBBF24', color: '#020617', boxShadow: '0 8px 32px rgba(251,191,36,0.3)' }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20 -translate-x-full"
                  animate={{ x: '200%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Continue to Learning
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ) : (
            <div onClick={onJoinAdventure} className="w-full">
              <div
                className="w-full py-4.5 rounded-2xl font-black text-center text-[15px] mb-4 cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                style={{ background: '#FBBF24', color: '#020617', boxShadow: '0 8px 32px rgba(251,191,36,0.3)' }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20 -translate-x-full"
                  animate={{ x: '200%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Join the Adventure
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          )}
          <p className="text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-7">
            {isEnrolled ? 'Official Enrollment Verified' : 'Spaces Limited. Enroll Today!'}
          </p>

          {/* Includes */}
          <div className="space-y-4 pt-7 border-t border-white/5">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Camp Benefits</p>
            {[
              { Icon: BookOpen, text: '15 Live Python Sessions' },
              { Icon: Users2, text: 'Direct Mentorship (Expert Mentor)' },
              { Icon: BadgeCheck, text: 'Elite Certification' },
              { Icon: Zap, text: 'Private Community Access' },
              { Icon: Shield, text: 'Lifetime Access to Vault' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3.5">
                <Icon size={16} className="text-[#FBBF24] opacity-80" />
                <p className="text-slate-300 text-sm font-medium">{text}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-7 border-t border-white/5">
            {[
              { val: '1,937', label: 'Registered' },
              { val: 'New', label: 'Batch' },
              { val: '4', label: 'Weeks' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-black text-white">{val}</p>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── ANIMATION VARIANTS ─────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ── JOIN ADVENTURE SELECTION MODAL ──────────────────────────────────────

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

  // Prefill Member 1 if currentUser details change
  useEffect(() => {
    if (currentUser) {
      setMembers(prev => [
        { name: currentUser.name || prev[0].name, email: currentUser.email || prev[0].email },
        ...prev.slice(1)
      ]);
    }
  }, [currentUser]);

  // Reset modal step when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMemberChange = (index: number, field: 'name' | 'email', value: string) => {
    setError('');
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleProceed = () => {
    if (selectedType === 'solo') {
      router.push('/checkout/summer-camp-2026');
      onClose();
    } else {
      if (step === 1) {
        setStep(2);
      } else {
        // Validate all group members are filled out correctly
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

        // Save to localStorage and proceed
        localStorage.setItem('summer_camp_group_members', JSON.stringify(members));
        router.push('/checkout/summer-camp-2026?type=group');
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 py-12 overflow-y-auto custom-scrollbar-style">
        {/* Custom scrollbar with 4px width and soft white opacity */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar-style::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          .custom-scrollbar-style::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar-style::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 99px;
          }
        `}} />

        {/* Backdrop: Cinematic high-blur saturate */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#020814]/72 backdrop-blur-[22px] backdrop-saturate-[140%] z-0"
        >
          {/* Floating Ambient Atmosphere Lights */}
          <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#FBBF24]/[0.02] blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#6366f1]/[0.02] blur-[120px] pointer-events-none" />
        </motion.div>

        {/* Modal Window: Spacious Stripe-like design */}
        <motion.div
          initial={{ opacity: 0, scale: 0.985, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.985, y: 12 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[960px] bg-[#090d1a] border border-white/[0.04] rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.58)] overflow-hidden z-10 max-h-[90vh] flex flex-col my-auto"
        >
          {/* Subtle top premium linear shine line */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent shrink-0" />

          {/* Header */}
          <div className="px-8 py-6 flex justify-between items-start border-b border-white/[0.04] bg-[#090d1a]/60 sticky top-0 z-10 backdrop-blur-md shrink-0">
            <div className="space-y-[10px] text-left">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all cursor-pointer font-bold mb-1 group/back"
                >
                  <ArrowLeft size={13} className="group-hover/back:-translate-x-0.5 transition-transform" /> Back to Plans
                </button>
              )}
              
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-[#FBBF24]/90 bg-[#FBBF24]/10 border border-[#FBBF24]/20 px-2 py-0.5 rounded-full uppercase tracking-[0.12em]">
                  Step {step} of 2
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {step === 1 ? 'Plan Selection' : 'Team Details'}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight leading-none">
                {step === 1 ? 'Choose Enrollment' : 'Squad Details'}
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[520px] opacity-82">
                {step === 1 
                  ? 'Select your preferred enrollment experience for Summer Camp 2026.' 
                  : 'Enter the names and emails of your 5 squad members.'
                }
              </p>
            </div>

            {/* Custom Close Button */}
            <button
              onClick={onClose}
              className="w-[42px] h-[42px] rounded-2xl bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar-style">
            
            {/* STEP 1: Option Cards */}
            {step === 1 && (
              <div className="space-y-8 text-left">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Option A: Solo Card */}
                  <motion.div
                    onClick={() => setSelectedType('solo')}
                    whileHover={{ scale: 1.002, y: -1 }}
                    transition={{ duration: 0.2 }}
                    className={`p-8 rounded-[24px] border transition-all cursor-pointer flex flex-col justify-between min-h-[220px] relative group overflow-hidden ${
                      selectedType === 'solo'
                        ? 'border-[#FBBF24]/22 bg-white/[0.01] shadow-[0_12px_40px_rgba(251,191,36,0.03)]'
                        : 'border-white/[0.04] bg-[#0c1020] hover:border-white/[0.08]'
                    }`}
                  >
                    {/* Corner Discount Chip */}
                    <div className="absolute top-0 right-0 h-[30px] px-3.5 bg-[#FBBF24]/10 border-l border-b border-white/[0.06] text-[#FBBF24] text-[11px] font-bold uppercase tracking-[0.08em] rounded-bl-xl shadow-sm z-10 flex items-center justify-center">
                      SAVE 80%
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Individual Pass</span>
                      </div>
                      <h4 className="text-xl font-black text-white">Solo Innovator</h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm opacity-82">
                        Secure your own seat instantly at the limited-time price. Perfect for independent learning.
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2.5 pt-6 border-t border-white/[0.03] mt-6">
                      <span 
                        className="text-[42px] font-bold text-white tracking-tighter leading-none transition-all duration-200"
                        style={selectedType === 'solo' ? { textShadow: '0 0 24px rgba(251,191,36,0.18)' } : undefined}
                      >
                        ₹1,000
                      </span>
                      <span className="text-sm font-bold text-slate-500 line-through opacity-45">₹4,999</span>
                    </div>
                  </motion.div>

                  {/* Option B: Group Card */}
                  <motion.div
                    onClick={() => setSelectedType('group')}
                    whileHover={{ scale: 1.002, y: -1 }}
                    transition={{ duration: 0.2 }}
                    className={`p-8 rounded-[24px] border transition-all cursor-pointer flex flex-col justify-between min-h-[220px] relative group overflow-hidden ${
                      selectedType === 'group'
                        ? 'border-indigo-500/22 bg-indigo-500/[0.005] shadow-[0_12px_40px_rgba(99,102,241,0.03)]'
                        : 'border-white/[0.04] bg-[#0c1020] hover:border-white/[0.08]'
                    }`}
                  >
                    {/* Corner Discount Chip */}
                    <div className="absolute top-0 right-0 h-[30px] px-3.5 bg-indigo-500/10 border-l border-b border-white/[0.06] text-indigo-400 text-[11px] font-bold uppercase tracking-[0.08em] rounded-bl-xl shadow-sm z-10 flex items-center justify-center">
                      SAVE 50%
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Squad Pass Bundle</span>
                      </div>
                      <h4 className="text-xl font-black text-white">Squad Sync Bundle</h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm opacity-82">
                        Register exactly 5 members together to claim a flat 50% discount on all seats in the squad.
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2.5 pt-6 border-t border-white/[0.03] mt-6">
                      <span 
                        className="text-[42px] font-bold text-indigo-400 tracking-tighter leading-none transition-all duration-200"
                        style={selectedType === 'group' ? { textShadow: '0 0 24px rgba(99,102,241,0.18)' } : undefined}
                      >
                        ₹2,500
                      </span>
                      <span className="text-sm font-bold text-slate-500 line-through opacity-45">₹5,000</span>
                    </div>
                  </motion.div>
                </div>

                {/* Left Aligned trust icon row */}
                <div className="pt-[18px] mt-[18px] border-t border-white/[0.04] flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-500 text-[11px] font-medium text-left">
                  <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-[#FBBF24] opacity-80 shrink-0" /> Verified Certification</span>
                  <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-[#FBBF24] opacity-80 shrink-0" /> Live Mentorship</span>
                  <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-[#FBBF24] opacity-80 shrink-0" /> Project-Based Learning</span>
                  <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-[#FBBF24] opacity-80 shrink-0" /> Lifetime Access</span>
                </div>
              </div>
            )}

            {/* STEP 2: Team Members Form */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-left"
              >
                {/* Lead Innovator Card */}
                {currentUser ? (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.02] border border-white/[0.03] rounded-[20px] p-5 gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 text-xs flex items-center justify-center font-black">1</span>
                      <div className="space-y-0.5 text-left">
                        <p className="text-xs font-black text-white uppercase tracking-wider">Lead Innovator (You)</p>
                        <p className="text-[13px] text-slate-400 font-medium opacity-82">{currentUser.name} · {currentUser.email}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-[#FBBF24]/70 uppercase tracking-[0.12em] bg-[#FBBF24]/5 border border-[#FBBF24]/10 px-3 py-1 rounded-md shrink-0">
                      SQUAD LEADER
                    </span>
                  </div>
                ) : (
                  <div className="bg-white/[0.02] border border-[#FBBF24]/10 p-6 rounded-[20px] relative space-y-4 shadow-[0_4px_20px_rgba(251,191,36,0.02)]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.03] pb-3 text-left">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#FBBF24]/10 text-[#FBBF24] text-[10px] flex items-center justify-center font-bold">1</span>
                        <span className="text-xs font-black text-[#FBBF24] uppercase tracking-widest font-sans">Team Member 1 (Lead / Guest)</span>
                      </div>
                      <Link href="/login" className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer">
                        🔑 Login to Auto-Prefill
                      </Link>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={members[0].name}
                        onChange={(e) => handleMemberChange(0, 'name', e.target.value)}
                        placeholder="Enter full name"
                        className="w-full bg-white/[0.03] border border-white/[0.06] h-[52px] rounded-[14px] px-4.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#7c5cff]/45 focus:ring-4 focus:ring-[#7c5cff]/8 transition-all font-medium"
                      />
                      <input
                        type="email"
                        value={members[0].email}
                        onChange={(e) => handleMemberChange(0, 'email', e.target.value)}
                        placeholder="Enter email address"
                        className="w-full bg-white/[0.03] border border-white/[0.06] h-[52px] rounded-[14px] px-4.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#7c5cff]/45 focus:ring-4 focus:ring-[#7c5cff]/8 transition-all font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* 2x2 Grid for Squad Members 2-5 */}
                <div className="grid sm:grid-cols-2 gap-6 pt-2">
                  {[1, 2, 3, 4].map((mIdx) => {
                    const memberIndex = mIdx;
                    return (
                      <div key={memberIndex} className="bg-white/[0.02] border border-white/[0.03] p-6 rounded-[20px] relative space-y-4 text-left">
                        <div className="flex items-center gap-2 border-b border-white/[0.03] pb-3">
                          <span className="w-5 h-5 rounded-full bg-white/[0.03] text-slate-400 text-[10px] flex items-center justify-center font-bold">{memberIndex + 1}</span>
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Team Member {memberIndex + 1}</span>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={members[memberIndex].name}
                            onChange={(e) => handleMemberChange(memberIndex, 'name', e.target.value)}
                            placeholder="Enter full name"
                            className="w-full bg-white/[0.03] border border-white/[0.06] h-[52px] rounded-[14px] px-4.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#7c5cff]/45 focus:ring-4 focus:ring-[#7c5cff]/8 transition-all font-medium"
                          />
                          <input
                            type="email"
                            value={members[memberIndex].email}
                            onChange={(e) => handleMemberChange(memberIndex, 'email', e.target.value)}
                            placeholder="Enter email address"
                            className="w-full bg-white/[0.03] border border-white/[0.06] h-[52px] rounded-[14px] px-4.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#7c5cff]/45 focus:ring-4 focus:ring-[#7c5cff]/8 transition-all font-medium"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 text-red-400 px-5 py-4 rounded-2xl text-xs font-bold border border-red-500/20 max-w-xl mx-auto text-left"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 sm:p-8 border-t border-white/[0.04] bg-[#090d1a]/85 backdrop-blur-md sticky bottom-0 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shrink-0">
            
            {/* Left aligned secure trust signal & microcopy */}
            <div className="space-y-1 text-left">
              <p className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
                <Lock size={12} className="text-slate-500 shrink-0" /> Payments encrypted & securely processed
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                You&apos;ll receive confirmation instantly after checkout.
              </p>
            </div>

            <button
              onClick={handleProceed}
              className="w-full sm:w-auto min-w-[320px] h-[56px] rounded-2xl font-black text-center text-[15px] tracking-[0.04em] cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden uppercase shrink-0"
              style={selectedType === 'group' 
                ? { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', boxShadow: '0 10px 40px rgba(99,102,241,0.16)' }
                : { background: '#FBBF24', color: '#020617', boxShadow: '0 10px 40px rgba(251,191,36,0.16)' }
              }
            >
              {/* Refined Shine effect */}
              <motion.div
                className="absolute inset-0 bg-white/20 -translate-x-full"
                animate={{ x: '200%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10 flex items-center gap-2">
                {selectedType === 'solo' 
                  ? 'Continue to Secure Checkout' 
                  : step === 1 
                    ? 'Continue to Details' 
                    : 'Proceed with Squad Enrollment'
                }
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────

export default function SummerCampDetailPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [openSection, setOpenSection] = useState<string>('w1');
  const [mounted, setMounted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    // Fetch current user details
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    // Check enrollment status
    async function checkEnrollment() {
      try {
        const res = await fetch('/api/student/my-courses');
        const data = await res.json();
        if (data.success && data.courses) {
          const enrolled = data.courses.some((c: any) => c.slug === 'summer-camp-2026' || c.id === 'summer-camp-2026');
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error('Enrollment check failed:', err);
      }
    }
    checkEnrollment();
  }, []);

  // Hydration Guard to prevent blank screen on client-side navigation
  if (!mounted) {
    return <div className="min-h-screen bg-[#020617]" />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] text-slate-300 selection:bg-[#FBBF24] selection:text-[#020617]">

      {/* ── CINEMATIC BACKGROUND SYSTEM ── */}
      <div className="fixed inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.65, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={TAB_IMAGES[activeTab]}
              alt="Background"
              fill
              priority
              className="object-cover"
              sizes="100vw"
              quality={70}
            />
          </motion.div>
        </AnimatePresence>

        {/* Layered Gradient Overlay (As Requested) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.88) 35%, rgba(2,6,23,0.6) 65%, rgba(2,6,23,0.4) 100%)'
          }}
        />

        {/* Radial Ambient Glows */}
        <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-[#FBBF24]/[0.05] blur-[140px] -translate-x-1/4 -translate-y-1/4 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-indigo-500/[0.05] blur-[140px] translate-x-1/4 translate-y-1/4 pointer-events-none" />

        {/* Grain Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')] mix-blend-soft-light" />
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-24 pb-32">

        {/* Header / Nav */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <Link href="/courses">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all text-xs font-bold cursor-pointer group mb-12">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Catalog
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 border border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] shadow-[0_0_10px_#FBBF24]" />
              Summer Camp 2026
            </div>
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
              <span className="text-[#FBBF24] font-bold text-xs animate-pulse">●</span>
              <span className="text-slate-400 text-[11px] font-bold ml-1 uppercase tracking-wider">1,937 Students Registered — New Entry Every Minute</span>
            </div>
          </div>

          <h1 className="text-[clamp(48px,8vw,92px)] font-extrabold text-white leading-[0.9] tracking-[-0.04em] mb-10">
            SARTHI<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBF24] via-[#FBBF24] to-[#FBBF24]/70">Summer Camp</span>
          </h1>
        </motion.div>

        {/* ── 60/40 PREMIUM GRID ── */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-16 lg:gap-24 items-start">

          {/* ═══ LEFT CONTENT ═══ */}
          <div className="space-y-24">

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-slate-400 text-lg sm:text-xl leading-[1.8] max-w-2xl font-medium">
                A hands-on summer experience where young innovators learn{' '}
                <span className="text-white font-bold border-b border-[#FBBF24]/50">Python</span> from scratch. Build automation, explore AI, and master the future of technology — all led by Expert Mentor.
              </p>
            </motion.div>

            {/* Instructor / Meta Row */}
            <div className="flex flex-wrap items-center gap-x-12 gap-y-8 pb-12 border-b border-white/5">
              <div className="flex items-center gap-6 min-w-[240px]">
                {/* Photo Removed */}
                <div className="space-y-1">
                  <p className="text-[10px] md:text-[11px] text-[#FBBF24] uppercase tracking-[0.3em] font-black">Curriculum Lead</p>
                  <p className="text-lg md:text-2xl font-black text-white tracking-tight">Expert Mentor</p>
                </div>
              </div>

              <div className="flex gap-12 flex-1 min-w-[300px] justify-between md:justify-start md:gap-16">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Language</p>
                  <p className="text-[15px] font-bold text-white">English / Hindi</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Ages</p>
                  <p className="text-[15px] font-bold text-white">10 – 18 Years</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Duration</p>
                  <p className="text-[15px] font-bold text-white">4 Weeks</p>
                </div>
              </div>
            </div>

            {/* Mobile-Only Price Card (Positioned Above Features as Requested) */}
            <div className="lg:hidden">
              <PriceCard isEnrolled={isEnrolled} onJoinAdventure={() => setIsModalOpen(true)} />
            </div>

            {/* Feature Cards (Premium Glass) */}
            <div className="grid grid-cols-2 gap-5">
              {features.map(({ Icon, title, sub }) => (
                <motion.div
                  key={title}
                  whileHover={{ y: -6, borderColor: 'rgba(251,191,36,0.35)' }}
                  className="p-7 rounded-[28px] border border-white/5 bg-white/[0.02] backdrop-blur-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FBBF24]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-[#FBBF24]" />
                  </div>
                  <p className="text-white text-[16px] font-bold mb-1">{title}</p>
                  <p className="text-slate-500 text-sm font-medium">{sub}</p>
                </motion.div>
              ))}
            </div>

            {/* ── TABS SYSTEM ── */}
            <div className="space-y-12 pt-12">
              <div className="flex gap-1.5 p-1.5 rounded-[20px] bg-white/[0.03] border border-white/5 backdrop-blur-md">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-3.5 text-[13px] font-black uppercase tracking-widest rounded-2xl transition-all duration-500 relative overflow-hidden"
                    style={activeTab === tab ? { color: '#020617' } : { color: '#94A3B8' }}
                  >
                    {activeTab === tab && (
                      <motion.div layoutId="activeTabGlow" className="absolute inset-0 bg-[#FBBF24]" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
                    )}
                    <span className="relative z-10">{tab}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content Panels */}
              <AnimatePresence mode="wait">
                {activeTab === 'Overview' && (
                  <motion.section
                    key="overview"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-10"
                  >
                    <motion.div variants={itemVariants} className="flex items-center gap-4">
                      <div className="w-10 h-[2px] bg-[#FBBF24]/50" />
                      <h2 className="text-3xl font-black text-white">What You&apos;ll Learn</h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      {[
                        'Python Foundations & Logic Building',
                        'Real-World Programming (Lists, Dicts, Files)',
                        'Automation & Utility Scripting',
                        'GUI Development with Tkinter',
                        'Introduction to AI, APIs & Web Basics',
                        'Object-Oriented Programming & Data Science',
                      ].map((point, i) => (
                        <motion.div key={i} variants={itemVariants} className="flex items-start gap-4 p-6 rounded-[24px] bg-white/[0.02] border border-white/5">
                          <div className="mt-1 w-6 h-6 rounded-full bg-[#FBBF24]/10 flex items-center justify-center shrink-0">
                            <CheckCircle size={14} className="text-[#FBBF24]" />
                          </div>
                          <p className="text-slate-300 text-[15px] font-medium leading-relaxed">{point}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {activeTab === 'Curriculum' && (
                  <motion.section
                    key="curriculum"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-10"
                  >
                    <motion.div variants={itemVariants} className="flex items-center gap-4">
                      <div className="w-10 h-[2px] bg-[#FBBF24]/50" />
                      <h2 className="text-3xl font-black text-white">Python Curriculum</h2>
                    </motion.div>
                    <div className="space-y-4">
                      {curriculum.map((sec) => (
                        <motion.div key={sec.id} variants={itemVariants} className="rounded-[28px] overflow-hidden border border-white/5 bg-white/[0.02]">
                          <button onClick={() => setOpenSection(openSection === sec.id ? '' : sec.id)}
                            className="w-full flex justify-between items-center p-7 text-left hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center gap-5">
                              <div className="w-2 h-2 rounded-full bg-[#FBBF24] shadow-[0_0_8px_#FBBF24]" />
                              <span className="text-white font-bold text-lg">{sec.title}</span>
                            </div>
                            <ChevronDown size={20} className="text-slate-500 transition-transform duration-500"
                              style={{ transform: openSection === sec.id ? 'rotate(180deg)' : 'none' }} />
                          </button>
                          <AnimatePresence>
                            {openSection === sec.id && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="border-t border-white/5 overflow-hidden"
                              >
                                <div className="p-3 space-y-1">
                                  {sec.lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between px-7 py-4.5 rounded-2xl hover:bg-white/[0.03] transition-colors group">
                                      <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white/[0.03] flex items-center justify-center group-hover:bg-[#FBBF24]/10 transition-colors">
                                          <PlayCircle size={16} className="text-slate-600 group-hover:text-[#FBBF24] transition-colors" />
                                        </div>
                                        <span className="text-slate-300 text-[15px] font-medium">{lesson.title}</span>
                                      </div>
                                      <span className="text-slate-600 text-xs font-black font-mono">{lesson.duration}m</span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {activeTab === 'Instructor' && (
                  <motion.section
                    key="instructor"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-10"
                  >
                    <motion.div variants={itemVariants} className="flex items-center gap-4">
                      <div className="w-10 h-[2px] bg-[#FBBF24]/50" />
                      <h2 className="text-3xl font-black text-white">Academy Lead</h2>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-[40px] p-12 relative overflow-hidden group border border-white/5 bg-white/[0.02]">
                      <div className="flex flex-col sm:flex-row items-start gap-10 relative z-10">
                        {/* Photo Removed */}
                        <div>
                          <h3 className="text-3xl font-black text-white mb-2">Expert Mentor</h3>
                          <p className="text-xs font-black uppercase tracking-[0.4em] mb-7 text-[#FBBF24]">Curriculum Director</p>
                          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                            With over a decade in system architecture and automation, Mohit has built SARTHI into India&apos;s premier tech mentorship platform. His teaching style skips the fluff and goes straight to building industry-grade software.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.section>
                )}

                {activeTab === 'Feedback' && (
                  <motion.section
                    key="feedback"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-10"
                  >
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-[2px] bg-[#FBBF24]/50 shrink-0" />
                        <h2 className="text-3xl font-black text-white">Why Students Are Joining</h2>
                      </div>
                      <div className="inline-flex items-center px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 shrink-0 w-fit">
                        <span className="text-white font-black text-[15px]">🔥 Summer Batch Filling Fast</span>
                      </div>
                    </motion.div>
                    <div className="grid gap-6">
                      {reviews.map((r) => (
                        <motion.div key={r.id} variants={itemVariants} className="p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                          <div className="flex items-center gap-5 mb-6">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                              <Image src={r.image} alt={r.name} width={56} height={56} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-[16px]">{r.name}</p>
                              <p className="text-[#FBBF24] opacity-90 text-xs font-black uppercase tracking-wider">{r.role}</p>
                            </div>
                          </div>
                          <p className="text-slate-400 text-base leading-relaxed italic">&quot;{r.text}&quot;</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* ═══ RIGHT STICKY PRICING ═══ */}
          <div className="lg:sticky lg:top-24 hidden lg:block">
            <PriceCard isEnrolled={isEnrolled} onJoinAdventure={() => setIsModalOpen(true)} />
          </div>

        </div>
      </div>

      {/* ── PREMIUM MOBILE PRICING FOOTER ── */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[1001] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] bg-[#020617]/95 backdrop-blur-3xl border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-center justify-between gap-5 max-w-lg mx-auto">
          <div className="shrink-0">
            <p className="text-[#FBBF24] text-[9px] font-black uppercase tracking-[0.25em] mb-1">
              {isEnrolled ? 'OFFICIAL STATUS' : 'LIMITED TIME'}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-white tracking-tighter">
                {isEnrolled ? 'Enrolled' : '₹1,000'}
              </p>
              {!isEnrolled && (
                <span className="text-slate-500 line-through text-[11px] font-bold opacity-60">₹4,999</span>
              )}
            </div>
          </div>
          
          {isEnrolled ? (
            <Link href="/dashboard" className="flex-1">
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-black text-center text-sm bg-[#FBBF24] text-[#020617] shadow-[0_8px_25px_rgba(251,191,36,0.4)] relative overflow-hidden group"
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-white/30 -translate-x-full"
                  animate={{ x: '200%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Go to Learning
                  <ArrowRight size={16} className="group-active:translate-x-1 transition-transform" />
                </span>
              </motion.div>
            </Link>
          ) : (
            <div onClick={() => setIsModalOpen(true)} className="flex-1 cursor-pointer">
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-black text-center text-sm bg-[#FBBF24] text-[#020617] shadow-[0_8px_25px_rgba(251,191,36,0.4)] relative overflow-hidden group"
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-white/30 -translate-x-full"
                  animate={{ x: '200%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Join the Camp Now
                  <ArrowRight size={16} className="group-active:translate-x-1 transition-transform" />
                </span>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      <JoinAdventureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
