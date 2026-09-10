'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    ClipboardEdit, 
    SearchCode, 
    CheckCircle, 
    Rocket, 
    ArrowRight,
    Star,
    ShieldCheck,
    Cpu,
    Briefcase,
    GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HowItWorksModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: () => void;
}

const STEPS = [
    { 
        title: 'Apply', 
        desc: 'Submit your partnership request with basic details about your institution or community.',
        icon: ClipboardEdit,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
    { 
        title: 'Review', 
        desc: 'Our team reviews your application and evaluates infrastructure, student reach, and program fit.',
        icon: SearchCode,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
    },
    { 
        title: 'Approval', 
        desc: 'Once approved, you receive onboarding details and professional guidance to get started.',
        icon: CheckCircle,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    { 
        title: 'Launch', 
        desc: 'We help you launch programs, conduct sessions, and enable students with real digital skills.',
        icon: Rocket,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    }
];

const BENEFITS = [
    { title: 'Structured Tech Programs', icon: Cpu },
    { title: 'Global Certifications', icon: GraduationCap },
    { title: 'Hands-on Project Learning', icon: Star },
    { title: 'Mentorship & Guidance', icon: ShieldCheck },
    { title: 'Career-Focused Training', icon: Briefcase },
];

export default function HowItWorksModal({ isOpen, onClose, onApply }: HowItWorksModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-black/5"
                >
                    {/* Header Banner (Matching Form Modal) */}
                    <div className="h-32 bg-[#1A3C2E] relative flex items-end p-8">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white tracking-tight font-outfit">
                                How Partnership Works
                            </h2>
                            <p className="text-blue-400/80 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                                Roadmap to Rural Transformation
                            </p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-10">
                        {/* Steps Roadmap */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-10 left-0 w-full h-px bg-black/[0.05] -z-10" />
                            
                            {STEPS.map((step, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex flex-col items-start group"
                                >
                                    <div className={cn(
                                        "w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border border-black/5 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl",
                                        step.bg,
                                        step.color
                                    )}>
                                        <step.icon className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-black text-black/20 uppercase tracking-[0.2em]">
                                            Phase 0{i + 1}
                                        </h3>
                                        <h4 className="text-xl font-bold text-[#1A3C2E]">
                                            {step.title}
                                        </h4>
                                        <p className="text-[#1A3C2E]/60 text-sm font-medium leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-black/5 my-12" />

                        {/* Benefits & CTA Section */}
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="flex-1 w-full">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A3C2E]/30 mb-8 px-1">
                                    Why Partner with us?
                                </h5>
                                <div className="flex flex-wrap gap-3">
                                    {BENEFITS.map((b, i) => (
                                        <div 
                                            key={i}
                                            className="flex items-center gap-3 bg-[#f8f8f6] border border-black/5 px-6 py-4 rounded-2xl transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1"
                                        >
                                            <b.icon className="w-4 h-4 text-[#10B981]" />
                                            <span className="text-xs font-bold text-[#1A3C2E]">{b.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:w-1/3 flex flex-col items-center text-center lg:items-end lg:text-right">
                                <p className="text-sm font-medium text-[#1A3C2E]/40 mb-6 italic max-w-[240px]">
                                    Ready to empower the next generation of builders?
                                </p>
                                <button 
                                    onClick={onApply}
                                    className="bg-[#10B981] text-white px-10 py-5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#10B981]/20 flex items-center gap-3 group"
                                >
                                    Apply for Partnership
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
