'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RotateCcw, CheckCircle2, ArrowRight, AlertTriangle, ShieldCheck, Home } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';

export default function ApplicationStatusPage() {
  const [appStatus, setAppStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const fetchStatus = async () => {
    try {
      const localEmail = localStorage.getItem('tt_teacher_app_email');
      const url = localEmail ? `/api/teacher/apply?email=${encodeURIComponent(localEmail)}` : '/api/teacher/apply';
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.status !== 'NONE') {
          setAppStatus(data);
          if (data.status === 'PENDING') {
            localStorage.setItem('tt_teacher_app_email', data.email);
          }
        } else {
          // No application found, send to apply page
          router.push('/teach/apply');
        }
      } else {
        router.push('/teach/apply');
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
      addToast({ type: 'error', title: 'Fetch Error', message: 'Failed to retrieve application status.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-poll status every 30 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, router]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/teacher/apply/reset', { method: 'POST' });
      if (res.ok) {
        addToast({ type: 'success', title: 'Application Reset', message: 'You can now revise your submission.' });
        router.push('/teach/apply');
      } else {
        addToast({ type: 'error', title: 'Reset Failed', message: 'Could not restart application.' });
      }
    } catch (e) {
      addToast({ type: 'error', title: 'Reset Error', message: 'Could not restart application.' });
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0B0F14]">
        <Loader2 className="w-12 h-12 animate-spin text-[#4ade80]" />
      </div>
    );
  }

  // PENDING / UNDER REVIEW STATE
  if (appStatus && (appStatus.status === 'PENDING' || appStatus.status === 'UNDER_REVIEW')) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative" style={{
        backgroundColor: '#0B0F14',
        backgroundImage: 'linear-gradient(rgba(11, 15, 20, 0.75), rgba(11, 15, 20, 0.98)), url(\'/images/teacher-apply-bg.jpg\')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-[#4ade80]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[30%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[650px] p-10 rounded-[32px] border border-white/5 bg-[#161B22]/40 backdrop-blur-[24px] text-center space-y-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#4ade80]/40 to-transparent" />
          
          <div className="space-y-3">
            <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/20 inline-block">
              Review In Progress
            </span>
            <h1 className="text-[36px] font-extrabold text-[#F9FAFB] tracking-tight leading-tight pt-2">
              Application Under Review
            </h1>
            <p className="text-[#94A3B8] text-[16px] max-w-md mx-auto leading-relaxed">
              Your instructor onboarding application has been successfully submitted to the SARTHI Academic Board.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-left space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#4ade80]/20 text-[#4ade80] flex items-center justify-center shrink-0 font-bold text-sm">✓</div>
              <div>
                <p className="text-sm font-bold text-[#F9FAFB]">Application Submitted</p>
                <p className="text-xs font-semibold text-[#64748B] mt-0.5">Details and documents synchronized securely.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#4ade80]/20 text-[#4ade80] flex items-center justify-center shrink-0 font-bold text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#F9FAFB]">Admin Review in Progress</p>
                <p className="text-xs font-semibold text-amber-400 mt-0.5">Vetting credentials, tools mastery, and teaching vision.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start opacity-40">
              <div className="w-8 h-8 rounded-full bg-white/5 text-[#64748B] flex items-center justify-center shrink-0 font-bold text-sm">3</div>
              <div>
                <p className="text-sm font-bold text-[#F9FAFB]">Approval & Verification</p>
                <p className="text-xs font-semibold text-[#64748B] mt-0.5">Provisioning @sarthi-woad.vercel.app instructor credentials.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Estimated Wait</p>
              <p className="text-lg font-bold text-[#F9FAFB] mt-1">1–2 Hours</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Verification Status</p>
              <p className="text-lg font-bold text-[#4ade80] mt-1">Pending Approval</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => router.push('/')}
              className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/5 text-[#94A3B8] hover:text-[#F9FAFB] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
            >
              <Home size={14} /> Return to Home
            </button>
            <button 
              onClick={fetchStatus}
              className="flex-1 h-14 bg-[#4ade80] hover:brightness-105 text-[#0B0F14] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.15)]"
            >
              Check Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CHANGES REQUESTED STATE
  if (appStatus && appStatus.status === 'CHANGES_REQUESTED') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative" style={{
        backgroundColor: '#0B0F14',
        backgroundImage: 'linear-gradient(rgba(11, 15, 20, 0.75), rgba(11, 15, 20, 0.98)), url(\'/images/teacher-apply-bg.jpg\')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[650px] p-10 rounded-[32px] border border-white/5 bg-[#161B22]/40 backdrop-blur-[24px] text-center space-y-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
          
          <div className="space-y-3">
            <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-pink-500/15 text-pink-400 border border-pink-500/20 inline-block">
              Revision Requested
            </span>
            <h1 className="text-[36px] font-extrabold text-[#F9FAFB] tracking-tight leading-tight pt-2">
              Action Required: Revisions Needed
            </h1>
            <p className="text-[#94A3B8] text-[16px] max-w-md mx-auto leading-relaxed">
              Our reviewer requested some adjustments to your instructor application before we can proceed with approval.
            </p>
          </div>

          {appStatus.adminNotes && (
            <div className="p-6 rounded-2xl bg-pink-500/5 border border-pink-500/10 text-left space-y-2">
              <p className="text-xs font-bold text-pink-400 uppercase tracking-wider">Reviewer Feedback:</p>
              <p className="text-sm font-semibold text-[#F9FAFB] italic leading-relaxed">
                &quot;{appStatus.adminNotes}&quot;
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => router.push('/')}
              className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/5 text-[#94A3B8] hover:text-[#F9FAFB] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
            >
              Return to Home
            </button>
            <button 
              onClick={handleReset}
              disabled={isResetting}
              className="flex-1 h-14 bg-[#4ade80] hover:brightness-105 text-[#0B0F14] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.15)] disabled:opacity-50"
            >
              {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revise Application'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SUSPENDED STATE
  if (appStatus && appStatus.status === 'SUSPENDED') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative" style={{
        backgroundColor: '#0B0F14',
        backgroundImage: 'linear-gradient(rgba(11, 15, 20, 0.75), rgba(11, 15, 20, 0.98)), url(\'/images/teacher-apply-bg.jpg\')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[650px] p-10 rounded-[32px] border border-white/5 bg-[#161B22]/40 backdrop-blur-[24px] text-center space-y-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
          
          <div className="space-y-3">
            <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/20 inline-block">
              Account Suspended
            </span>
            <h1 className="text-[36px] font-extrabold text-[#F9FAFB] tracking-tight leading-tight pt-2">
              Instructor Profile Suspended
            </h1>
            <p className="text-[#94A3B8] text-[16px] max-w-md mx-auto leading-relaxed">
              Your instructor account has been suspended by a system administrator. Access to the mentor dashboard has been disabled.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-left space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sans">Next Steps:</p>
            <p className="text-sm font-semibold text-gray-300 leading-relaxed">
              If you believe this decision is in error, or if you want to request unsuspension, please get in touch with our faculty support division.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => router.push('/')}
              className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/5 text-[#94A3B8] hover:text-[#F9FAFB] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
            >
              Return to Home
            </button>
            <a 
              href="mailto:support@sarthi.in"
              className="flex-1 h-14 bg-[#4ade80] hover:brightness-105 text-[#0B0F14] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.15)] text-center flex items-center justify-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // APPROVED STATE
  if (appStatus && appStatus.status === 'APPROVED') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative" style={{
        backgroundColor: '#0B0F14',
        backgroundImage: 'linear-gradient(rgba(11, 15, 20, 0.75), rgba(11, 15, 20, 0.98)), url(\'/images/teacher-apply-bg.jpg\')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-[#4ade80]/15 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-[650px] p-10 rounded-[32px] border border-white/5 bg-[#161B22]/40 backdrop-blur-[24px] text-center space-y-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#4ade80]/60 to-transparent" />
          
          <div className="space-y-3">
            <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/20 inline-block">
              Accepted 🎉
            </span>
            <h1 className="text-[36px] font-extrabold text-[#F9FAFB] tracking-tight leading-tight pt-2">
              Congratulations! You&apos;ve Been Accepted
            </h1>
            <p className="text-[#94A3B8] text-[16px] max-w-md mx-auto leading-relaxed">
              Your instructor profile has been approved by the SARTHI board. Welcome to the elite educator network!
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#4ade80]/5 border border-[#4ade80]/10 text-left space-y-3 text-[#4ade80]">
            <p className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> Mentor Dashboard Access Enabled
            </p>
            <p className="text-xs text-[#94A3B8] font-medium leading-relaxed">
              Your credentials and official inbox have been provisioned. Please check your personal email for account credentials and onboarding instructions.
            </p>
          </div>

          <button 
            onClick={() => router.push('/teacher/dashboard')}
            className="w-full h-14 bg-[#4ade80] hover:brightness-105 text-[#0B0F14] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(74,222,128,0.2)]"
          >
            Go to Mentor Dashboard <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // REJECTED STATE
  if (appStatus && appStatus.status === 'REJECTED') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative" style={{
        backgroundColor: '#0B0F14',
        backgroundImage: 'linear-gradient(rgba(11, 15, 20, 0.75), rgba(11, 15, 20, 0.98)), url(\'/images/teacher-apply-bg.jpg\')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-[650px] p-10 rounded-[32px] border border-white/5 bg-[#161B22]/40 backdrop-blur-[24px] text-center space-y-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
          
          <div className="space-y-3">
            <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/20 inline-block">
              Application Rejected
            </span>
            <h1 className="text-[36px] font-extrabold text-[#F9FAFB] tracking-tight leading-tight pt-2">
              Application Status Update
            </h1>
            <p className="text-[#94A3B8] text-[16px] max-w-md mx-auto leading-relaxed">
              Thank you for your interest in teaching at SARTHI. Unfortunately, our Academic Board is unable to approve your application at this time.
            </p>
          </div>

          {appStatus.rejectionReason && (
            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-left space-y-2">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Academic Board Feedback:</p>
              <p className="text-sm font-semibold text-[#F9FAFB] italic leading-relaxed">
                &quot;{appStatus.rejectionReason}&quot;
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => router.push('/')}
              className="flex-1 h-14 bg-white/5 hover:bg-white/10 border border-white/5 text-[#94A3B8] hover:text-[#F9FAFB] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
            >
              Return to Home
            </button>
            <button 
              onClick={handleReset}
              disabled={isResetting}
              className="flex-1 h-14 bg-[#4ade80] hover:brightness-105 text-[#0B0F14] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.15)] disabled:opacity-50"
            >
              {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revise & Reapply'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FALLBACK
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F14] text-white">
      <div className="text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <p className="text-lg">No application status found.</p>
        <button onClick={() => router.push('/teach/apply')} className="bg-[#4ade80] text-black px-6 py-2 rounded-xl font-bold">
          Start Onboarding
        </button>
      </div>
    </div>
  );
}
