"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Zap, 
  Clock, 
  Activity, 
  Layout, 
  Target, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  Globe, 
  MessageSquare, 
  Search, 
  FileText, 
  User, 
  Trophy,
  ArrowRight,
  Plus,
  ChevronRight,
  Circle,
  Video,
  BookOpen,
  Code,
  Users,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Instagram,
  Link2,
  BatteryMedium,
  BatteryFull
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";

// ─── DATA ───────────────────────────────────────────────────────────────────

const PROGRAM_META = {
  owner: "SARTHI",
  duration: "Performance Based",
  commitment: "10–30 Hours/Week",
  track: "Creator / Research / Tech",
  cohortLabel: "Creator Badge",
  deadline: "Merit Based",
  spots: "Selective",
  spotsLeft: "Limited",
};

const TABS = ["Overview", "How it Works", "Deliverables", "Rules & Community", "Opportunity"] as const;
type Tab = (typeof TABS)[number];

const WHAT_YOU_GET = [
  {
    label: "Internship Badge",
    desc: "Official recognition for your technical portfolio.",
    icon: Award,
  },
  {
    label: "Personalized Certificate",
    desc: "Performance-based credentials for top creators.",
    icon: ShieldCheck,
  },
  {
    label: "Private Community",
    desc: "Direct access to high-signal creator networks.",
    icon: Users,
  },
  {
    label: "Real Visibility",
    desc: "Your work showcased across SARTHI platform.",
    icon: Globe,
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Register", desc: "Sign up and indicate your primary skill domain (Creator/Research/Tech)." },
  { step: "02", title: "Show Your Work", desc: "Submit a 1-3 min video about SARTHI or a high-signal research piece." },
  { step: "03", title: "Merit Evaluation", desc: "Our team reviews submissions for creativity, clarity, and effort." },
  { step: "04", title: "Join Community", desc: "Selected creators enter our private high-signal WhatsApp network." },
  { step: "05", title: "Earn Badge", desc: "Contribute regularly, pass evaluation, and earn your Internship Badge." },
];

const DELIVERABLES = [
  "1–3 min SARTHI Video",
  "Technical Research Piece",
  "Consistent Content Artifacts",
  "Active Community Log",
];

// ─── RESOURCE MODAL ──────────────────────────────────────────────────────────

const RESOURCE_CONTENT = {
  curriculum: {
    title: "Program Curriculum Details",
    subtitle: "📘 Roadmap to Execution",
    content: (
      <div className="space-y-6">
        <p className="text-gray-600 font-medium leading-relaxed">
          Get a clear breakdown of what you&apos;ll build and learn during the induction. 
          From real-world project expectations to structured milestones, this curriculum is designed to help you move from learning to execution.
        </p>
        <div className="bg-emerald-50 rounded-2xl p-6 space-y-4">
          <h4 className="font-bold text-emerald-950 uppercase tracking-widest text-[11px]">Core Milestones</h4>
          <ul className="space-y-3">
            {[
              "Technical Project Breakdown & Architecture",
              "Production-Ready Asset Creation",
              "Community Mentorship & Peer Review",
              "Final Portfolio Showcase"
            ].map((m, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {m}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-gray-500 italic">
          You&apos;ll understand how your submissions are evaluated and what it takes to stand out.
        </p>
      </div>
    )
  },
  certification: {
    title: "Certification Validity",
    subtitle: "🏅 Verified Recognition",
    content: (
      <div className="space-y-6">
        <p className="text-gray-600 font-medium leading-relaxed">
          Upon successful completion, you&apos;ll receive a verified SARTHI badge recognizing your contribution and skills.
        </p>
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex gap-4 items-center mb-4">
            <Trophy className="w-8 h-8 text-amber-600" />
            <h4 className="font-bold text-amber-950 uppercase tracking-widest text-[11px]">Real-World Value</h4>
          </div>
          <p className="text-sm font-semibold text-amber-900/70 leading-relaxed">
            This certification reflects real work, not just participation — making it valuable for portfolios, resumes, and future opportunities.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
             <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Badge Type</p>
             <p className="text-xs font-bold text-emerald-950">Creator Induction</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
             <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Verification</p>
             <p className="text-xs font-bold text-emerald-950">Blockchain Anchored</p>
          </div>
        </div>
      </div>
    )
  },
  technical: {
    title: "Technical Requirements",
    subtitle: "⚙️ Quality Standards",
    content: (
      <div className="space-y-6">
        <p className="text-gray-600 font-medium leading-relaxed">
          Ensure your submission meets the required format and quality standards. 
          Upload a clear video (MP4/MOV, max 10MB) showcasing your work, along with proper explanation and structure.
        </p>
        <div className="space-y-4">
          {[
            { label: "File Format", value: "MP4 / MOV", icon: Video },
            { label: "Max Size", value: "10 MB", icon: Upload },
            { label: "Video Quality", value: "720p or higher", icon: Activity },
            { label: "Setup", value: "Stable Internet", icon: Globe }
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <r.icon className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">{r.label}</span>
              </div>
              <span className="text-sm font-extrabold text-emerald-950">{r.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center font-medium">
          A stable internet connection and basic recording setup are recommended for the best results.
        </p>
      </div>
    )
  }
};

const ResourceModal = ({ id, onClose }: { id: keyof typeof RESOURCE_CONTENT | null, onClose: () => void }) => {
  if (!id) return null;
  const data = RESOURCE_CONTENT[id];

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center backdrop-blur-md bg-emerald-950/20 p-4 pt-12 sm:pt-20 md:pt-32 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-emerald-50 overflow-hidden relative"
      >
        <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 border-b border-gray-50 flex items-center justify-between bg-white shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                  Reference
               </span>
               <span className="w-1 h-1 rounded-full bg-gray-200" />
               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Resource Portal</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight leading-none uppercase">{data.title}</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] mt-2">{data.subtitle}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-emerald-950 hover:bg-gray-100 transition-all active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="min-h-[150px] sm:min-h-[200px]">
            {data.content}
          </div>
          <button 
            onClick={onClose}
            className="w-full mt-6 sm:mt-10 py-4 sm:py-5 rounded-2xl bg-emerald-950 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-950/20 hover:bg-emerald-900 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── MODAL COMPONENT ──────────────────────────────────────────────────────────

const STEPS = [
  { id: 'identity', title: 'Identity', subtitle: 'Basic information' },
  { id: 'project', title: 'Project', subtitle: 'Your vision & description' },
  { id: 'upload', title: 'Submit', subtitle: 'Final asset upload' },
];

const SubmissionModal = ({ isOpen, onClose, onSubmitSuccess }: { isOpen: boolean, onClose: () => void, onSubmitSuccess: () => void }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    domain: 'Creator', 
    description: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user, isOpen]);

  const validateStep = () => {
    setError(null);
    if (currentStep === 0) {
      if (!formData.fullName) { setError("Full name is required."); return false; }
      if (!formData.email) { setError("Valid email address is required."); return false; }
    } else if (currentStep === 1) {
      if (!formData.description) { setError("Please provide a description of your project."); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File too large. Max 10MB allowed.");
        return;
      }
      if (!['video/mp4', 'video/quicktime'].includes(selectedFile.type)) {
        setError("Invalid format. Only MP4 and MOV are allowed.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("A video sample is required for evaluation."); return; }
    
    setIsSubmitting(true);
    setError(null);
    setProgress(10);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append('video', file);

    try {
      const interval = setInterval(() => setProgress(prev => (prev < 90 ? prev + 10 : prev)), 500);
      const res = await fetch('/api/induction/creator/submit', { method: 'POST', body: data });
      const result = await res.json();
      clearInterval(interval);
      if (!res.ok) throw new Error(result.error || 'Submission failed');
      setProgress(100);
      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center backdrop-blur-md bg-emerald-950/40 p-4 pt-12 md:pt-24 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-emerald-50 flex flex-col max-h-[85vh] overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-50 z-[110]">
          <motion.div 
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 border-b border-gray-50 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Step {currentStep + 1} of {STEPS.length}
               </span>
               <span className="w-1 h-1 rounded-full bg-gray-200" />
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Induction Portal</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight leading-none uppercase">
              {STEPS[currentStep].title}
            </h3>
            <p className="text-gray-400 font-medium text-xs mt-1">
              {STEPS[currentStep].subtitle}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-emerald-950 hover:bg-gray-100 transition-all active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-10">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-10">
              {currentStep === 0 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">Full Name</label>
                      <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold text-sm shadow-sm" placeholder="e.g. Mohit Raj" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">Email Address</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold text-sm shadow-sm" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">Primary Skill Domain</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['Creator', 'Research', 'Marketing', 'Tech'].map(d => (
                        <button key={d} type="button" onClick={() => setFormData({...formData, domain: d})} className={cn("py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all active:scale-[0.97]", formData.domain === d ? "bg-emerald-950 text-white border-emerald-950 shadow-xl shadow-emerald-950/20" : "bg-white text-gray-400 border-gray-100 hover:border-emerald-200 hover:text-emerald-900")}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">Project Description</label>
                    <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={5} className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold text-sm shadow-sm resize-none" placeholder="Briefly describe your video, reels, digital marketing, blogging, or research topic. What value are you providing to the SARTHI community?" />
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1">Final Asset Upload</label>
                  <div className={cn("relative group cursor-pointer border-2 border-dashed rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-12 transition-all flex flex-col items-center justify-center text-center active:scale-[0.99]", file ? "bg-emerald-50 border-emerald-200 shadow-inner" : "bg-gray-50 border-gray-200 hover:border-emerald-300")}>
                    <input type="file" accept=".mp4,.mov" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                      {file ? <CheckCircle2 className="w-8 h-8 text-emerald-600" /> : <Upload className="w-8 h-8 text-gray-300" />}
                    </div>
                    <p className="text-base sm:text-lg font-extrabold text-emerald-950 uppercase tracking-tighter">
                      {file ? file.name : "Choose Video/Media Sample"}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">MP4 or MOV • Max 10MB (Video intro or pitch is acceptable)</p>
                  </div>
                  <p className="text-xs text-center text-gray-400 font-medium">By submitting, you confirm this is your original work.</p>
                </div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-red-600 bg-red-50 px-6 py-5 rounded-2xl text-[11px] font-bold border border-red-100 shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-6 sm:px-8 py-6 sm:py-8 border-t border-gray-50 bg-gray-50/30 flex gap-4 shrink-0">
          {currentStep > 0 && (
            <button onClick={handleBack} disabled={isSubmitting} className="px-6 sm:px-8 py-4 sm:py-5 rounded-2xl border border-gray-200 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-gray-600 transition-all active:scale-95">Back</button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <button onClick={handleNext} className="flex-1 bg-emerald-950 text-white py-4 sm:py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-950/20 hover:bg-emerald-900 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3">
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-emerald-600 text-white py-4 sm:py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-600/30 hover:bg-emerald-500 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Syncing {progress}%</>
              ) : ("Finalize Submission")}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function SparkProgramPage() {
  const { user, signIn } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [stickyCard, setStickyCard] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"NONE" | "PENDING" | "SELECTED" | "REJECTED">("NONE");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<'curriculum' | 'certification' | 'technical' | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleOpenSubmission = () => {
    if (!user) {
      addToast({
        type: 'info',
        title: 'Authentication Required',
        message: 'Please login to continue with your submission.'
      });
      signIn();
      return;
    }

    if (!user.onboarded) {
      addToast({
        type: 'warning',
        title: 'Profile Incomplete',
        message: 'Please complete your onboarding to proceed.'
      });
      router.push('/onboarding?redirect=/internship/spark-program');
      return;
    }

    // Context-aware pre-scroll
    window.scrollTo({ 
      top: Math.max(0, window.scrollY - 150), 
      behavior: 'smooth' 
    });

    setTimeout(() => {
      setIsModalOpen(true);
    }, 250);
  };

  const handleOpenResource = (id: 'curriculum' | 'certification' | 'technical') => {
    // Context-aware pre-scroll
    window.scrollTo({ 
      top: Math.max(0, window.scrollY - 100), 
      behavior: 'smooth' 
    });

    setTimeout(() => {
      setSelectedResource(id);
    }, 250);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/induction/creator/status');
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.status !== "NONE") {
            setSubmissionStatus(data.status);
            localStorage.setItem('tt_induction_status', data.status);
          } else {
            const status = localStorage.getItem('tt_induction_status');
            if (status) setSubmissionStatus(status as any);
          }
        }
      } catch (err) {
        const status = localStorage.getItem('tt_induction_status');
        if (status) setSubmissionStatus(status as any);
      }
    };

    if (user) {
      fetchStatus();
    } else {
      const status = localStorage.getItem('tt_induction_status');
      if (status) setSubmissionStatus(status as any);
    }
  }, [user]);

  const handleSubmissionSuccess = () => {
    setSubmissionStatus("PENDING");
    localStorage.setItem('tt_induction_status', 'PENDING');
  };

  // Scroll Lock & Layout Stability
  useEffect(() => {
    if (isModalOpen || selectedResource) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0px';
    };
  }, [isModalOpen, selectedResource]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const orbs = document.querySelectorAll('.induction-orb');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 15;
        const xOffset = (0.5 - x) * speed;
        const yOffset = (0.5 - y) * speed;
        (orb as HTMLElement).style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        setStickyCard(window.scrollY > 400);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans relative overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
        }
        .induction-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; }
        .induction-orb { position: absolute; border-radius: 50%; opacity: 0.12; animation: induction-float 20s infinite ease-in-out; transition: transform 0.1s ease-out; }
        .induction-orb-1 { width: 600px; height: 600px; background: #1B4332; top: -200px; right: -100px; }
        .induction-orb-2 { width: 400px; height: 400px; background: #40916C; bottom: -100px; left: -100px; }
        @keyframes induction-float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(50px, -80px) scale(1.1); }
            66% { transform: translate(-40px, 50px) scale(0.9); }
        }
      `}</style>

      <SubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmitSuccess={handleSubmissionSuccess} 
      />

      <div className="induction-orbs">
          <div className="induction-orb induction-orb-1"></div>
            <div className="induction-orb induction-orb-2"></div>
        </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 pt-20 sm:pt-24 md:pt-32">
        <Link 
          href="/internship" 
          className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 hover:text-emerald-900 transition-all mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform stroke-[2]" />
          Back to Internship
        </Link>
      </div>

      <div ref={heroRef} className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-24 items-start w-full">

          <div className="lg:col-span-8 w-full max-w-full">
            <div className="flex flex-wrap gap-3 mb-10">
              <span className="flex items-center gap-2 bg-emerald-950 text-emerald-400 text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 rounded-full border border-emerald-800/50">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Selective Track
              </span>
              <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-bold tracking-[0.1em] uppercase px-4 py-2 rounded-full shadow-sm">
                Cohort 03 Active
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl xl:text-8xl font-extrabold tracking-[-0.04em] text-emerald-950 leading-[1.05] mb-8 uppercase">
              SARTHI <br />
              <span className="text-emerald-600">Creator</span> <br />
              Induction
            </h1>

            <p className="text-xl md:text-2xl font-semibold text-emerald-800/80 mb-10 tracking-tight leading-relaxed max-w-xl">
              Turn your ideas into recognition. Create. Contribute. Get Recognized.
            </p>

            <div className="max-w-2xl space-y-8">
                <p className="text-base md:text-lg text-gray-600 leading-[1.8] font-medium">
                  We’re inviting creators, researchers, and builders to showcase their skills. This program is open to both Tech and Non-Tech students (BBA, BA, B.Com, MBA, etc.) with exciting opportunities in Digital Marketing, Video making, Social Media Reels making, and Blogging. All training is conducted under the guidance of Experienced Industry Professionals and Faculty.
                </p>
                
                <div className="flex flex-wrap gap-6 items-center">
                    {submissionStatus === "NONE" ? (
                      <button 
                        onClick={handleOpenSubmission}
                        className="w-full sm:w-auto bg-emerald-950 text-white px-6 md:px-10 py-4 md:py-6 rounded-2xl font-extrabold text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-950/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-4 group"
                      >
                        Submit Now
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <div className={cn(
                        "w-full sm:w-auto inline-flex items-center justify-center gap-4 px-6 md:px-8 py-4 md:py-5 rounded-2xl font-bold text-sm uppercase tracking-widest border",
                        submissionStatus === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-100" :
                        submissionStatus === "SELECTED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        "bg-red-50 text-red-700 border-red-100"
                      )}>
                        {submissionStatus === "PENDING" && <Clock className="w-5 h-5" />}
                        {submissionStatus === "SELECTED" && <CheckCircle2 className="w-5 h-5" />}
                        {submissionStatus === "REJECTED" && <X className="w-5 h-5" />}
                        {submissionStatus === "PENDING" ? "Status: Under Review" : 
                         submissionStatus === "SELECTED" ? "Status: Selected" : "Status: Rejected"}
                      </div>
                    )}
                </div>
            </div>

            <div className="mt-20 border-b border-gray-200/60 overflow-x-auto scrollbar-none w-full">
              <nav className="flex gap-6 md:gap-10 pb-0.5 min-w-max">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-6 text-[13px] font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                      activeTab === tab
                        ? "text-emerald-950"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-emerald-950 rounded-full" 
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-16 min-h-[600px] w-full max-w-full">
              <AnimatePresence mode="wait">
                {activeTab === "Overview" && (
                  <motion.div
                    key="Overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-24 w-full"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
                      {WHAT_YOU_GET.map((item, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-sm hover:shadow-xl transition-all group w-full">
                          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform">
                            <item.icon className="w-7 h-7 stroke-[1.5]" />
                          </div>
                          <h4 className="text-xl font-extrabold uppercase tracking-tight text-emerald-950 mb-3">{item.label}</h4>
                          <p className="text-gray-500 font-medium leading-relaxed text-sm sm:text-base">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 relative overflow-hidden group w-full">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                        <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-8 items-start w-full">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-extrabold text-red-950 uppercase tracking-tighter">This is not for everyone.</h3>
                                <p className="text-base sm:text-lg text-red-900/60 font-medium leading-relaxed max-w-xl">
                                    Only consistent and serious creators will be selected. We value quality over volume and dedication over curiosity.
                                </p>
                            </div>
                        </div>
                    </div>

                    <section className="bg-emerald-950 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] p-6 sm:p-8 md:p-12 lg:p-12 flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 lg:items-center relative overflow-hidden group shadow-2xl shadow-emerald-950/40 w-full">
                      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 blur-[120px] rounded-full -mr-60 -mt-60 group-hover:scale-125 transition-transform duration-1000" />
                      <div className="flex-1 relative z-10 space-y-4 sm:space-y-6">
                        <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.4em]">Cohort Excellence</p>
                        <h3 className="text-white text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight uppercase">
                          Built for <br /> those who <br /> <span className="text-emerald-500">ship.</span>
                        </h3>
                      </div>
                      <div className="flex flex-row flex-wrap gap-8 md:gap-12 lg:gap-24 shrink-0 relative z-10 lg:border-l lg:border-white/10 lg:pl-24">
                        <div className="space-y-2">
                          <p className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-tighter">12%</p>
                          <p className="text-emerald-400/40 text-[10px] font-bold uppercase tracking-[0.4em]">Selection Rate</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-tighter">127</p>
                          <p className="text-emerald-400/40 text-[10px] font-bold uppercase tracking-[0.4em]">Graduates</p>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === "How it Works" && (
                  <motion.div
                    key="HowItWorks"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-16 w-full"
                  >
                    <div className="relative w-full">
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-100 hidden md:block" />
                        <div className="space-y-10 sm:space-y-12 w-full">
                            {HOW_IT_WORKS.map((step, i) => {
                                const isTicked = (submissionStatus === "PENDING" && i === 0) || (submissionStatus === "SELECTED" && i < 4);
                                return (
                                <div key={i} className="relative flex flex-col md:flex-row gap-6 md:gap-10 group w-full">
                                    <div className={cn("w-16 h-16 rounded-2xl border shadow-sm flex items-center justify-center font-extrabold text-xl z-10 shrink-0 transition-all", isTicked ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-gray-100 text-emerald-950 group-hover:bg-emerald-950 group-hover:text-white")}>
                                        {isTicked ? <CheckCircle2 className="w-8 h-8" /> : step.step}
                                    </div>
                                    <div className="pt-1 sm:pt-3 space-y-2 sm:space-y-3">
                                        <h4 className="text-xl sm:text-2xl font-extrabold text-emerald-950 uppercase tracking-tighter">{step.title}</h4>
                                        <p className="text-base sm:text-lg text-gray-500 font-medium max-w-xl leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "Deliverables" && (
                  <motion.div
                    key="Deliverables"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12 w-full"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                      {DELIVERABLES.map((d, i) => (
                        <div key={i} className="flex items-center gap-4 sm:gap-6 bg-white border border-gray-100 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm hover:border-emerald-200 transition-all group w-full">
                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Plus className="text-emerald-600 w-5 h-5" />
                          </div>
                          <span className="text-base sm:text-lg font-bold text-emerald-950 tracking-tight">{d}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "Rules & Community" && (
                  <motion.div
                    key="Roles"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-16 sm:space-y-20 w-full"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
                      {[
                        { role: "Content Creator", icon: Video, desc: "The voice of the program. Ships high-signal videos or technical threads.", accent: "bg-blue-50 text-blue-600" },
                        { role: "Research Specialist", icon: BookOpen, desc: "The brain of the track. Deep-dives into technical documentation.", accent: "bg-purple-50 text-purple-600" },
                        { role: "Community Mentor", icon: Users, desc: "The heart of the cohort. Engages peers and provides feedback.", accent: "bg-amber-50 text-amber-600" },
                        { role: "Technical Builder", icon: Code, desc: "The engine of execution. Ships working projects and POCs.", accent: "bg-emerald-50 text-emerald-600" },
                      ].map((r, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-sm hover:shadow-xl transition-all group w-full">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8", r.accent)}>
                              <r.icon className="w-7 h-7" />
                          </div>
                          <h4 className="text-xl font-extrabold uppercase tracking-tight text-emerald-950 mb-4">{r.role}</h4>
                          <p className="text-base sm:text-lg text-gray-500 leading-relaxed font-medium">{r.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-emerald-950 rounded-[2.5rem] sm:rounded-[4rem] p-6 sm:p-12 lg:p-16 text-white relative overflow-hidden group shadow-2xl w-full">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 blur-[100px] rounded-full -mr-40 -mt-40" />
                        <div className="relative z-10 flex flex-col lg:flex-row gap-6 sm:gap-12 items-center w-full">
                            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl p-2 overflow-hidden shrink-0">
                                <Image src="/sarthi-logo.png" alt="SARTHI" width={80} height={80} className="object-contain" />
                            </div>
                            <div className="space-y-6 flex-1 text-center lg:text-left">
                                <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">Private Creator Network</h3>
                                <p className="text-lg sm:text-xl text-emerald-100/60 font-medium leading-relaxed max-w-2xl">
                                    Join our high-signal Discord network, weekly strategy calls, and direct mentorship from industry leaders.
                                </p>
                                
                                {submissionStatus === "SELECTED" ? (
                                    <Link 
                                        href="https://chat.whatsapp.com/GToupUP8Zn7DGj1VKBrDOc"
                                        target="_blank"
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-emerald-500 text-white px-8 py-5 rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-all"
                                    >
                                        Join WhatsApp Community
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                ) : (
                                    <div className="w-full sm:w-auto inline-flex items-center justify-center gap-4 px-8 py-4 bg-emerald-900/50 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] border border-emerald-800 text-emerald-400">
                                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                      ACCESS RESTRICTED UNTIL SELECTION
                                    </div>
                                  )}
                            </div>
                        </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === "Opportunity" && (
                  <motion.div key="Opportunity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 py-10 w-full">
                     <div className="text-center max-w-3xl mx-auto space-y-6">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[#1B4332] border border-emerald-100">
                           <Zap size={12} className="text-amber-500 fill-amber-500" />
                           ELITE CREATOR PROGRAM
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-[#1B4332]">
                           Content <br /> Opportunity
                        </h2>
                        <p className="text-base md:text-xl text-slate-500 font-medium italic max-w-xl mx-auto leading-relaxed">
                           “Tell stories. Get noticed. Work on high-impact media projects.”
                        </p>
                     </div>

                     <div className="grid md:grid-cols-3 gap-6 sm:gap-8 w-full">
                        {[
                          { t: "Real Brands", d: "Create content for top-tier brands and startups.", i: Globe, c: "bg-blue-50/50 text-blue-600 border-blue-100/50" },
                          { t: "Paid Work", d: "Get rewarded for your storytelling & editing skills.", i: Zap, c: "bg-amber-50/50 text-amber-600 border-amber-100/50" },
                          { t: "Core Team", d: "Work alongside the SARTHI media team.", i: Users, c: "bg-emerald-50/50 text-emerald-600 border-emerald-100/50" }
                        ].map((item, i) => (
                          <div key={i} className="p-6 sm:p-10 bg-white border border-slate-100 rounded-[2rem] sm:rounded-[3rem] space-y-6 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden w-full">
                             <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.c)}>
                                <item.i size={28} />
                             </div>
                             <div className="space-y-3">
                                <h4 className="text-xl font-black uppercase tracking-tight text-[#1B4332]">{item.t}</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.d}</p>
                             </div>
                          </div>
                        ))}
                     </div>

                     <div className="max-w-xl mx-auto p-6 sm:p-8 bg-emerald-50/50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-emerald-100/50 text-center space-y-4 w-full">
                        <div className="flex justify-center">
                           <div className="px-4 py-1.5 bg-[#1B4332] text-white text-[9px] font-black uppercase tracking-widest rounded-full">How it works</div>
                        </div>
                        <p className="text-sm text-[#1B4332] font-black uppercase tracking-widest leading-relaxed">
                           Top creators are selected based on editing, storytelling & impact.
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic leading-relaxed">
                           * Only high-signal creators will be considered based on their creativity & impact.
                        </p>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <aside className="lg:col-span-4 relative w-full max-w-full">
            <div
              className={`bg-emerald-950 rounded-[2rem] sm:rounded-[3rem] overflow-hidden transition-all duration-700 shadow-2xl shadow-emerald-950/40 border border-white/10 ${
                stickyCard ? "lg:sticky lg:top-24 lg:scale-[1.02]" : ""
              }`}
            >
              <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8 border-b border-white/5 bg-emerald-900/20 backdrop-blur-md">
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-emerald-400/40 mb-6">Program Tracks</p>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-2xl p-1 overflow-hidden shrink-0 border border-white/10">
                    <Image src="/sarthi-logo.png" alt="SARTHI" width={56} height={56} className="object-contain" />
                  </div>
                  <p className="text-white font-extrabold text-2xl tracking-tighter leading-none">Creator Induction</p>
                </div>
              </div>

              <div className="px-6 sm:px-10 py-8 sm:py-10 space-y-6 sm:space-y-8 border-b border-white/5">
                {[
                  { label: "Duration", value: PROGRAM_META.duration, icon: Clock },
                  { label: "Commitment", value: PROGRAM_META.commitment, icon: Activity },
                  { label: "Track Type", value: PROGRAM_META.track, icon: Layout },
                  { label: "Awarded", value: PROGRAM_META.cohortLabel, icon: Trophy },
                  { label: "Deadline", value: "No Deadlines", icon: Clock },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between group gap-6">
                    <div className="flex items-center gap-4 shrink-0 pt-1">
                      <item.icon className="text-emerald-400/40 w-5 h-5 stroke-[1.5] group-hover:text-emerald-400 transition-colors" />
                      <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em]">{item.label}</p>
                    </div>
                    <p className="text-white text-sm font-extrabold tracking-tight text-right leading-tight">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="px-6 sm:px-10 py-8 sm:py-10 bg-emerald-900/20 backdrop-blur-sm">
                {submissionStatus === "NONE" ? (
                  <button
                    onClick={handleOpenSubmission}
                    className="w-full py-4 md:py-6 rounded-2xl bg-emerald-500 text-white font-extrabold text-sm tracking-[0.2em] uppercase hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                  >
                    Submit Now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                   <div className="w-full py-4 md:py-6 rounded-2xl bg-white/5 border border-white/10 text-emerald-400 text-center font-bold text-sm tracking-widest uppercase">
                      Application {submissionStatus}
                   </div>
                )}
                <p className="text-center text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mt-6">
                  Enterprise verification active
                </p>
              </div>
            </div>

            {/* Support Resources */}
            <div className="mt-12 px-2 sm:px-4 space-y-6">
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-gray-400">Support Resources</p>
                <div className="space-y-4">
                  {[
                    { id: 'curriculum', title: "Program curriculum details", icon: BookOpen },
                    { id: 'certification', title: "Certification validity", icon: ShieldCheck },
                    { id: 'technical', title: "Technical requirements", icon: Code }
                  ].map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => handleOpenResource(item.id as any)}
                      className="w-full flex items-center justify-between group py-3 border-b border-gray-100 last:border-0"
                    >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-emerald-950 group-hover:text-emerald-600 transition-colors tracking-tight">{item.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Resource Modal */}
      <ResourceModal 
        id={selectedResource} 
        onClose={() => setSelectedResource(null)} 
      />
      
      {/* Footer Bonus */}
      <footer className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 py-12 border-t border-gray-200/60">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
              <div className="space-y-8 sm:space-y-12">
                  <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-emerald-950 tracking-tighter uppercase leading-[0.95]">
                      🚀 SARTHI <br /> <span className="text-emerald-600">Creator <br /> Induction</span>
                  </h2>
                  <div className="max-w-md space-y-6">
                      <p className="text-xl sm:text-2xl font-bold text-emerald-900/80 tracking-tight">Turn your ideas into recognition.</p>
                      <p className="text-base sm:text-lg text-gray-500 leading-relaxed font-medium">
                          We’re inviting creators, researchers, and builders to showcase their skills through real work. This is not for everyone.
                      </p>
                  </div>
              </div>
              <div className="space-y-12 lg:pb-4">
                  <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
                      <div className="space-y-4 sm:space-y-6">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-sm">
                              <Trophy className="w-7 h-7 text-emerald-600" />
                          </div>
                          <div className="space-y-2 sm:space-y-3">
                              <p className="font-bold text-emerald-950 uppercase tracking-widest text-[11px]">Rewards & Badges</p>
                              <p className="text-gray-500 font-medium leading-relaxed text-sm sm:text-base">Internship Badge, Personalized Certificate, and global platform visibility.</p>
                          </div>
                      </div>
                      <div className="space-y-4 sm:space-y-6">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-sm">
                              <ShieldCheck className="w-7 h-7 text-emerald-600" />
                          </div>
                          <div className="space-y-2 sm:space-y-3">
                              <p className="font-bold text-[#1B4332] uppercase tracking-widest text-[11px]">Selective Entry</p>
                              <p className="text-gray-500 font-medium leading-relaxed text-sm sm:text-base">Only consistent and serious creators will be selected for the final cohort.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
}
