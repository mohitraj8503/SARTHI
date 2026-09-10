'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, Zap, Clock, ShieldCheck, Code2, 
  User, ArrowRight, Upload, Trophy, CheckCircle2,
  Github, Play, Layout, Check, ChevronRight,
  X, Loader2, Camera, BarChart3, Award, Sparkles, Briefcase,
  Search, Activity, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

const TABS = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'evaluation', label: 'EVALUATION' },
  { id: 'rewards', label: 'REWARDS' },
];

const FORM_STEPS = [
  { id: 'identity', title: 'Basic Info', icon: User },
  { id: 'core', title: 'Project Core', icon: Layout },
  { id: 'tech', title: 'Technical', icon: Code2 },
  { id: 'proof', title: 'Proof', icon: Github },
  { id: 'evidence', title: 'Evidence', icon: Camera },
];

export default function BuilderInductionPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'NONE' | 'PENDING' | 'SELECTED' | 'ELITE' | 'IMPROVE' | 'REJECTED'>('NONE');
  const [isIndustrySelected, setIsIndustrySelected] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    domain: 'AI',
    projectTitle: '',
    elevatorPitch: '',
    problemStatement: '',
    solutionOverview: '',
    targetUsers: '',
    techStack: '',
    architectureSummary: '',
    keyFeatures: '',
    githubRepo: '',
    liveDemo: '',
    videoLink: '',
    metrics: ''
  });

  const [files, setFiles] = useState<{
    video: File | null;
    screenshot1: File | null;
    screenshot2: File | null;
    screenshot3: File | null;
  }>({
    video: null,
    screenshot1: null,
    screenshot2: null,
    screenshot3: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }));
      
      fetch('/api/induction/builder/status')
        .then(res => res.json())
        .then(data => {
          if (data.status) setSubmissionStatus(data.status);
          if (data.isIndustrySelected) setIsIndustrySelected(true);
        })
        .catch(err => console.error("Status fetch failed", err));
    }
  }, [user]);

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

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 0) {
      if (!formData.fullName) newErrors.fullName = "Required";
      if (!formData.email) newErrors.email = "Required";
    } else if (currentStep === 1) {
      if (!formData.projectTitle) newErrors.projectTitle = "Required";
      if (formData.elevatorPitch.split(' ').length > 120) newErrors.elevatorPitch = "Max 120 words";
      if (!formData.elevatorPitch) newErrors.elevatorPitch = "Required";
    } else if (currentStep === 3) {
      if (!formData.githubRepo) newErrors.githubRepo = "Required";
      if (formData.githubRepo && !formData.githubRepo.includes('github.com')) newErrors.githubRepo = "Invalid GitHub URL";
      if (!formData.videoLink && !files.video) newErrors.video = "Video demo (file or link) is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => setCurrentStep(prev => prev - 1);

  const handleFileChange = (key: keyof typeof files, file: File | null) => {
    if (file) {
      if (key === 'video' && file.size > 10 * 1024 * 1024) {
        addToast("Video too large (Max 10MB)", "error");
        return;
      }
      if (key !== 'video' && file.size > 2 * 1024 * 1024) {
        addToast("Image too large (Max 2MB)", "error");
        return;
      }
    }
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (files.video) data.append('videoFile', files.video);
    if (files.screenshot1) data.append('screenshot1', files.screenshot1);
    if (files.screenshot2) data.append('screenshot2', files.screenshot2);
    if (files.screenshot3) data.append('screenshot3', files.screenshot3);

    try {
      const res = await fetch('/api/induction/builder/submit', {
        method: 'POST',
        body: data
      });

      const result = await res.json();
      if (res.ok) {
        addToast("Project submitted for review!", "success");
        setSubmissionStatus('PENDING');
        setIsModalOpen(false);
      } else {
        addToast(result.message || "Submission failed", "error");
      }
    } catch (err) {
      addToast("Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pt-[80px] lg:pt-[100px] pb-20 relative overflow-hidden font-sans selection:bg-[#1B4332]/10 selection:text-[#1B4332]">
      <style>{`
        .induction-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .induction-orb { position: absolute; border-radius: 50%; opacity: 0.12; animation: induction-float 20s infinite ease-in-out; transition: transform 0.1s ease-out; }
        .induction-orb-1 { width: 600px; height: 600px; background: #1B4332; top: -200px; right: -100px; }
        .induction-orb-2 { width: 400px; height: 400px; background: #40916C; bottom: -100px; left: -100px; }
        @keyframes induction-float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 30px) scale(0.9); }
        }
      `}</style>

      <div className="induction-orbs">
          <div className="induction-orb induction-orb-1"></div>
          <div className="induction-orb induction-orb-2"></div>
      </div>

      <div className="fixed top-0 right-0 w-[60%] h-[80%] bg-[#F0EDE8] rounded-bl-[400px] -z-10 opacity-60" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-24 md:pt-32 relative z-10">
        <Link href="/internship" className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 hover:text-[#1B4332] transition-colors mb-8 md:mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform stroke-[2]" />
          BACK TO INTERNSHIP TRACKS
        </Link>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-24">
          <div className="lg:col-span-8 space-y-8 md:space-y-10">
            <div className="flex flex-wrap gap-3">
              <div className="px-5 py-2.5 bg-[#1B4332] text-white rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#1B4332]/20">
                <Zap className="w-3.5 h-3.5 fill-current" />
                FEATURED CHALLENGE
              </div>
              <div className="px-5 py-2.5 bg-white border border-[#E5E2DD] text-[#1B4332] rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Code2 className="w-3.5 h-3.5" />
                BUILDER TRACK
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[76px] font-black text-[#1B4332] leading-[1] lg:leading-[0.9] tracking-tighter uppercase">
              UPLOAD YOUR <br /> PROJECT
            </h1>

            <p className="text-lg lg:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl italic">
              &quot;If you&apos;ve built something real, prove it. We&apos;ll evaluate it.&quot;
            </p>

            <div className="pt-12">
              <div className="flex border-b border-[#E5E2DD] gap-6 sm:gap-10 lg:gap-16 overflow-x-auto scrollbar-none pb-px">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "pb-5 text-[12px] font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap",
                      activeTab === tab.id ? "text-[#1B4332]" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#1B4332] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="py-16 min-h-[400px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                      <div className="grid md:grid-cols-2 gap-8">
                         <div className="p-8 bg-white border border-[#E5E2DD] rounded-[2.5rem] space-y-4">
                            <h4 className="text-lg font-black text-[#1B4332] uppercase tracking-tight">Technical Depth</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">We evaluate your project based on architecture, code quality, and problem-solving complexity.</p>
                         </div>
                         <div className="p-8 bg-white border border-[#E5E2DD] rounded-[2.5rem] space-y-4">
                            <h4 className="text-lg font-black text-[#1B4332] uppercase tracking-tight">Merit Based</h4>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">Only top builders get recognized. This is a performance-based track with strict scoring.</p>
                         </div>
                      </div>
                      <div className="space-y-6">
                        <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight">Evaluation Parameters</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {[
                             { label: "Technical Depth", val: "25%" },
                             { label: "Innovation", val: "20%" },
                             { label: "Execution", val: "20%" },
                             { label: "Problem Clarity", val: "15%" },
                             { label: "Impact", val: "10%" },
                             { label: "Demo Clarity", val: "10%" }
                           ].map(p => (
                             <div key={p.label} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.label}</p>
                                <p className="text-xl font-black text-[#1B4332]">{p.val}</p>
                             </div>
                           ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'evaluation' && (
                    <motion.div key="evaluation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 pb-12">
                       <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3 sm:gap-4 py-8 border-b border-slate-50">
                          {["Submit", "Screen", "Review", "Score", "Result"].map((step, i) => (
                             <div key={i} className="flex items-center gap-2 sm:gap-4">
                                <div className="flex items-center gap-2">
                                   <span className="w-5 h-5 rounded-full bg-[#1B4332] text-white text-[10px] flex items-center justify-center font-bold">{i+1}</span>
                                   <span className="text-[10px] font-black uppercase tracking-widest text-[#111827]">{step}</span>
                                </div>
                                {i < 4 && <ChevronRight size={12} className="text-slate-300 hidden sm:block" />}
                             </div>
                          ))}
                       </div>
                       <div className="grid lg:grid-cols-2 gap-16">
                          <div className="space-y-8">
                             <h3 className="text-xl font-black text-[#111827] uppercase tracking-tighter">The Rubric</h3>
                             <div className="grid grid-cols-2 gap-4">
                                {[
                                  { l: "Technical", v: "45%" },
                                  { l: "Execution", v: "25%" },
                                  { l: "Innovation", v: "20%" },
                                  { l: "Evidence", v: "10%" }
                                ].map((item, i) => (
                                  <div key={i} className="p-4 bg-[#F8F5F0] rounded-2xl border border-[#E5E2DD]/50">
                                     <p className="text-[10px] font-black uppercase tracking-tight text-[#1B4332]">{item.l}</p>
                                     <p className="text-xl font-black text-[#111827]">{item.v}</p>
                                  </div>
                                ))}
                             </div>
                          </div>
                          <div className="space-y-8">
                             <h3 className="text-xl font-black text-[#111827] uppercase tracking-tighter">The Tiers</h3>
                             <div className="space-y-3">
                                {[
                                  { t: "Elite", s: "80+", b: "Gold", c: "text-amber-500" },
                                  { t: "Selected", s: "65+", b: "Silver", c: "text-slate-400" },
                                  { t: "Qualified", s: "50+", b: "Bronze", c: "text-amber-700" }
                                ].map((m, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                                     <div className="flex items-center gap-4">
                                        <span className="text-xl">{m.b}</span>
                                        <span className="text-sm font-black uppercase text-[#111827]">{m.t}</span>
                                     </div>
                                     <span className={`text-lg font-black ${m.c}`}>{m.s}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'rewards' && (
                    <motion.div key="rewards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-12">
                       <div className="grid lg:grid-cols-3 gap-6">
                          {[ 
                            { t: "Qualified", s: "50+", c: "bg-slate-50", tc: "text-slate-600", i: Award, r: ["Digital Certificate", "Network Access"] },
                            { t: "Selected", s: "65+", c: "bg-emerald-50", tc: "text-emerald-700", i: Trophy, r: ["Standard Badge", "Performance Report"] },
                            { t: "Elite", s: "80+", c: "bg-amber-50", tc: "text-amber-600", i: Zap, r: ["Gold Badge", "Industry Track", "Project Spotlight"] }
                          ].map((tier, i) => (
                             <div key={i} className={cn("p-8 rounded-[2.5rem] border border-transparent space-y-6 transition-all hover:border-slate-200", tier.c)}>
                                <div className="flex justify-between items-start">
                                   <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                      {React.createElement(tier.i, { size: 24, className: tier.tc })}
                                   </div>
                                   <span className={cn("text-2xl font-black italic", tier.tc)}>{tier.s}</span>
                                </div>
                                <div className="space-y-4">
                                   <h4 className="text-xl font-black uppercase tracking-tight text-[#111827]">{tier.t}</h4>
                                   <ul className="space-y-3">
                                      {tier.r.map((reward, j) => (
                                         <li key={j} className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{reward}</span>
                                         </li>
                                      ))}
                                   </ul>
                                </div>
                             </div>
                          ))}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:pt-32">
            <div className="sticky top-[120px] space-y-8">
              <div className="bg-[#1B4332] rounded-[3rem] overflow-hidden shadow-2xl shadow-[#1B4332]/30 border border-white/10 group">
                <div className="px-10 pt-10 pb-8 border-b border-white/5 bg-white/5 backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">Program Tracks</p>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl p-1 overflow-hidden shrink-0 border border-white/10">
                      <Image src="/sarthi-logo.png" alt="SARTHI" width={56} height={56} className="object-contain" />
                    </div>
                    <p className="text-white font-black text-2xl tracking-tighter leading-none uppercase">Builder Track</p>
                  </div>
                </div>
                <div className="px-10 py-10 space-y-8 border-b border-white/5">
                  {[
                    { label: "Duration", value: "Performance Based", icon: Clock },
                    { label: "Commitment", value: "40+ Engineering Hours", icon: Activity },
                    { label: "Track Type", value: "Technical / Builder", icon: Layout },
                    { label: "Awarded", value: "Builder Badge", icon: Trophy },
                    { label: "Deadline", value: "June 15, 2026", icon: Clock },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between group gap-6">
                      <div className="flex items-center gap-4 shrink-0 pt-1">
                        <item.icon className="text-white/20 w-5 h-5 stroke-[1.5] group-hover:text-emerald-400 transition-colors" />
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</p>
                      </div>
                      <p className="text-white text-sm font-black tracking-tight text-right leading-tight uppercase">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="px-10 py-10 bg-white/5 backdrop-blur-sm space-y-6">
                  {isIndustrySelected && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-amber-400 rounded-2xl flex items-center gap-4">
                       <Briefcase className="text-amber-950" size={20} />
                       <div className="text-[10px] font-black text-amber-950 uppercase tracking-tight">Project Selected for Industry Opportunity</div>
                    </motion.div>
                  )}
                  {submissionStatus === 'NONE' ? (
                    <button onClick={() => setIsModalOpen(true)} className="w-full py-6 bg-white text-[#1B4332] rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-xl">
                      SUBMIT PROJECT
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <div className="w-full py-6 rounded-2xl bg-white/5 border border-white/10 text-emerald-400 text-center font-black text-sm tracking-widest uppercase">
                       APPLICATION {submissionStatus}
                    </div>
                  )}
                  <p className="text-center text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Enterprise verification active</p>
                </div>
              </div>
              <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Track Rules</h4>
                 <ul className="space-y-4">
                    <li className="text-xs font-bold text-slate-600 flex items-start gap-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                       Original work only. Plagiarism leads to permanent ban.
                    </li>
                 </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#1B4332]/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-4xl rounded-[3rem] shadow-3xl relative overflow-hidden flex flex-col max-h-[90vh]">
               <div className="h-1.5 bg-slate-100 w-full relative">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${((currentStep + 1) / FORM_STEPS.length) * 100}%` }} className="absolute inset-y-0 left-0 bg-[#1B4332]" />
               </div>
               <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center">
                        {React.createElement(FORM_STEPS[currentStep].icon, { size: 24 })}
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tighter">{FORM_STEPS[currentStep].title}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {currentStep + 1} of {FORM_STEPS.length}</p>
                     </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-[#1B4332] transition-all">
                     <X size={20} />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto px-10 py-10">
                  <AnimatePresence mode="wait">
                    <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8">
                       {currentStep === 0 && (
                          <div className="grid md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                <input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="e.g. Mohit Raj" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm" />
                                {errors.fullName && <p className="text-red-500 text-[10px] font-black uppercase pl-1">{errors.fullName}</p>}
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="mohit@sarthi.co" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm" />
                                {errors.email && <p className="text-red-500 text-[10px] font-black uppercase pl-1">{errors.email}</p>}
                             </div>
                             <div className="space-y-4 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Domain</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                   {['AI', 'Web', 'App', 'Research', 'Creator'].map(d => (
                                     <button key={d} onClick={() => setFormData({...formData, domain: d})} className={cn("py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", formData.domain === d ? "bg-[#1B4332] text-white border-[#1B4332]" : "bg-white text-slate-400 border-slate-100 hover:border-[#1B4332]")}>{d}</button>
                                   ))}
                                </div>
                             </div>
                          </div>
                       )}
                       {currentStep === 1 && (
                          <div className="space-y-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Project Title</label>
                                <input value={formData.projectTitle} onChange={e => setFormData({...formData, projectTitle: e.target.value})} placeholder="e.g. AI-Powered Vision Monitoring" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Elevator Pitch (Max 120 words)</label>
                                <textarea value={formData.elevatorPitch} onChange={e => setFormData({...formData, elevatorPitch: e.target.value})} rows={4} placeholder="Summarize your project's value proposition..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm resize-none" />
                                {errors.elevatorPitch && <p className="text-red-500 text-[10px] font-black uppercase pl-1">{errors.elevatorPitch}</p>}
                             </div>
                             <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Problem Statement</label>
                                   <textarea value={formData.problemStatement} onChange={e => setFormData({...formData, problemStatement: e.target.value})} rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm resize-none" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Solution Overview</label>
                                   <textarea value={formData.solutionOverview} onChange={e => setFormData({...formData, solutionOverview: e.target.value})} rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm resize-none" />
                                </div>
                             </div>
                          </div>
                       )}
                       {currentStep === 2 && (
                          <div className="space-y-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tech Stack</label>
                                <input value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} placeholder="e.g. Next.js, FastAPI, PostgreSQL, AWS" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Architecture Summary (Short)</label>
                                <textarea value={formData.architectureSummary} onChange={e => setFormData({...formData, architectureSummary: e.target.value})} rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm resize-none" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Key Features (Bullet points)</label>
                                <textarea value={formData.keyFeatures} onChange={e => setFormData({...formData, keyFeatures: e.target.value})} rows={4} placeholder="- Real-time analysis&#10;- Scalable backend..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm resize-none" />
                             </div>
                          </div>
                       )}
                       {currentStep === 3 && (
                          <div className="space-y-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">GitHub Repository URL (Required)</label>
                                <div className="relative">
                                   <Github className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                   <input value={formData.githubRepo} onChange={e => setFormData({...formData, githubRepo: e.target.value})} placeholder="https://github.com/user/repo" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm" />
                                </div>
                                {errors.githubRepo && <p className="text-red-500 text-[10px] font-black uppercase pl-1">{errors.githubRepo}</p>}
                             </div>
                             <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Video Demo (Required)</label>
                                   <div className="space-y-4">
                                      <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-[#1B4332] transition-all relative">
                                         <input type="file" accept="video/*" onChange={e => handleFileChange('video', e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                         <Upload className="text-slate-300 group-hover:text-[#1B4332] transition-colors mb-4" size={32} />
                                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{files.video ? files.video.name : "Upload MP4/MOV (Max 10MB)"}</p>
                                      </div>
                                      <div className="relative">
                                         <Play className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                         <input value={formData.videoLink} onChange={e => setFormData({...formData, videoLink: e.target.value})} placeholder="Or paste video link (Loom/Drive)" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm" />
                                      </div>
                                      {errors.video && <p className="text-red-500 text-[10px] font-black uppercase pl-1">{errors.video}</p>}
                                   </div>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Live Demo URL (Optional)</label>
                                   <div className="relative">
                                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input value={formData.liveDemo} onChange={e => setFormData({...formData, liveDemo: e.target.value})} placeholder="https://project-demo.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm" />
                                   </div>
                                </div>
                             </div>
                          </div>
                       )}
                       {currentStep === 4 && (
                          <div className="space-y-10">
                             <div className="space-y-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Project Screenshots (1-3)</label>
                                <div className="grid grid-cols-3 gap-6">
                                   {[1, 2, 3].map(i => (
                                     <div key={i} className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center relative group hover:border-[#1B4332] transition-all">
                                        <input type="file" accept="image/*" onChange={e => handleFileChange(`screenshot${i}` as any, e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        {(files as any)[`screenshot${i}`] ? (
                                            <div className="absolute inset-0 p-2">
                                               { }
                                               <img src={URL.createObjectURL((files as any)[`screenshot${i}`])} alt={`Uploaded screenshot ${i}`} className="w-full h-full object-cover rounded-xl" />
                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                                                 <Camera size={24} className="text-white" />
                                              </div>
                                           </div>
                                        ) : (
                                           <>
                                              <Camera className="text-slate-300 group-hover:text-[#1B4332] transition-colors mb-2" size={24} />
                                              <p className="text-[8px] font-black uppercase text-slate-400">Upload {i}</p>
                                           </>
                                        )}
                                     </div>
                                   ))}
                                </div>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Key Metrics (Optional)</label>
                                <div className="relative">
                                   <BarChart3 className="absolute left-6 top-6 text-slate-400" size={18} />
                                   <textarea value={formData.metrics} onChange={e => setFormData({...formData, metrics: e.target.value})} rows={3} placeholder="e.g. 98% accuracy, 200ms latency, 1k+ monthly users..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-4 focus:ring-[#1B4332]/5 focus:border-[#1B4332] transition-all font-bold text-sm resize-none" />
                                </div>
                             </div>
                             <div className="p-8 bg-[#1B4332]/5 border border-[#1B4332]/10 rounded-[2.5rem] flex gap-6 items-center">
                                <div className="w-12 h-12 bg-[#1B4332] text-white rounded-2xl flex items-center justify-center shrink-0"><Check size={24} /></div>
                                <div>
                                   <p className="text-sm font-bold text-[#1B4332] leading-tight">Ready to Submit?</p>
                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Make sure all details are accurate. Plagiarism is strictly prohibited.</p>
                                </div>
                             </div>
                          </div>
                       )}
                    </motion.div>
                  </AnimatePresence>
               </div>
               <div className="px-10 py-8 border-t border-gray-50 flex items-center justify-between shrink-0 bg-slate-50/50">
                  <button disabled={currentStep === 0 || isSubmitting} onClick={handleBack} className="px-8 py-4 rounded-xl border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-[#1B4332] transition-all disabled:opacity-30 active:scale-95">Back</button>
                  {currentStep < FORM_STEPS.length - 1 ? (
                    <button onClick={handleNext} className="px-10 py-4 bg-[#1B4332] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#1B4332]/10 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3">Continue <ChevronRight size={14} /></button>
                  ) : (
                    <button disabled={isSubmitting} onClick={handleSubmit} className="px-10 py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3">
                       {isSubmitting ? ( <><Loader2 size={14} className="animate-spin" /> Submitting...</> ) : ( <><CheckCircle2 size={14} /> Final Submission</> )}
                    </button>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        {/* Industry Opportunity Section - Standardized */}
        <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mt-32 relative group mb-24"
        >
           <div className="p-8 md:p-12 lg:p-20 bg-[#1B4332] rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[4rem] text-white overflow-hidden relative shadow-2xl border border-white/5">
              <div className="grid lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center relative z-10">
                 <div className="space-y-10">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 text-white">
                       <Zap size={14} className="text-amber-400 fill-amber-400" />
                       ELITE OPPORTUNITY
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black leading-[1] md:leading-[0.9] tracking-tighter uppercase text-white">
                       INDUSTRY <br />
                       OPPORTUNITY
                    </h2>
                    
                    <p className="text-base md:text-lg text-white/80 font-medium leading-relaxed max-w-xl">
                       Best performers get a chance to work on real client-facing tasks. Selection is based on delivery quality, review score, and consistency.
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-10 pt-4">
                       <div className="space-y-3">
                          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">- ELIGIBILITY CRITERIA</h4>
                          <p className="text-[10px] text-white font-bold uppercase leading-relaxed tracking-wider">
                             COMPLETE THE INDUCTION PROJECT, SUBMIT DEMO PROOF, AND MAINTAIN A STRONG EVALUATION SCORE.
                          </p>
                       </div>
                       <div className="space-y-3">
                          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">- SELECTION SIGNAL</h4>
                          <p className="text-[10px] text-white font-bold uppercase leading-relaxed tracking-wider">
                             ARCHITECTURE CLARITY, PRODUCTION READINESS, DEBUGGING DEPTH, AND COMMUNICATION QUALITY.
                          </p>
                       </div>
                       <div className="space-y-3">
                          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">- WHAT YOU GET</h4>
                          <p className="text-[10px] text-white font-bold uppercase leading-relaxed tracking-wider">
                             PROJECT ASSIGNMENT PRIORITY, MENTOR FEEDBACK LOOP, AND POSSIBLE PAID EXECUTION OPPORTUNITIES.
                          </p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-8 md:space-y-10">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] space-y-8 md:space-y-10">
                       <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-white">HOW IT WORKS</h3>
                       
                       <div className="space-y-8">
                          <div className="space-y-1">
                             <p className="text-sm font-medium leading-relaxed">
                                <span className="text-amber-400 font-black">Step 1:</span> Build and submit your induction project with clear README, demo video, and source code.
                             </p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm font-medium leading-relaxed">
                                <span className="text-amber-400 font-black">Step 2:</span> Internal review scores technical quality, implementation depth, and reliability.
                             </p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm font-medium leading-relaxed">
                                <span className="text-amber-400 font-black">Step 3:</span> Shortlisted candidates receive assignment invites for live tasks and mentor syncs.
                             </p>
                          </div>
                       </div>
                       
                       <div className="p-8 bg-black/20 rounded-[2rem] border border-white/5">
                          <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2">STATUS: MERIT BASED</p>
                          <p className="text-xs text-white/80 font-medium leading-relaxed">
                             Selection is limited and non-guaranteed. Priority goes to high-scoring submissions with consistent delivery and clear problem-solving.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
    </div>
  );
}
