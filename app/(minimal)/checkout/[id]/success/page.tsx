'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  Users, 
  LayoutDashboard,
  Clock,
  Mail,
  Zap,
  Globe,
  Sparkles,
  ChevronRight,
  Shield,
  Star
} from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import ReceiptSuccessModal from '@/components/payments/ReceiptSuccessModal';

// Constants from Landing Page for Parity
const BG_IMAGE = '/summer-camp-bg-v2.png';

const fadeInUp = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

const stagger = (delay: number) => ({
  initial: { y: 24, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }
});

export default function SuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  
  const courseId = params.id as string;
  const paymentId = searchParams.get('paymentId') || 'pay_RVZ' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const enrollmentId = searchParams.get('enrollmentId') || 'TT-SC26-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  
  const [mounted, setMounted] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const steps = [
    { id: 1, title: 'Payment Completed', status: 'completed', icon: <Zap className="w-4 h-4" />, timeline: 'INSTANT' },
    { id: 2, title: 'Enrollment Verification', status: 'pending', icon: <Shield className="w-4 h-4" />, timeline: '1-2 HOURS' },
    { id: 3, title: 'Batch Allocation', status: 'upcoming', icon: <Users className="w-4 h-4" />, timeline: 'MAY 2026' },
    { id: 4, title: 'Dashboard Unlocked', status: 'upcoming', icon: <LayoutDashboard className="w-4 h-4" />, timeline: 'JUNE 2026' },
    { id: 5, title: 'Live Classes Begin', status: 'upcoming', icon: <Calendar className="w-4 h-4" />, timeline: 'JULY 1, 2026' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-[#FBBF24] selection:text-[#020617] overflow-x-hidden font-sans">
      
      {/* ── CINEMATIC BACKGROUND SYSTEM ── */}
      <div className="fixed inset-0 z-0">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.65, scale: 1 }}
          transition={{ duration: 2.5 }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${BG_IMAGE}')` }}
        />
        
        {/* Layered Gradient Overlay (Landing Page Parity) */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(2,6,23,0.4) 0%, rgba(2,6,23,0.85) 50%, rgba(2,6,23,0.98) 100%)'
          }}
        />
        
        {/* Radial Ambient Glows */}
        <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-[#FBBF24]/[0.05] blur-[140px] -translate-x-1/4 -translate-y-1/4 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-indigo-500/[0.05] blur-[140px] translate-x-1/4 translate-y-1/4 pointer-events-none" />

        {/* Grain Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')] mix-blend-soft-light" />
        
        {/* Floating Particles (Cinematic) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: '110%', x: `${Math.random() * 100}%`, opacity: 0 }}
              animate={{ 
                y: '-10%', 
                opacity: [0, 0.4, 0],
                x: `${(Math.random() * 100) + (Math.sin(i) * 10)}%`
              }}
              transition={{ 
                duration: 10 + Math.random() * 15, 
                repeat: Infinity, 
                delay: Math.random() * 10,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-[#FBBF24] rounded-full blur-[1px]"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-24 pb-32">
        
        {/* ── HERO SECTION ── */}
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="relative mb-10"
          >
            <div className="absolute inset-0 bg-[#FBBF24] blur-[80px] opacity-30 rounded-full" />
            <div className="absolute -inset-8 bg-[#FBBF24] blur-[120px] opacity-10 rounded-full" />
            <div className="relative w-28 h-28 bg-gradient-to-br from-[#FFD84D] to-[#FFC107] rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(251,191,36,0.4)]">
              <CheckCircle2 className="w-14 h-14 text-[#020617]" strokeWidth={2.5} />
            </div>
            <Sparkles className="absolute -top-4 -right-4 w-9 h-9 text-[#FBBF24] opacity-60 animate-pulse" />
            <Sparkles className="absolute -bottom-3 -left-3 w-5 h-5 text-yellow-300 opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </motion.div>

          <motion.h1 
            {...fadeInUp}
            className="text-[clamp(48px,8vw,80px)] leading-[1.1] font-black tracking-[-0.03em] text-white mb-6"
          >
            Welcome to <span className="text-[#FBBF24]">Summer Camp 2026.</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
              Your seat has been successfully reserved. Our team will verify your enrollment to prepare your onboarding details.
            </p>
            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24] text-[10px] font-black uppercase tracking-[0.2em]">
               <Zap size={12} /> Your journey into real-world tech begins now.
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ── LEFT: DETAILS & ONBOARDING ── */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Enrollment Summary */}
            <motion.div
              {...stagger(0.5)}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-[#FBBF24]/5 blur-[60px] rounded-[40px] pointer-events-none" />
              <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-white/[0.08] p-10 lg:p-14 shadow-2xl">
                <div className="flex items-center gap-3 mb-12">
                  <div className="w-10 h-[1px] bg-[#FBBF24]/50" />
                  <h3 className="text-[10px] font-black text-[#FBBF24] uppercase tracking-[0.3em]">Enrollment Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-12">
                  <DetailItem label="Student Name" value={user?.name || 'Innovator'} />
                  <DetailItem label="Course Access" value={searchParams.get('type') === 'group' ? 'Python Summer Masterclass (Group Bundle - 5 seats)' : 'Python Summer Masterclass'} />
                  <DetailItem label="Amount Paid" value={searchParams.get('type') === 'group' ? '₹2,500' : '₹1,000'} />
                  <DetailItem label="Payment ID" value={paymentId} isMono />
                  <DetailItem label="Enrollment ID" value={enrollmentId} isMono />
                  <DetailItem label="Verified Date" value="9 May 2026" />
                </div>
              </div>
            </motion.div>

            {/* What Happens Next Cards */}
            <div className="space-y-8">
               <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <Star size={20} className="text-[#FBBF24]" />
                  What Happens Next?
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <OnboardingCard 
                    icon={<Mail className="text-blue-400" />}
                    title="Welcome Kit"
                    desc="A curriculum guide and setup instructions are heading to your email."
                  />
                  <OnboardingCard 
                    icon={<MessageSquare className="text-green-400" />}
                    title="Community"
                    desc="Join our high-signal Discord server to meet your mentors and peers."
                  />
                  <OnboardingCard 
                    icon={<Users className="text-purple-400" />}
                    title="Live Pods"
                    desc="We'll assign you to a specific learning batch for personalized attention."
                  />
                  <OnboardingCard 
                    icon={<LayoutDashboard className="text-[#FBBF24]" />}
                    title="Dashboard"
                    desc="All live links and resources will be available on your learning hub."
                  />
               </div>
            </div>
          </div>

          {/* ── RIGHT: TIMELINE ── */}
          <div className="lg:col-span-4 self-start">
             <motion.div
                {...stagger(0.6)}
                className="bg-white/[0.03] backdrop-blur-2xl rounded-[32px] border border-white/[0.08] p-8 lg:p-10 shadow-2xl sticky top-28"
             >
                <h3 className="text-lg font-black text-white mb-10 flex items-center gap-3">
                   <Clock className="w-4 h-4 text-[#FBBF24]" />
                   Onboarding Flow
                </h3>

                <div className="space-y-10 relative">
                   <div className="absolute left-[19.5px] top-4 bottom-4 w-[1px] bg-white/10" />
                   {steps.map((step) => (
                      <div key={step.id} className="relative flex gap-6">
                         <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-700 ${
                            step.status === 'completed' ? 'bg-[#FBBF24] border-[#FBBF24] text-[#020617] shadow-[0_0_20px_rgba(251,191,36,0.3)]' :
                            step.status === 'pending' ? 'bg-[#020617] border-[#FBBF24] text-[#FBBF24]' :
                            'bg-[#020617] border-white/10 text-slate-600'
                         }`}>
                            {step.status === 'completed' ? <CheckCircle2 size={16} strokeWidth={3} /> : step.icon}
                         </div>
                         <div className="flex flex-col justify-center">
                            <span className={`text-[13px] font-black uppercase tracking-tight ${
                               step.status === 'completed' ? 'text-white' : 
                               step.status === 'pending' ? 'text-[#FBBF24]' : 'text-slate-500'
                            }`}>
                               {step.title}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                               {step.timeline}
                            </span>
                         </div>
                      </div>
                   ))}
                </div>

                <motion.button
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => router.push('/dashboard/my-learning/summer-camp-2026')}
                   className="w-full mt-12 bg-white text-[#020617] py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-[#FBBF24] transition-all group shadow-xl"
                >
                   Enter Learning Dashboard
                   <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <p className="mt-8 text-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] italic opacity-50">
                   “Get ready to build, innovate, and grow.”
                </p>
             </motion.div>

             {/* Support Quick Link */}
             <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] transition-all"
                onClick={() => router.push('/help')}
             >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center">
                      <Globe size={18} className="text-slate-400 group-hover:text-[#FBBF24] transition-colors" />
                   </div>
                   <div>
                      <p className="text-xs font-black text-white">Need Help?</p>
                      <p className="text-[10px] font-medium text-slate-500">Contact Student Support</p>
                   </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-all" />
             </motion.div>
          </div>

        </div>
      </div>

      <ReceiptSuccessModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title={searchParams.get('type') === 'group' ? 'Python Summer Masterclass (Group)' : 'Python Summer Masterclass'}
        amount={searchParams.get('type') === 'group' ? '₹2,500' : '₹1,000'}
        actionLabel="Enter Dashboard"
        onAction={() => setIsReceiptOpen(false)}
        details={[
          { label: "Student Name", value: user?.name || "Student" },
          { label: "Transaction ID", value: paymentId, isMono: true },
          { label: "Enrollment ID", value: enrollmentId, isMono: true },
          { label: "Program", value: "Summer Camp 2026" },
        ]}
      />
    </div>
  );
}

function DetailItem({ label, value, isMono = false }: { label: string; value: string; isMono?: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</span>
      <span className={`text-xl font-black text-white tracking-tight ${isMono ? 'font-mono text-lg' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function OnboardingCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, borderColor: 'rgba(251,191,36,0.3)', backgroundColor: 'rgba(255,255,255,0.05)' }}
      className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-8 rounded-[32px] transition-all duration-500 group"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500">
        {icon}
      </div>
      <h4 className="text-white text-lg font-black mb-3">{title}</h4>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
}
