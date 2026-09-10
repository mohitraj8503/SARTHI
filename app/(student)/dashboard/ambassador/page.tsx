'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Copy, Check, Sparkles, Send, Award, Compass, RefreshCw, AlertCircle, ExternalLink, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface AmbassadorProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
  registrationsCount: number;
  taskStatus: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  dateApproved?: string;
  collegeName?: string;
}

export default function AmbassadorOnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null);
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_APPLIED'>('NOT_APPLIED');
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student-ambassadors/me');
      if (res.status === 403) {
        window.location.href = '/dashboard?restricted=ambassador';
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        if (data.application) {
          setProfile(data.application);
        }
        if (data.userName) {
          setUserName(data.userName);
        }
      }
    } catch (err) {
      console.error('Error fetching ambassador profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Trigger confetti when completed
  useEffect(() => {
    if (profile && profile.registrationsCount >= 100 && profile.taskStatus === 'COMPLETED') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [profile]);

  const handleCopyCode = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    if (!profile) return;
    const link = `${window.location.origin}/auth/signup?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied to clipboard!');
  };


  if (loading) {
    return (
      <div className="min-h-screen dashboard-container-glass flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#174F3A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#174F3A] font-black uppercase tracking-widest text-xs">Syncing Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-transparent p-3 sm:p-4 lg:p-10 pb-24 lg:pb-20 space-y-8 sm:space-y-12 min-h-screen">
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 max-w-[1600px] mx-auto">
        
        {/* Minimal Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 border-b border-slate-200/80 pb-6">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">CAMPUS DRIVE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              STUDENT <span className="text-emerald-500">AMBASSADOR</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
              Empower your campus, share SARTHI, and earn rewards
            </p>
          </div>
        </header>

        {/* Case 1: Not Applied */}
        {status === 'NOT_APPLIED' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white border border-slate-200 rounded-3xl text-center flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <Compass className="w-14 h-14 text-emerald-600 mb-5 animate-pulse" />
            <h2 className="text-2xl font-extrabold mb-3 text-slate-900">Join the SARTHI Ambassador Cohort</h2>
            <p className="text-slate-500 text-sm max-w-lg leading-relaxed mb-8">
              Grow your leadership skills, build a thriving developer community on your campus, and earn exclusive ranks, certificates, and prizes. Apply in minutes!
            </p>
            <a
              href="/student-ambassadors/apply"
              className="px-8 py-3.5 bg-[#16A34A] hover:bg-[#2D6A4F] text-white font-bold rounded-full text-sm uppercase tracking-wider transition-colors shadow-lg shadow-[#16A34A]/25"
            >
              Apply Now
            </a>
          </motion.div>
        )}

        {/* Case 2: Pending Approval */}
        {status === 'PENDING' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white border border-slate-200 rounded-3xl text-center flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <Clock className="w-14 h-14 text-amber-500 mb-5 animate-spin-slow" />
            <h2 className="text-2xl font-extrabold mb-3 text-slate-900">Application Under Review</h2>
            <p className="text-slate-500 text-sm max-w-lg leading-relaxed mb-6">
              Thank you for applying! Our community coordinators are currently reviewing your Statement of Purpose and college details. We will notify you by email once approved.
            </p>
            <span className="px-4 py-2 bg-amber-550/10 border border-amber-500/20 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider">
              Pending Review
            </span>
          </motion.div>
        )}

        {/* Case 3: Rejected */}
        {status === 'REJECTED' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white border border-slate-200 rounded-3xl text-center flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <XCircle className="w-14 h-14 text-rose-500 mb-5" />
            <h2 className="text-2xl font-extrabold mb-3 text-slate-900">Application Update</h2>
            <p className="text-slate-500 text-sm max-w-lg leading-relaxed mb-6">
              We appreciate your interest in the SARTHI Student Ambassador program. Unfortunately, your application was not approved for this cohort. You may reach out to support for feedback.
            </p>
            <span className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full text-xs font-bold uppercase tracking-wider">
              Not Approved
            </span>
          </motion.div>
        )}

        {/* Case 4: Approved & Onboarded */}
        {status === 'APPROVED' && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Welcome Box */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-left">
                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                  Welcome, {profile.firstName}!
                </h2>
                <p className="text-slate-600 text-xs md:text-sm mt-0.5">
                  You're officially a SARTHI Student Ambassador for <span className="text-emerald-600 font-bold">{profile.collegeName || 'your university'}</span>.
                </p>
              </div>
            </div>

            {/* Grid Layout for Referral Card & Task Progress Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Left Column: Unique Referral Code Card (7/12 span) */}
              <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
                
                <div className="text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-4">
                    <Award className="w-3.5 h-3.5" /> Referral Code
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Invite Your Network</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6">
                    Distribute your referral code. Every peer who registers using your code links to your profile and counts toward your drive milestone.
                  </p>
                </div>

                {/* Big Referral Code Display */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-center relative group">
                  <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Your Unique Code</span>
                  <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 tracking-wider font-mono">
                    {profile.referralCode}
                  </div>
                  
                  {/* Copy Button overlay */}
                  <button
                    onClick={handleCopyCode}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all text-slate-600 hover:text-slate-900"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Share Link Row */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-[#174F3A] hover:from-emerald-700 hover:to-[#0F3527] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                  >
                    <Send className="w-4 h-4" /> Copy Referral Link
                  </button>
                  <div className="text-center text-[10px] text-slate-400 font-semibold truncate">
                    {window.location.origin}/auth/signup?ref={profile.referralCode}
                  </div>
                </div>
              </div>

              {/* Right Column: Task 1: Drive Card (5/12 span) */}
              <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/10 transition-all" />
                
                <div className="text-left">
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                      Challenge 01
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      profile.registrationsCount >= 100
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600'
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-pulse'
                    }`}>
                      {profile.registrationsCount >= 100 ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">Campus Registration Drive</h3>
                  <p className="text-slate-550 text-xs leading-relaxed mb-6">
                    Enroll 100 students from your university on SARTHI.
                  </p>
                </div>

                {/* Progress bar and counters */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Registrations</span>
                      <span className="text-2xl font-extrabold text-slate-900">{profile.registrationsCount} <span className="text-sm font-semibold text-slate-400">/ 100</span></span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">{Math.min(100, Math.round((profile.registrationsCount / 100) * 100))}%</span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (profile.registrationsCount / 100) * 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#174F3A]"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Timeline:</span>
                      <span className="text-slate-700 font-medium">30 Days</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Reward:</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">500 XP + Ambassador Badge</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Test Simulation Panel */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-left">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4 text-emerald-600" /> Developer Sandbox Simulator
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Test the drive progress live! Use the button below to register mock students under your code. This will increment your referral counter in real-time.
              </p>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/auth/signup', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: `Mock User ${Date.now().toString().slice(-4)}`,
                        email: `mock_${Date.now()}@example.com`,
                        password: 'Password123!',
                        referralCode: profile.referralCode
                      })
                    });
                    if (res.ok) {
                      alert('Mock User Registered Successfully! Counter incremented.');
                      fetchProfile(); // Reload
                    } else {
                      const err = await res.json();
                      alert(`Mock signup failed: ${err.error || 'Unknown error'}`);
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold rounded-lg text-xs tracking-wide uppercase transition-colors"
              >
                Register 1 Mock Peer (Test Counter)
              </button>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
