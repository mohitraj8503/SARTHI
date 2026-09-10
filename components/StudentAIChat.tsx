'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, MessageSquare, ArrowRight, Bot, User, Sun, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from './AuthProvider';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'metric' | 'suggestion' | 'course_cards' | 'clarification';
  metricLabel?: string;
  metricValue?: string | number;
  suggestions?: { id: string; label: string; link: string; icon?: any }[];
  courses?: { id: string; title: string; price: number; originalPrice?: number; level: string; link: string; image?: string }[];
}

const placeholders = [
  "Ask about Python course...",
  "Ask about Summer Camp...",
  "Ask for a discount...",
  "Ask about job placements..."
];

export default function StudentAIChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: user 
        ? `Namaste ${user.name?.split(' ')[0]}! I am your SARTHI AI assistant. 👋 Ready to master the skills of the future? I can help you find the best course for your career goals.`
        : "Namaste! I am SARTHI AI, your official guide. Ask me anything about our courses, the Summer Camp, or how to start your tech journey!",
      suggestions: [
        { id: 'python', label: 'Python & AI', link: '/courses', icon: BookOpen },
        { id: 'camp', label: 'Summer Camp', link: '/courses', icon: Sun },
        { id: 'internship', label: 'Internships', link: '/internship', icon: GraduationCap }
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ai-assistant', handleOpen);

    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 4000);

    return () => {
      window.removeEventListener('open-ai-assistant', handleOpen);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = overrideQuery || input.trim();
    if (!queryToUse || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: queryToUse }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/public/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: queryToUse,
          userData: user ? { name: user.name, email: user.email } : undefined
        }),
      });

      const data = await res.json();

      if (data.success && data.answer?.content) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer.content,
          type: data.answer.type,
          suggestions: data.answer.suggestions,
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message || "Hello! How can I help guide your learning journey today?",
          suggestions: data.answer?.suggestions || [
            { id: 'courses', label: 'Browse Courses', link: '/courses' },
            { id: 'internship', label: 'Internships', link: '/internship/apply' },
            { id: 'contact', label: 'Contact Team', link: '/contact' }
          ]
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I am ready to help! Please tell me which course or program you'd like to explore.",
        suggestions: [
          { id: 'courses', label: 'Browse Courses', link: '/courses' },
          { id: 'internship', label: 'Internships', link: '/internship/apply' }
        ]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
        {/* Backdrop - Dreamy Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
        />

        {/* Main Glass Container - Apple Level Premium */}
        <motion.div
          initial={{ y: '100%', opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: '100%', opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            "relative w-full max-w-lg h-[90vh] sm:h-[680px]",
            "bg-slate-900/60 backdrop-blur-2xl", // Deep semi-transparent blur
            "border border-white/10 ring-1 ring-inset ring-white/10", // Crisp edge + Inner glow
            "rounded-t-[40px] sm:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.1)]", // Elevation + Brand Glow
            "flex flex-col overflow-hidden"
          )}
        >
          {/* Header - Layered Glass */}
          <div className="p-6 pb-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.div 
                  animate={{ 
                    boxShadow: ["0 0 0px rgba(52,211,153,0)", "0 0 25px rgba(52,211,153,0.5)", "0 0 0px rgba(52,211,153,0)"] 
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-16 h-16 rounded-[20px] bg-white flex items-center justify-center border-2 border-white/30 shadow-2xl relative z-10 overflow-hidden"
                  style={{ imageRendering: 'high-quality' }}
                >
                  <Image 
                    src="/sarthi-logo.png" 
                    alt="SARTHI AI" 
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    priority 
                    unoptimized
                  />
                </motion.div>
              </div>
              <div>
                <h3 className="text-white font-bold text-2xl tracking-tight leading-none mb-1">SARTHI AI</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]" />
                  <span className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.1em] opacity-90">Personal Career Guide • Student Support</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-11 h-11 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all active:scale-90 flex items-center justify-center border border-white/10 backdrop-blur-md"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content Area */}
          <>
            {/* Messages Area - Frosted Glass Content */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scroll-smooth no-scrollbar"
              >
                {messages.map((msg, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[88%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-white/20 overflow-hidden relative",
                        msg.role === 'user' ? 'bg-emerald-600' : 'bg-white'
                      )}>
                        {msg.role === 'user' ? (
                          user?.image ? (
                            <Image src={user.image} alt={user.name || 'Student'} fill className="object-cover" />
                          ) : (
                            <User size={20} className="text-white" />
                          )
                        ) : (
                          <Image 
                            src="/sarthi-logo.png" 
                            alt="SARTHI AI" 
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            unoptimized
                            style={{ imageRendering: 'high-quality' }}
                          />
                        )}
                      </div>
                      
                      <div className={`space-y-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 sm:p-5 rounded-3xl text-[15px] leading-relaxed shadow-xl ${
                          msg.role === 'user' 
                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                            : 'bg-white/10 text-gray-200 border border-white/10 rounded-tl-none backdrop-blur-md'
                        }`}>
                          {msg.content.split(/\r?\n/).filter(Boolean).map((line: string, idx: number) => (
                            <span key={idx} className="block">{line}</span>
                          ))}
                        </div>

                        {/* Course Cards - Premium Glass Cards */}
                        {msg.type === 'course_cards' && msg.courses && (
                          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-4 px-4 no-scrollbar">
                            {msg.courses.map(course => (
                              <Link key={course.id} href={course.link} onClick={() => setIsOpen(false)}>
                                <motion.div 
                                  whileHover={{ y: -8, scale: 1.02 }}
                                  className="min-w-[280px] bg-white/5 border border-white/10 rounded-[32px] overflow-hidden hover:bg-white/10 transition-all duration-300 active:scale-95 group shadow-2xl backdrop-blur-md"
                                >
                                  {course.image && (
                                    <div className="h-36 w-full relative overflow-hidden">
                                      <Image src={course.image} alt={course.title} fill className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                      <div className="absolute top-4 left-4 bg-emerald-500/80 backdrop-blur-lg px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest">{course.level}</div>
                                    </div>
                                  )}
                                  <div className="p-6">
                                    <h4 className="text-white font-bold text-base mb-4 line-clamp-1 group-hover:text-emerald-400 transition-colors">{course.title}</h4>
                                    <div className="flex items-center justify-between">
                                      <div className="flex flex-col">
                                        <span className="text-emerald-400 font-black text-2xl tracking-tighter">₹{course.price.toLocaleString()}</span>
                                        {course.originalPrice && <span className="text-white/20 text-xs line-through decoration-emerald-500/50">₹{course.originalPrice.toLocaleString()}</span>}
                                      </div>
                                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:rotate-[-10deg] transition-all">
                                        <ArrowRight size={20} />
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Metric Visual - Glass depth */}
                        {msg.type === 'metric' && msg.metricLabel && (
                          <div className="w-full p-8 rounded-[40px] bg-white/5 border border-white/10 flex flex-col items-center text-center shadow-inner relative group overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-60">{msg.metricLabel}</p>
                            <p className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">{msg.metricValue}</p>
                          </div>
                        )}

                        {/* Suggestions - Frosty Pills */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            {msg.suggestions.map((s) => {
                              const SuggestionIcon = s.icon || GraduationCap;
                              const isPrimary = s.label.toLowerCase().includes('camp');
                              return (
                                <motion.button 
                                  key={s.id} 
                                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    if (s.link.startsWith('/')) {
                                      window.location.href = s.link;
                                      setIsOpen(false);
                                    } else {
                                      handleSubmit(undefined, s.label);
                                    }
                                  }}
                                  className={cn(
                                    "px-5 py-3 rounded-full text-xs font-bold transition-all flex items-center gap-2.5 shadow-lg border backdrop-blur-xl",
                                    isPrimary 
                                      ? "bg-emerald-500 border-emerald-400 text-white" 
                                      : "bg-white/5 border-white/10 text-gray-300 hover:text-white"
                                  )}
                                >
                                  <SuggestionIcon size={14} className={isPrimary ? "text-white" : "text-emerald-400"} />
                                  {s.label}
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 backdrop-blur-md p-5 rounded-3xl rounded-tl-none border border-white/10 flex items-center gap-4 shadow-xl">
                      <div className="flex gap-1.5">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] text-emerald-400/80 font-black uppercase tracking-[0.2em]">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Input - Floating Glass on Glass */}
              <div className="p-6 pt-2 bg-transparent relative z-10 pb-[calc(32px+env(safe-area-inset-bottom))]">
                <form 
                  onSubmit={handleSubmit}
                  className="relative flex items-center"
                >
                  <div className="relative flex-1">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={placeholders[placeholderIdx]}
                      className={cn(
                        "w-full py-5 pl-7 pr-16 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[28px] text-white text-[15px]",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-white/30"
                      )}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 active:scale-90",
                        input.trim() && !isLoading 
                          ? "bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.6)]" 
                          : "bg-white/5 text-white/10 border border-white/5"
                      )}
                    >
                      <Send size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </form>
                
                <div className="mt-5 flex items-center justify-center gap-6 opacity-30">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                  <p className="text-[9px] text-white font-black uppercase tracking-[0.6em] whitespace-nowrap">
                    FUTURE TECH HUB
                  </p>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
                </div>
              </div>
            </>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
