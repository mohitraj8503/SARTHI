'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronRight, Check, Sparkles, Brain, Loader2, ArrowRight, Star, Clock, Trophy, Lock, Zap } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import Link from 'next/link';

interface Option {
  text: string;
  primary: string; // WEB | AI | DES | BIZ | GAME | ROB
  secondary: string;
  emoji: string;
}

interface Question {
  id: number;
  text: string;
  comment: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What excites you the most when you think about the future?",
    comment: "Let's identify your core drive.",
    options: [
      { text: "Building apps and websites that millions use.", primary: "WEB", secondary: "DES", emoji: "💻" },
      { text: "Designing beautiful, eye-catching visual experiences.", primary: "DES", secondary: "WEB", emoji: "🎨" },
      { text: "Teaching machines to think, learn, and predict.", primary: "AI", secondary: "ROB", emoji: "🤖" },
      { text: "Growing a brand, analyzing numbers, and maximizing profits.", primary: "BIZ", secondary: "DES", emoji: "📈" },
      { text: "Creating immersive, interactive digital worlds.", primary: "GAME", secondary: "WEB", emoji: "🎮" },
      { text: "Wiring hardware and building physical machines.", primary: "ROB", secondary: "AI", emoji: "⚙️" }
    ]
  },
  {
    id: 2,
    text: "When faced with a complex problem, what's your first move?",
    comment: "How does your brain process challenges?",
    options: [
      { text: "Break it down into logical steps and algorithms.", primary: "AI", secondary: "WEB", emoji: "🧠" },
      { text: "Sketch out a visual mind map or wireframe.", primary: "DES", secondary: "BIZ", emoji: "✏️" },
      { text: "Look for the most profitable or efficient solution.", primary: "BIZ", secondary: "AI", emoji: "💰" },
      { text: "Tinker with the code or parts until it works.", primary: "WEB", secondary: "GAME", emoji: "🔧" },
      { text: "Think about how a user or player will experience it.", primary: "GAME", secondary: "DES", emoji: "👥" },
      { text: "Build a physical prototype to test it out.", primary: "ROB", secondary: "BIZ", emoji: "🛠️" }
    ]
  },
  {
    id: 3,
    text: "If you had a free weekend with no limits, what would you do?",
    comment: "Your hobbies reveal your true strengths.",
    options: [
      { text: "Binge-watch startup case studies and finance videos.", primary: "BIZ", secondary: "AI", emoji: "📊" },
      { text: "Try out a new game engine or mod a favorite game.", primary: "GAME", secondary: "WEB", emoji: "🕹️" },
      { text: "Redecorate my space or create digital art.", primary: "DES", secondary: "WEB", emoji: "🖼️" },
      { text: "Write a custom automation script for my daily tasks.", primary: "WEB", secondary: "AI", emoji: "⌨️" },
      { text: "Read about the latest AI models and neural networks.", primary: "AI", secondary: "ROB", emoji: "🔬" },
      { text: "Take apart an old gadget to see how it works inside.", primary: "ROB", secondary: "GAME", emoji: "🔌" }
    ]
  },
  {
    id: 4,
    text: "What kind of work environment sounds best to you?",
    comment: "Where do you thrive?",
    options: [
      { text: "A fast-paced room tracking metrics, sales, and growth.", primary: "BIZ", secondary: "DES", emoji: "🏢" },
      { text: "Deep in code, turning logic into functional software.", primary: "WEB", secondary: "BIZ", emoji: "🖥️" },
      { text: "Analyzing massive datasets to find hidden patterns.", primary: "AI", secondary: "BIZ", emoji: "🔍" },
      { text: "Perfecting colors, typography, and user psychology.", primary: "DES", secondary: "GAME", emoji: "🎨" },
      { text: "Building mechanics, levels, and interactive stories.", primary: "GAME", secondary: "DES", emoji: "👾" },
      { text: "Hands-on, soldering components and testing motors.", primary: "ROB", secondary: "AI", emoji: "🦾" }
    ]
  },
  {
    id: 5,
    text: "If you could have one tech superpower, what would it be?",
    comment: "Dream big.",
    options: [
      { text: "Predicting market trends with 100% accuracy.", primary: "BIZ", secondary: "AI", emoji: "🔮" },
      { text: "Designing interfaces that perfectly control human psychology.", primary: "DES", secondary: "BIZ", emoji: "👁️" },
      { text: "Instantly knowing and writing any programming language.", primary: "WEB", secondary: "AI", emoji: "✨" },
      { text: "Creating digital avatars that feel completely alive.", primary: "GAME", secondary: "AI", emoji: "🎭" },
      { text: "Having a personal robot assistant I built from scratch.", primary: "ROB", secondary: "WEB", emoji: "🤖" },
      { text: "Building an AI that can solve any complex global equation.", primary: "AI", secondary: "WEB", emoji: "🪐" }
    ]
  },
  {
    id: 6,
    text: "What is the ultimate goal you want to achieve?",
    comment: "The final destination.",
    options: [
      { text: "To be a CTO or lead full-stack developer.", primary: "WEB", secondary: "BIZ", emoji: "👑" },
      { text: "To build a wildly successful tech or e-commerce empire.", primary: "BIZ", secondary: "WEB", emoji: "🚀" },
      { text: "To design an award-winning brand or app interface.", primary: "DES", secondary: "BIZ", emoji: "💎" },
      { text: "To engineer the next generation of smart hardware.", primary: "ROB", secondary: "AI", emoji: "🛸" },
      { text: "To publish a hit indie game with a massive community.", primary: "GAME", secondary: "DES", emoji: "🏆" },
      { text: "To develop an AI model that fundamentally changes the world.", primary: "AI", secondary: "ROB", emoji: "🌌" }
    ]
  }
];

export default function FindMyCourseQuiz() {
  const [step, setStep] = useState<'welcome' | 'quiz' | 'analyzing' | 'result'>('welcome');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [commentary, setCommentary] = useState("Let's get started!");

  // Standardized Parallax Orbs
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const orbs = document.querySelectorAll('.induction-orb');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (0.5 - x) * speed;
        const yOffset = (0.5 - y) * speed;
        (orb as HTMLElement).style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleStartQuiz = () => {
    triggerHaptic('medium');
    setStep('quiz');
    setCurrentIdx(0);
    setSelectedOptions([]);
    setCommentary("Let's identify your core strengths first!");
  };

  const handleAnswerSelect = (option: Option) => {
    triggerHaptic('light');
    const newOptions = [...selectedOptions, option];
    setSelectedOptions(newOptions);

    if (currentIdx < QUESTIONS.length - 1) {
      const nextIdx = currentIdx + 1;
      setCommentary(QUESTIONS[currentIdx].comment);
      setCurrentIdx(nextIdx);
    } else {
      setStep('analyzing');
      setTimeout(() => {
        triggerHaptic('notification');
        setStep('result');
      }, 2000);
    }
  };

  const resultData = useMemo(() => {
    if (selectedOptions.length === 0) return { title: '', matchTitle: '', desc: '', category: '', thumbnail: '', slug: '', roadmap: [], careers: [], salary: '', icon: '', matchPercentage: 0, duration: '' };
    
    const trackScores: Record<string, number> = { WEB: 0, AI: 0, DES: 0, BIZ: 0, GAME: 0, ROB: 0 };
    selectedOptions.forEach(opt => {
      if (opt.primary) trackScores[opt.primary] = (trackScores[opt.primary] || 0) + 4;
      if (opt.secondary) trackScores[opt.secondary] = (trackScores[opt.secondary] || 0) + 1;
    });

    let winner = 'WEB';
    let maxScore = -1;
    Object.entries(trackScores).forEach(([track, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winner = track;
      }
    });

    let rawPct = Math.round((maxScore / 24) * 100);
    let matchPct = rawPct;
    if (matchPct < 75) {
      matchPct = Math.min(98, matchPct + 20);
    }

    const outcomes: Record<string, any> = {
      WEB: {
        title: "The Digital Builder",
        matchTitle: "Full Stack Web Development",
        desc: "You are a creator at heart. You love taking an idea and building it from scratch until it works perfectly on a screen. You thrive on logic and functional execution.",
        category: "Development",
        thumbnail: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&h=600&fit=crop",
        slug: "python-beginners",
        roadmap: ["HTML5 & CSS3 Core", "Next.js SSR Framework", "Backend Server REST APIs", "Database & Cloud Deploy"],
        careers: ["Full Stack Developer", "Frontend Engineer", "Backend Engineer", "Software Architect"],
        salary: "₹6–15 LPA",
        icon: "💻",
        duration: "16 Weeks"
      },
      AI: {
        title: "The Intelligence Architect",
        matchTitle: "AI & Data Science Professional",
        desc: "You are fascinated by the future. You rely on heavy logic, pattern recognition, and you want to build systems that learn and evolve on their own.",
        category: "AI & Data Science",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&h=600&fit=crop",
        slug: "python-beginners",
        roadmap: ["Python Core Expert", "Data Analytics & SQL", "Machine Learning models", "Deep Learning & Neural networks"],
        careers: ["AI Engineer", "Machine Learning Scientist", "Data Analyst", "NLP Architect"],
        salary: "₹6–18 LPA",
        icon: "🤖",
        duration: "20 Weeks"
      },
      DES: {
        title: "The Creative Visionary",
        matchTitle: "UI/UX Design & Digital Marketing",
        desc: "You have an eye for aesthetics and human psychology. You understand what looks good, what grabs attention, and how to visually guide a user.",
        category: "Creative Arts",
        thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop",
        slug: "advanced-excel",
        roadmap: ["Aesthetics & Wireframing", "Figma Design Systems", "User Experience Auditing", "Digital Marketing Analytics"],
        careers: ["UI/UX Designer", "Product Designer", "Brand Strategist", "Growth Manager"],
        salary: "₹5–12 LPA",
        icon: "🎨",
        duration: "12 Weeks"
      },
      BIZ: {
        title: "The Business Strategist",
        matchTitle: "Advanced Excel, GST & Business Analytics",
        desc: "You are pragmatic and numbers-driven. You understand that logic, finance, and optimization are the backbone of any successful venture.",
        category: "Business Analytics",
        thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop",
        slug: "gst-filing",
        roadmap: ["Accounting Equations", "Excel Formulas & Pivots", "GST Filing returns", "Business Casework audits"],
        careers: ["Taxation Consultant", "GST Practitioner", "Business Analyst", "Auditor"],
        salary: "₹4–15 LPA",
        icon: "📈",
        duration: "10 Weeks"
      },
      GAME: {
        title: "The World Creator",
        matchTitle: "Game Development & Mechanics",
        desc: "You want to create experiences, not just tools. You love interactive storytelling, user engagement, and pushing the boundaries of digital entertainment.",
        category: "Game Design",
        thumbnail: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&h=600&fit=crop",
        slug: "python-beginners",
        roadmap: ["C++ Core Architectures", "Unity/Unreal Gameplay Scripts", "Physics Engine Mechanics", "Immersive Level Designs"],
        careers: ["Game Developer", "Gameplay Programmer", "Level Designer", "Indie Creator"],
        salary: "₹5–14 LPA",
        icon: "🎮",
        duration: "18 Weeks"
      },
      ROB: {
        title: "The Hardware Hacker",
        matchTitle: "Robotics & Embedded Systems",
        desc: "You aren't satisfied with just software; you want to make physical things move. You love tinkering, prototyping, and blending code with real-world engineering.",
        category: "Embedded Engineering",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&h=600&fit=crop",
        slug: "python-beginners",
        roadmap: ["Electronics & Circuits Core", "C++ Firmware programming", "Arduino & Microcontrollers", "IoT Sensors integration"],
        careers: ["Robotics Engineer", "Embedded Developer", "Firmware Specialist", "IoT Architect"],
        salary: "₹6–16 LPA",
        icon: "⚙️",
        duration: "14 Weeks"
      }
    };

    const currentWinner = outcomes[winner] || outcomes.AI;
    return { ...currentWinner, matchPercentage: matchPct };
  }, [selectedOptions]);

  return (
    <div className="induction-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .induction-page-wrapper {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #FDFBF7 0%, #F8F5F0 100%);
          color: #1F2937;
          min-height: 96vh;
          position: relative;
        }

        .induction-orbs {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }

        .induction-orb {
          position: absolute; border-radius: 50%; opacity: 0.08;
          animation: induction-float 20s infinite ease-in-out;
          transition: transform 0.1s ease-out;
        }

        .induction-orb-1 { width: 600px; height: 600px; background: #1B4332; top: -200px; right: -100px; }
        .induction-orb-2 { width: 400px; height: 400px; background: #40916C; bottom: -100px; left: -100px; }

        @keyframes induction-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }

        .induction-shell {
          position: relative; z-index: 10;
          max-width: 1600px; margin: 0 auto;
          padding: 10rem 2rem 6rem;
        }

        .induction-hero { margin-bottom: 3rem; }

        .induction-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(45, 106, 79, 0.1) 100%);
          color: #1B4332; padding: 0.625rem 1.25rem; border-radius: 50px;
          font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; letter-spacing: 0.5px;
        }

        .induction-title {
          font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; color: #1B4332;
          line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -1px;
        }

        .induction-subtitle {
          font-size: 1.25rem; color: #6B7280; max-width: 650px; line-height: 1.7;
        }

        .option-item-card {
          background: white; border: 1.5px solid #E5E7EB;
          border-radius: 20px; padding: 1rem 1.25rem; text-align: left;
          cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex; align-items: center; gap: 1rem;
          min-height: 72px;
        }

        .option-item-card:hover {
          border-color: #1B4332;
          box-shadow: 0 10px 25px rgba(27, 67, 50, 0.05);
          transform: translateY(-2px);
        }

        .progress-bar-fill {
          height: 100%; background: #1B4332; border-radius: 9999px;
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      <div className="induction-orbs">
        <div className="induction-orb induction-orb-1" />
        <div className="induction-orb induction-orb-2" />
      </div>

      <div className="induction-shell">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }}>
              <section className="induction-hero">
                <div className="induction-badge"><span>🎓</span><span>AI CAREER DISCOVERY</span></div>
                <h1 className="induction-title">Let&apos;s Find Your Perfect Course</h1>
                <p className="induction-subtitle">Answer a few fun questions and our AI will recommend the best learning path based on your interests, strengths, and future goals.</p>
              </section>

              <div className="p-8 md:p-12 bg-white/60 backdrop-blur-md rounded-[3rem] border border-white/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
                <div className="space-y-4 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#40916C]/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#40916C]">⚡ AI ALGORITHM</div>
                  <h2 className="text-2xl font-extrabold text-[#1B4332] tracking-tight uppercase">Start Your Guided Assessment</h2>
                  <p className="text-sm text-gray-600 font-medium">Answer 6 simple interest-based questions. No tech background required.</p>
                </div>
                <button 
                  onClick={handleStartQuiz}
                  className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-8 py-5 bg-[#1B4332] text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-[#2D6A4F] active:scale-95 transition-all shadow-lg shadow-[#1B4332]/20 cursor-pointer"
                >
                  Start Journey
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quote Section */}
              <div className="mt-20 max-w-3xl mx-auto text-center border-t border-gray-200/50 pt-12">
                <p className="text-lg md:text-xl font-medium text-gray-500 italic leading-relaxed">
                  &quot;Education is the milk of a tigress, and he who drinks it will roar.&quot;
                </p>
                <span className="block text-xs font-black uppercase text-[#1B4332] tracking-wider mt-4">
                  — Dr. B. R. Ambedkar
                </span>
              </div>
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35 }} className="max-w-[900px] mx-auto">
              <section className="induction-hero">
                <div className="induction-badge"><span>✨</span><span>QUESTION {currentIdx + 1} OF {QUESTIONS.length}</span></div>
                <h1 className="induction-title">{QUESTIONS[currentIdx].text}</h1>
                <p className="induction-subtitle italic">{`"${commentary}"`}</p>
              </section>

              <div className="p-4 bg-white border border-[#E5E7EB] rounded-[1.5rem] shadow-sm mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
                  <span>⏱ 2 Minutes remaining</span>
                  <span>{Math.round((currentIdx / QUESTIONS.length) * 100)}% Completed</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="progress-bar-fill" style={{ width: `${(currentIdx / QUESTIONS.length) * 100}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {QUESTIONS[currentIdx].options.map(opt => (
                  <motion.div
                    whileHover={{ scale: 1.015, translateY: -2 }}
                    whileTap={{ scale: 0.985 }}
                    key={opt.text}
                    onClick={() => handleAnswerSelect(opt)}
                    className="option-item-card cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#1B4332]/5 flex items-center justify-center text-xl shrink-0 transition-colors group-hover:bg-[#1B4332]/10">
                      {opt.emoji}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#1B4332] leading-snug">{opt.text}</h3>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-[600px] mx-auto text-center py-20 bg-white border border-white/80 rounded-[3rem] shadow-xl"
            >
              <Loader2 className="w-12 h-12 text-[#1B4332] animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-bold text-[#1B4332]">Compiling Recommendations...</h3>
              <p className="text-gray-400 text-xs mt-2 max-w-[300px] mx-auto leading-relaxed">
                Analyzing interests, grade parameters, and learning style to generate your custom path.
              </p>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="text-left"
            >
              {/* Result Hero Header */}
              <section className="induction-hero">
                <div className="induction-badge">
                  <span>✨</span>
                  <span>{resultData.matchPercentage}% Compatibility Match</span>
                </div>
                <h1 className="induction-title">We Found Your Perfect Match!</h1>
                <p className="induction-subtitle">
                  Based on your answers, our AI recommendations highlight this career path as your highest potential track.
                </p>
              </section>

              {/* Exact card layout matching InductionCard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-8">
                
                {/* Result Card */}
                <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(27,67,50,0.1)] hover:shadow-[0_30px_80px_-20px_rgba(27,67,50,0.2)] transition-all duration-500 border border-white flex flex-col h-full text-left">
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video overflow-hidden shrink-0 group-hover:shadow-2xl transition-all duration-700">
                    <img 
                      src={resultData.thumbnail} 
                      alt={resultData.title} 
                      className="object-cover w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8 lg:p-10 flex flex-col flex-1 justify-between gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#40916C]">
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          {resultData.category}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[#6B7280] bg-[#F3F4F6] px-3 py-1.5 rounded-full uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5 text-[#40916C]" />
                          {resultData.duration}
                        </div>
                      </div>

                      <h3 className="text-xl md:text-2xl font-extrabold text-[#1F2937] leading-tight mb-3 group-hover:text-[#1B4332] transition-colors">
                        {resultData.matchTitle}
                      </h3>

                      <p className="text-xs text-[#6B7280] leading-relaxed mb-6 font-medium">
                        Accelerate your knowledge with verified certificates, real projects, and dedicated career guidance.
                      </p>

                      {/* Milestone preview */}
                      <div className="mb-6 p-4 bg-[#FCFBF8] border border-gray-100 rounded-xl space-y-1.5">
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-2">Roadmap Milestones:</span>
                        {resultData.roadmap.map((stepName, sIdx) => (
                          <div key={stepName} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                            <span className="w-4 h-4 rounded-full bg-[#1B4332] text-white text-[8px] font-black flex items-center justify-center shrink-0">
                              {sIdx + 1}
                            </span>
                            <span className="truncate">{stepName}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1">Outcomes</span>
                        <span className="text-sm md:text-base font-black text-[#1B4332]">{resultData.salary}</span>
                      </div>
                      
                      <Link href={`/courses/${resultData.slug}`} className="flex-1">
                        <button 
                          onClick={() => triggerHaptic('medium')}
                          className="w-full flex items-center justify-center gap-1.5 py-3.5 bg-[#1B4332] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#2D6A4F] active:scale-95 transition-all shadow-lg shadow-[#1B4332]/20 text-center"
                        >
                          <span>Start Learning</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Right block: why & careers details */}
                <div className="space-y-6">
                  {/* Persona details */}
                  <div className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-8 shadow-sm">
                    <span className="inline-flex items-center gap-1 bg-[#1B4332]/10 text-[#1B4332] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider mb-4">
                      <Sparkles className="w-3 h-3 fill-[#1B4332]" />
                      <span>{resultData.title}</span>
                    </span>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-3">Why We Recommend This:</h4>
                    <p className="text-xs font-bold text-gray-700 leading-relaxed">{resultData.desc}</p>
                  </div>

                  {/* Careers opportunities card */}
                  <div className="bg-white border border-[#E5E7EB] rounded-[2.5rem] p-8 shadow-sm">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-4">Career Opportunities:</span>
                    <div className="flex flex-wrap gap-2">
                      {resultData.careers.map(job => (
                        <span key={job} className="text-xs font-bold text-gray-700 border border-gray-200 bg-white px-3.5 py-1.5 rounded-xl shadow-sm">
                          {job}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions card */}
                  <div className="p-8 bg-[#1B4332] rounded-[2.5rem] text-white">
                    <h3 className="text-lg font-bold mb-2">Ready to explore?</h3>
                    <p className="text-white/80 text-xs leading-relaxed mb-6 font-medium">Click below to restart the discovery quiz if your interests or target parameters have changed.</p>
                    <button
                      onClick={handleStartQuiz}
                      className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                    >
                      Restart Discovery Quiz
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
