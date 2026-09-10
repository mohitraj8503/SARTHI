'use client';

// Trigger Hostinger rebuild and redeploy

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, BookOpen, Briefcase, GraduationCap, FileText, CheckCircle2,
  ArrowRight, ArrowLeft, Upload, Loader2, AlertCircle, Video, Save,
  Star, Users, Globe, ShieldCheck, Sparkles, Plus, X, Calendar, Clock,
  ExternalLink, Play, Mail, Phone, MapPin, ChevronDown, RotateCcw,
  Lock, Shield
} from 'lucide-react';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/haptics';
import { PhotoUpload } from '@/components/teacher/PhotoUpload';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { ErrorBoundary } from 'react-error-boundary';
import { sanitizeObject } from '@/lib/utils/sanitization';
import { 
  personalDetailsSchema, 
  professionalDetailsSchema, 
  educationEntrySchema, 
  teachingDetailsSchema, 
  availabilityDetailsSchema 
} from '@/lib/validations/teacher-application';

const STEPS = [
  { id: 1, title: 'Identity', subtitle: 'Who are you?', icon: User },
  { id: 2, title: 'Professional', subtitle: 'Your expertise', icon: Briefcase },
  { id: 3, title: 'Credentials', subtitle: 'Education & Certs', icon: GraduationCap },
  { id: 4, title: 'Capability', subtitle: 'Teaching style', icon: BookOpen },
  { id: 5, title: 'Availability', subtitle: 'Schedule & Pay', icon: Calendar },
  { id: 6, title: 'Review', subtitle: 'Final check', icon: ShieldCheck },
];

export default function BecomeTeacherPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [furthestStepReached, setFurthestStepReached] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [appStatus, setAppStatus] = useState<any>(null);
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState<any>({
    personalDetails: { fullName: '', email: '', phone: '', city: '', country: '', profilePhotoUrl: '', linkedinUrl: '', githubUrl: '', personalWebsite: '', shortBio: '' },
    professionalDetails: { headline: '', bio: '', primaryDomain: '', skills: [], yearsOfExperience: '', currentRole: '', currentCompany: '', previousCompanies: '', industryExpertise: '', toolsMastery: '', languagesKnown: '', teachingCategories: [], preferredSessionType: [] },
    educationDetails: [{ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' }],
    credentialsDetails: { highestQualification: '', certifications: [], achievements: '', awards: '', publishedResearch: '', hackathonsParticipated: '', openSourceContributions: '', teachingExperience: '', pastWorkshops: '' },
    teachingDetails: { teachingStyle: '', audiencePreference: [], comfortableClassSize: '', communicationStyle: '', sessionLanguage: [], workshopEnergyLevel: '', interactiveMethods: '', toolsUsed: '', cameraComfort: '', publicSpeakingConfidence: '', demoVideoUrl: '', samplePresentationUrl: '', demoSessionLink: '', simplifyConcepts: '', idealWorkshopEnvironment: '', keepStudentsEngaged: '' },
    availabilityDetails: { availableDays: [], preferredTimeSlots: [], timezone: '', remoteOfflineAvailability: 'Remote & Offline', travelAvailability: false, minimumNoticePeriod: '', hourlyRate: '', perSessionRate: '', workshopPricing: '', preferredPaymentMethod: '', monthlyAvailability: '', weekendAvailability: false, corporateSessionAvailability: false },
    documents: { resumeUrl: '', idProofUrl: '', degreeUrl: '', certs: [] },
    reviewDetails: { bankDetails: '', agreedToNDA: false }
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // OTP States
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [shouldShake, setShouldShake] = useState(false);

  const resetOTP = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
    setOtpError('');
    setShouldShake(false);
  };

  const [draftSaveStatus, setDraftSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  // Debounced auto-save effect
  useEffect(() => {
    if (isLoading || !formData.personalDetails?.email || step === 6) return;

    setDraftSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const sanitizedData = sanitizeObject(formData);
        await fetch('/api/teacher/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...sanitizedData, step, status: 'DRAFT' }),
        });
        setDraftSaveStatus('saved');
        setTimeout(() => setDraftSaveStatus('idle'), 3000);
      } catch (err) {
        console.error('Auto-save failed:', err);
        setDraftSaveStatus('failed');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, step, isLoading]);


  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const localEmail = localStorage.getItem('tt_teacher_app_email');
        const url = localEmail ? `/api/teacher/apply?email=${encodeURIComponent(localEmail)}` : '/api/teacher/apply';
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.status !== 'NONE') {
            setAppStatus(data);
            if (data.email) localStorage.setItem('tt_teacher_app_email', data.email);
            if (data.status === 'APPROVED') {
              router.push('/teacher/dashboard');
              return;
            }
            setFormData({
              personalDetails: {
                fullName: data.fullName || user?.name || '',
                email: data.email || user?.email || '',
                phone: data.phone || '',
                city: data.city || '',
                country: data.country || '',
                profilePhotoUrl: data.profilePhotoUrl || '',
                linkedinUrl: data.linkedinUrl || '',
                githubUrl: data.githubUrl || '',
                personalWebsite: data.personalWebsite || '',
                shortBio: data.bio || '',
              },
              professionalDetails: {
                headline: data.headline || '',
                bio: data.bio || '',
                primaryDomain: data.primaryDomain || '',
                skills: data.skills ? JSON.parse(data.skills) : [],
                yearsOfExperience: data.yearsOfExperience?.toString() || '',
                currentRole: data.currentRole || '',
                currentCompany: data.currentCompany || '',
                previousCompanies: data.previousCompanies || '',
                industryExpertise: data.industryExpertise || '',
                toolsMastery: data.toolsMastery || '',
                languagesKnown: data.languagesKnown || '',
                teachingCategories: data.teachingCategories ? JSON.parse(data.teachingCategories) : [],
                preferredSessionType: data.preferredSessionType ? JSON.parse(data.preferredSessionType) : [],
              },
              educationDetails: data.education?.length > 0 ? data.education : [{ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' }],
              credentialsDetails: {
                highestQualification: data.highestQualification || '',
                certifications: data.certifications ? JSON.parse(data.certifications) : [],
                achievements: data.achievements || '',
                awards: data.awards || '',
                publishedResearch: data.publishedResearch || '',
                hackathonsParticipated: data.hackathonsParticipated || '',
                openSourceContributions: data.openSourceContributions || '',
                teachingExperience: data.teachingExperience?.toString() || '',
                pastWorkshops: data.pastWorkshops || '',
              },
              teachingDetails: {
                subjects: data.preferredSubjects ? JSON.parse(data.preferredSubjects) : [],
                level: data.preferredLevel || 'Intermediate',
                languages: data.languages ? JSON.parse(data.languages) : [],
                demoVideoUrl: data.demoVideoUrl || '',
                teachingMethodology: 'Project-Based',
                hasWebcam: false,
                hasMic: false,
                internetSpeed: '',
              },
              availabilityDetails: {
                availability: [],
                preferredMode: 'Live Weekends',
                timeCommitment: '',
                compensationExpectation: 'Revenue Share',
                pricing: data.pricing || '',
              },
              reviewDetails: {
                bankDetails: '',
                agreedToNDA: false,
              },
              documents: {
                resumeUrl: data.documents?.find((d: any) => d.type === 'RESUME')?.fileUrl || '',
                idProofUrl: data.documents?.find((d: any) => d.type === 'ID_PROOF')?.fileUrl || '',
                degreeUrl: data.documents?.find((d: any) => d.type === 'DEGREE')?.fileUrl || '',
                certs: data.documents?.filter((d: any) => d.type === 'CERTIFICATION')?.map((d: any) => d.fileUrl) || [],
              },
              reviewDetails: {
                bankDetails: data.bankDetails || '',
                agreedToNDA: data.agreedToNDA ?? false,
              }
            });
            setStep(data.currentStep || 1);
          } else {
            setFormData((prev: any) => ({
              ...prev,
              personalDetails: { ...prev.personalDetails, fullName: user?.name || '', email: user?.email || '' }
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch application:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, router]);

  // Poll application status when pending or under review
  useEffect(() => {
    if (!appStatus || !appStatus.email) return;
    
    const pendingStates = ['PENDING', 'UNDER_REVIEW', 'CHANGES_REQUESTED'];
    if (!pendingStates.includes(appStatus.status)) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/teacher/apply?email=${encodeURIComponent(appStatus.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.status !== 'NONE' && data.status !== appStatus.status) {
            setAppStatus(data);
            if (data.status === 'APPROVED') {
              router.push('/teacher/dashboard');
            }
          }
        }
      } catch (err) {
        console.error('Failed to poll application status:', err);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, [appStatus, router]);

  const saveDraft = useCallback(async (data: any, currentStep: number) => {
    if (isSubmitting) return;
    try {
      const sanitizedData = sanitizeObject(data);
      await fetch('/api/teacher/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sanitizedData, step: currentStep, status: 'DRAFT' }),
      });
      if (sanitizedData.personalDetails?.email) {
        localStorage.setItem('tt_teacher_app_email', sanitizedData.personalDetails.email);
      }
    } catch (err) {
      console.error('Draft save failed:', err);
    }
  }, [isSubmitting]);

   
  const handleNext = () => {
    if (!validateStep(step)) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Please fix the errors before continuing.' });
      return;
    }
    if (step < 6) {
      if (!canMoveToNext()) {
        addToast({ type: 'error', title: 'Identity Verification Required', message: 'Please verify your email via OTP before continuing.' });
        return;
      }
      setStep(s => s + 1);
      triggerHaptic('light');
      if (formData.personalDetails?.email) {
        localStorage.setItem('tt_teacher_app_email', formData.personalDetails.email);
      }
      saveDraft(formData, step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1);
      triggerHaptic('light');
    }
  };

   
  const handleSubmit = async () => {
    setIsSubmitting(true);
    triggerHaptic('medium');
    try {
      const res = await fetch('/api/teacher/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, step: 6, status: 'PENDING' })
      });
      if (res.ok) {
        if (formData.personalDetails?.email) {
          localStorage.setItem('tt_teacher_app_email', formData.personalDetails.email);
        }
        setShowSuccess(true);
        setTimeout(() => { triggerConfetti(); }, 500);
        setTimeout(() => {
          setShowSuccess(false);
          setAppStatus({ status: 'PENDING', email: formData.personalDetails.email });
        }, 4000);
      } else {
        throw new Error('Our systems are currently busy. Please try again.');
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Submission Error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToFirstError = (errors: Record<string, string>) => {
    setTimeout(() => {
      const firstKey = Object.keys(errors)[0];
      if (firstKey) {
        const slug = firstKey.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
        const element = document.getElementById(firstKey) || 
                        document.getElementById(`field-${slug}`) || 
                        document.querySelector(`[name="${firstKey}"]`);
        
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('error-pulse');
          setTimeout(() => element.classList.remove('error-pulse'), 4000);
        }
      }
    }, 100);
  };

  const validateStep = (stepNumber: number): boolean => {
    setValidationErrors({});
    return true;
  };

  const canMoveToNext = () => {
    return true;
  };

  const handleSendOTP = async () => {
    if (!formData.personalDetails.email) {
      addToast({ type: 'error', title: 'Email Required', message: 'Please enter your email address first.' });
      return;
    }
    setIsSendingOtp(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.personalDetails.email })
      });
      if (res.ok) {
        setOtpSent(true);
        setCountdown(30); // 30-second cooldown as requested
        setOtp('');
        addToast({ type: 'success', title: 'OTP Sent', message: 'Verification code sent to your email.' });
      } else {
        const errData = await res.json().catch(() => ({}));
        setOtpError(errData.error || 'Failed to send OTP. Please try again.');
      }
    } catch (e) {
      setOtpError('Network error. Failed to send OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      setOtpError('Please enter the complete 6-digit code.');
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError('');
    setShouldShake(false);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.personalDetails.email, otp })
      });
      if (res.ok) {
        setOtpVerified(true);
        addToast({ type: 'success', title: 'Identity Verified', message: 'Email verified successfully.' });
      } else {
        const errData = await res.json().catch(() => ({}));
        setOtpError(errData.error || 'Invalid OTP code. Please check and retry.');
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
      }
    } catch (e) {
      setOtpError('Network error. Verification failed.');
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
    } finally {
      setIsVerifyingOtp(false);
    }
  };


  const triggerConfetti = () => {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.backgroundColor = ['#4CAF7D', '#1B4332', '#F5C518', '#74C69D', '#D4EDDA'][Math.floor(Math.random() * 5)];
      container.appendChild(confetti);
    }
    setTimeout(() => document.body.removeChild(container), 5000);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (step < 6) {
          handleNext();
        } else {
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, formData, handleNext, handleSubmit]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#1B4332]">
        <Loader2 className="w-12 h-12 animate-spin text-white/20" />
      </div>
    );
  }

  if (appStatus && (appStatus.status === 'PENDING' || appStatus.status === 'UNDER_REVIEW')) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative font-jakarta" style={{
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
              <RotateCcw size={14} /> Return to Home
            </button>
            <button 
              onClick={async () => {
                const res = await fetch(`/api/teacher/apply${appStatus.email ? `?email=${encodeURIComponent(appStatus.email)}` : ''}`);
                if (res.ok) {
                  const data = await res.json();
                  if (data && data.status !== 'NONE') {
                    setAppStatus(data);
                    addToast({ type: 'success', title: 'Status Refreshed', message: `Current Status: ${data.status}` });
                  }
                }
              }}
              className="flex-1 h-14 bg-[#4ade80] hover:brightness-105 text-[#0B0F14] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.15)]"
            >
              Check Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appStatus && appStatus.status === 'APPROVED') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative font-jakarta" style={{
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
            onClick={() => {
              router.push('/teacher/dashboard');
            }}
            className="w-full h-14 bg-[#4ade80] hover:brightness-105 text-[#0B0F14] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(74,222,128,0.2)]"
          >
            Go to Mentor Dashboard <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (appStatus && appStatus.status === 'REJECTED') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 relative font-jakarta" style={{
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
              onClick={async () => {
                setIsLoading(true);
                try {
                  const res = await fetch('/api/teacher/apply/reset', { method: 'POST' });
                  if (res.ok) {
                    setAppStatus(null);
                    setStep(1);
                    addToast({ type: 'success', title: 'Application Reset', message: 'You can now revise and submit your details.' });
                  } else {
                    addToast({ type: 'error', title: 'Reset Failed', message: 'Could not restart application.' });
                  }
                } catch (e) {
                  addToast({ type: 'error', title: 'Reset Error', message: 'Could not restart application.' });
                } finally {
                  setIsLoading(false);
                }
              }}
              className="flex-1 h-14 bg-[#4ade80] hover:brightness-105 text-[#0B0F14] rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.15)]"
            >
              Revise & Reapply
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<div className="h-screen flex items-center justify-center">Something went wrong.</div>}>
      <div className="onboarding-container relative min-h-screen w-full overflow-hidden font-jakarta text-slate-900">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          .onboarding-container {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0B0F14;
            background-image: linear-gradient(rgba(11, 15, 20, 0.65), rgba(11, 15, 20, 0.95)), url('/images/teacher-apply-bg.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
            zoom: 1.1;
          }

          /* === PREMIUM INPUT FIELD === */
          .premium-input-field {
            background: #FFFFFF !important;
            border: 2px solid #CBD5E1 !important;
            color: #0F172A !important;
            font-weight: 700 !important;
            transition: all 0.3s ease;
          }
          .premium-input-field:hover {
            background: #F8FAFC !important;
            border-color: #94A3B8 !important;
          }
          .premium-input-field:focus {
            background: #FFFFFF !important;
            border-color: #22C55E !important;
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3) !important;
          }
          .premium-input-field::placeholder {
            color: #64748B !important; /* Darker placeholder on white background */
            opacity: 0.85 !important;
          }

          /* === Chrome/Safari AutoFill Fix === */
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active,
          textarea:-webkit-autofill,
          textarea:-webkit-autofill:hover,
          textarea:-webkit-autofill:focus,
          textarea:-webkit-autofill:active,
          select:-webkit-autofill,
          select:-webkit-autofill:hover,
          select:-webkit-autofill:focus,
          select:-webkit-autofill:active {
            -webkit-text-fill-color: #0F172A !important;
            -webkit-box-shadow: 0 0 0px 1000px #FFFFFF inset !important;
            transition: background-color 5000s ease-in-out 0s;
          }

          /* === Shake Animation === */
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
          .shake-element {
            animation: shake 0.4s ease-in-out;
          }


          /* === LAYOUT === */
          .split-layout {
            position: relative; z-index: 10;
            display: flex; justify-content: center;
            min-height: 100vh; width: 100%;
          }

          /* === LEFT PANEL === */
          .left-panel {
            background: transparent;
            border-right: 1px solid rgba(255,255,255,0.03);
            padding: 3rem 2.5rem;
            display: flex; flex-direction: column; justify-content: space-between;
            position: sticky; top: 0; height: 100vh; overflow: hidden;
          }

          .left-brand-tag {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 4px 0;
            font-size: 12px; font-weight: 600; color: #4ade80;
            letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 2rem;
          }

          .left-title {
            font-size: 2.25rem; font-weight: 800; color: #F9FAFB;
            letter-spacing: -0.5px; line-height: 1.1;
            margin-bottom: 0.75rem;
          }

          .left-subtitle {
            color: #94A3B8; font-size: 15px;
            font-weight: 500; line-height: 1.6;
          }

          .progress-bar-wrap {
            display: flex; align-items: center; gap: 0.75rem;
            margin-top: 1.5rem;
          }
          .progress-bar-bg {
            flex: 1; height: 3px; background: rgba(255,255,255,0.04);
            border-radius: 100px; overflow: hidden;
          }
          .progress-bar-fill {
            height: 100%;
            background: #4ade80;
            border-radius: 100px;
            transition: width 0.5s ease-in-out;
          }
          .progress-label {
            font-size: 11px; font-weight: 600; color: #94A3B8;
          }

          .stepper-divider {
            height: 1px; background: transparent;
            margin: 2rem 0;
          }

          /* === STEPPER === */
          .stepper-container {
            display: flex; flex-direction: column; gap: 1rem;
            position: relative; flex: 1; margin: 3rem 0;
          }

          .stepper-line {
            display: block;
            position: absolute;
            left: 1.15rem; top: 1.5rem; bottom: 1.5rem;
            width: 2px; background: rgba(255,255,255,0.04);
            z-index: 0;
          }

          .step-item {
            display: flex; align-items: center; gap: 1.25rem;
            padding: 0.25rem 0;
            transition: all 0.3s ease;
            position: relative; z-index: 1;
            border: none;
          }

          .step-item.active {
            background: transparent;
          }

          .step-dot {
            width: 2.25rem; height: 2.25rem; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            background: #0B0F14; border: 2px solid rgba(255,255,255,0.05);
            color: #64748B; transition: all 0.3s ease; flex-shrink: 0;
            z-index: 2; position: relative;
          }

          .step-item.active .step-dot {
            background: #0B0F14; border-color: #4ade80; color: #4ade80;
            box-shadow: 0 0 20px rgba(74,222,128,0.2);
          }

          .step-item.completed .step-dot {
            background: transparent; border-color: transparent;
            color: #4ade80;
          }

          .step-label-main {
            font-size: 1.125rem; font-weight: 600; color: #64748B;
            transition: color 0.3s ease; line-height: 1.3;
          }
          .step-item.active .step-label-main { color: #F9FAFB; font-weight: 700; text-shadow: 0 0 10px rgba(255,255,255,0.1); }
          .step-item.completed .step-label-main { color: #94A3B8; font-weight: 600; }

          .step-label-sub {
            font-size: 0.875rem; font-weight: 500; color: #475569;
            transition: color 0.3s ease; line-height: 1.4; margin-top: 2px;
          }
          .step-item.active .step-label-sub { color: #94A3B8; }
          .step-item.completed .step-label-sub { color: #64748B; }

          .left-footer {
            padding-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.03);
          }
          .left-footer-txt {
            font-size: 14px; font-weight: 500;
            color: #64748B; line-height: 1.5;
          }

          /* === MOBILE STEP BAR (hidden by default) === */
          .mobile-step-bar { display: none; }

          /* === RIGHT PANEL === */
          .right-panel {
            display: flex; flex-direction: column; align-items: center;
            padding: 0; background: transparent;
          }
          
          .right-panel-scroll {
            width: 100%; display: flex; justify-content: center;
            padding: 4rem 2rem 6rem;
          }

          /* === PREMIUM MAIN FORM CONTAINER === */
          .premium-form-container {
            background: transparent;
            border: none;
            padding: 0;
            width: 100%;
            max-width: 100%;
            box-shadow: none;
            animation: card-fade-in 0.5s cubic-bezier(0.16,1,0.3,1);
          }

          @keyframes card-fade-in {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* === BUTTONS === */
          .btn-glow {
            background: #4ade80; color: #0B0F14;
            padding: 0.875rem 2rem; border-radius: 12px;
            font-weight: 600; font-size: 0.875rem;
            transition: all 0.2s ease; border: none; cursor: pointer;
            display: flex; align-items: center; gap: 0.5rem;
            box-shadow: 0 4px 12px rgba(74,222,128,0.15);
          }

          .btn-glow:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(74,222,128,0.25);
            filter: brightness(1.05);
          }

          /* ===== RESPONSIVE BREAKPOINTS ===== */
          @media (max-width: 1280px) {
            .premium-form-container { padding: 2.5rem; }
          }
          @media (max-width: 1100px) {
            .mobile-step-bar { display: flex; }
            .right-panel-scroll { padding: 3rem 1.5rem; }
          }
          @media (max-width: 768px) {
            .right-panel-scroll { padding: 2rem 1rem; }
            .premium-form-container { padding: 1.5rem; border-radius: 16px; }
          }
        `}</style>

        <div className="min-h-screen w-full backdrop-blur-[12px] bg-[#0B0F14]/20">
          <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-16 xl:px-24 pt-[140px] pb-24 flex flex-col min-h-screen">
          {/* Centered Stepper */}
          <div className="hidden lg:block w-full max-w-[800px] mx-auto mb-16">
            <div className="flex items-center justify-between">
              {STEPS.map((s, idx) => {
                const isActive = step === s.id;
                const isCompleted = step > s.id;
                return (
                  <React.Fragment key={s.id}>
                    <button
                      onClick={() => {
                        if (s.id <= step) setStep(s.id);
                      }}
                      disabled={s.id > step}
                      className="flex flex-col items-center gap-2 relative z-10 cursor-pointer disabled:cursor-not-allowed group focus:outline-none bg-transparent border-none p-0"
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center text-[18px] font-bold transition-all duration-300",
                        isActive ? "bg-[#4ade80] text-[#0B0F14] shadow-[0_0_20px_rgba(74,222,128,0.4)] scale-110" : isCompleted ? "bg-[#4ade80]/20 text-[#4ade80] hover:bg-[#4ade80]/30 hover:scale-105" : "bg-white/[0.03] border border-white/5 text-[#64748B]"
                      )}>
                        {isCompleted ? <CheckCircle2 size={24} /> : s.id}
                      </div>
                      <span className={cn("text-[18px] font-bold tracking-wide transition-colors whitespace-nowrap absolute -bottom-9", isActive || isCompleted ? "text-[#4ade80]" : "text-[#64748B]/70 group-hover:text-[#64748B]")}>{s.title}</span>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div className="flex-1 h-[2px] bg-white/[0.04] rounded-full mx-4 mt-[-1.75rem] overflow-hidden">
                        <div className="h-full bg-[#4ade80] transition-all duration-500" style={{ width: isCompleted ? '100%' : '0%' }} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="w-full flex-1 flex justify-center">
            <motion.div className="w-full premium-form-container">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {step === 1 && <PersonalStepRedesign 
                    data={formData.personalDetails} 
                    profData={formData.professionalDetails}
                    update={(d: any) => setFormData(prev => ({ ...prev, personalDetails: d }))} 
                    updateProf={(d: any) => setFormData(prev => ({ ...prev, professionalDetails: d }))}
                    errors={validationErrors} 
                    handleSendOTP={handleSendOTP} handleVerifyOTP={handleVerifyOTP} 
                    otpSent={otpSent} otpVerified={otpVerified} otp={otp} setOtp={setOtp} 
                    isSendingOtp={isSendingOtp} isVerifyingOtp={isVerifyingOtp} countdown={countdown}
                    otpError={otpError} setOtpError={setOtpError}
                    shouldShake={shouldShake} setShouldShake={setShouldShake}
                    resetOTP={resetOTP}
                  />}

                  {step === 2 && <ProfessionalStepRedesign data={formData.professionalDetails} update={(d: any) => setFormData(prev => ({ ...prev, professionalDetails: d }))} errors={validationErrors} />}
                  {step === 3 && (
                    <EducationStepRedesign 
                      data={formData.educationDetails} 
                      update={(d: any) => setFormData(prev => ({ ...prev, educationDetails: d }))} 
                      credentialsData={formData.credentialsDetails}
                      updateCreds={(creds: any) => setFormData(prev => ({ ...prev, credentialsDetails: creds }))}
                      documents={formData.documents}
                      updateDocs={(docs: any) => setFormData(prev => ({ ...prev, documents: docs }))}
                      errors={validationErrors} 
                    />
                  )}
                  {step === 4 && (
                    <TeachingStepRedesign 
                      data={formData.teachingDetails} 
                      update={(d: any) => setFormData(prev => ({ ...prev, teachingDetails: d }))} 
                      documents={formData.documents}
                      updateDocs={(docs: any) => setFormData(prev => ({ ...prev, documents: docs }))}
                      errors={validationErrors} 
                    />
                  )}
                  {step === 5 && <AvailabilityStepRedesign data={formData.availabilityDetails} update={(d: any) => setFormData(prev => ({ ...prev, availabilityDetails: d }))} errors={validationErrors} />}
                  {step === 6 && (
                    <ReviewStepRedesign 
                      data={formData} 
                      update={setFormData} 
                      setStep={setStep}
                      handleSubmit={handleSubmit} 
                      isSubmitting={isSubmitting} 
                      errors={validationErrors} 
                    />
                  )}
                  
                  {/* Navigation */}
                  <div className="flex justify-end items-center pt-8 border-t border-white/[0.04] mt-12 gap-8">
                    {step > 1 && (
                       <button onClick={handleBack} className="text-[#94A3B8] font-bold text-[13px] flex items-center gap-2 hover:text-[#F9FAFB] transition-colors mr-auto">
                         <ArrowLeft size={16} /> Back
                       </button>
                    )}
                    
                    {/* Auto save indicator */}
                    <div className="flex items-center gap-2 text-xs font-semibold mr-4 select-none">
                      {draftSaveStatus === 'saving' && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-amber-400">Saving draft...</span>
                        </>
                      )}
                      {draftSaveStatus === 'saved' && (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                          <span className="text-green-400">Auto-saved!</span>
                        </>
                      )}
                      {draftSaveStatus === 'failed' && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          <span className="text-red-400">Auto-save failed</span>
                        </>
                      )}
                    </div>

                    <button onClick={() => saveDraft(formData, step)} className="text-[#4ade80] font-semibold text-[14px] flex items-center gap-2 hover:brightness-110 transition-all bg-transparent mr-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                      Save Draft
                    </button>
                    
                    {step < 6 ? (
                      <button onClick={handleNext} className="bg-[#4ade80] text-[#0B0F14] px-8 py-3.5 rounded-[12px] font-bold text-[15px] flex items-center gap-2 hover:brightness-110 hover:shadow-[0_4px_20px_rgba(74,222,128,0.3)] transition-all">
                        Continue <ArrowRight size={18} />
                      </button>
                    ) : (
                      <button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#4ade80] text-[#0B0F14] px-8 py-3.5 rounded-[12px] font-bold text-[15px] flex items-center gap-2 hover:brightness-110 hover:shadow-[0_4px_20px_rgba(74,222,128,0.3)] transition-all">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <>Finalize Application <ShieldCheck size={18} /></>}
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
}

/* --- REDESIGNED SUB-COMPONENTS --- */

function PremiumInput({ id, label, value, onChange, onBlur, placeholder, error, type = "text" }: any) {
  const isOptional = label.includes('(Optional)');
  const baseLabel = label.replace('(Optional)', '').trim();
  const fieldId = id || `field-${baseLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="flex flex-col gap-3 w-full" id={fieldId}>
      <label className="text-[22px] font-extrabold text-[#FFFFFF] ml-1 block tracking-wide flex items-center gap-2">
        {baseLabel} {isOptional ? <span className="text-[#4ade80] font-bold text-[18px]">(Optional)</span> : <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          "w-full h-[80px] px-6 rounded-[16px] premium-input-field outline-none transition-all text-[#0F172A] text-[22px] font-bold placeholder-[#64748B]",
          error && "border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
        )}
      />
      {error && <p className="text-[16px] font-bold text-red-400 mt-1 ml-1">{error}</p>}
    </div>
  );
}


/* --- 6-Box OTP Input Component --- */
function OtpBoxInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const r0 = useRef<HTMLInputElement>(null);
  const r1 = useRef<HTMLInputElement>(null);
  const r2 = useRef<HTMLInputElement>(null);
  const r3 = useRef<HTMLInputElement>(null);
  const r4 = useRef<HTMLInputElement>(null);
  const r5 = useRef<HTMLInputElement>(null);
  const refs = [r0, r1, r2, r3, r4, r5];
  const digits = (value + '      ').slice(0, 6).split('');

  const handleChange = (i: number, raw: string) => {
    if (disabled) return;
    const ch = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = ch;
    onChange(next.join('').trimEnd());
    if (ch && i < 5) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Backspace') {
      if (!digits[i].trim() && i > 0) {
        const next = [...digits]; next[i - 1] = ' ';
        onChange(next.join('').trimEnd());
        refs[i - 1].current?.focus();
      } else {
        const next = [...digits]; next[i] = ' ';
        onChange(next.join('').trimEnd());
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };

  return (
    <div className="flex gap-2 w-full justify-between">
      {refs.map((ref, i) => (
        <input
          key={i}
          ref={ref}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[i].trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={cn(
            "w-12 h-14 bg-[#0A0E18]/72 border border-white/5 text-[#F9FAFB] rounded-xl text-center text-xl font-bold outline-none hover:border-white/10 focus:border-[#4ade80]/40 focus:ring-1 focus:ring-[#4ade80]/20 transition-all",
            disabled && "opacity-60 cursor-not-allowed border-[#4ade80]/30 text-[#4ade80]"
          )}
        />
      ))}
    </div>
  );
}


function GlassmorphicFileUpload({ label, value, onChange, accept, type, email, required, error }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    
    if (file.size > maxSize) {
      setUploadError(`File too large. Max size is ${isVideo ? '50MB' : '5MB'}`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (email) formData.append('email', email);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload/teacher-docs', true);
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          onChange(response.url);
          setIsUploading(false);
        } catch (e) {
          setUploadError('Invalid response from server');
          setIsUploading(false);
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          setUploadError(response.error || 'Upload failed');
        } catch (e) {
          setUploadError('Upload failed');
        }
        setIsUploading(false);
      }
    };

    xhr.onerror = () => {
      setUploadError('Network error');
      setIsUploading(false);
    };

    setIsUploading(true);
    setUploadError('');
    setProgress(0);
    xhr.send(formData);
  };

  const removeFile = () => {
    onChange('');
    setProgress(0);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileName = (url: string) => {
    if (!url) return '';
    const parts = url.split('/');
    const last = parts[parts.length - 1];
    return last.split('_').slice(1).join('_') || last; // remove prepended id
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide flex items-center gap-2">
        {label} {required ? <span className="text-red-500">*</span> : <span className="text-[#4ade80] font-medium text-[16px]">(Optional)</span>}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && !value && fileInputRef.current?.click()}
        className={cn(
          "relative min-h-[160px] rounded-[16px] border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all cursor-pointer",
          isDragging ? "border-[#4ade80] bg-[#4ade80]/5" : "border-white/10 bg-[#161B22] hover:bg-[#1C2128] hover:border-white/20",
          value && "border-solid border-[#4ade80]/30 bg-[#161B22]",
          (error || uploadError) && "border-red-900/50 bg-[#161B22]"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="w-full space-y-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#4ade80] mx-auto" />
            <p className="text-[15px] font-semibold text-[#94A3B8]">Uploading your file ({progress}%)</p>
            <div className="w-full max-w-[240px] mx-auto h-[4px] bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#4ade80] transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : value ? (
          <div className="w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-[#4ade80]/15 flex items-center justify-center text-[#4ade80] shrink-0 border border-[#4ade80]/20">
                {type.includes('video') ? <Video size={22} /> : <FileText size={22} />}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-[#F9FAFB] truncate max-w-[250px] sm:max-w-[400px]">
                  {getFileName(value)}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-bold text-[#4ade80] uppercase tracking-wider bg-[#4ade80]/15 px-2 py-0.5 rounded border border-[#4ade80]/20">
                    Uploaded ✓
                  </span>
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[12px] font-semibold text-[#94A3B8] hover:text-[#F9FAFB] transition-colors flex items-center gap-1"
                  >
                    View File <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="p-3 rounded-xl bg-white/5 text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 border border-white/5"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-[#64748B] mx-auto">
              <Upload size={22} />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-[#F9FAFB]">
                Drag and drop your file here, or <span className="text-[#4ade80] hover:underline">browse</span>
              </p>
              <p className="text-[13px] font-medium text-[#64748B] mt-1.5">
                Supports PDF, images, or video depending on field (Max size {type.includes('video') ? '50MB' : '5MB'})
              </p>
            </div>
          </div>
        )}
      </div>
      {(error || uploadError) && (
        <p className="text-[14px] font-medium text-red-400 mt-1 ml-1">{error || uploadError}</p>
      )}
    </div>
  );
}

/* --- STEP 1: Personal Details with 3-State Email Verification --- */
function PersonalStepRedesign({ data, profData, update, updateProf, errors, handleSendOTP, handleVerifyOTP, otpSent, otpVerified, otp, setOtp, isSendingOtp, isVerifyingOtp, countdown, otpError, setOtpError, shouldShake, setShouldShake, resetOTP }: any) {

  const renderVerification = () => {
    // STATE 3: Verified ✓
    if (otpVerified) {
      return (
        <motion.div
          key="verified"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-5 rounded-2xl bg-[#4ade80]/5 border border-[#4ade80]/15 flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30 shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest">Verified Email</p>
              <p className="text-sm font-bold text-white">{data.email}</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-[#4ade80]/15 border border-[#4ade80]/30 rounded-xl text-[#4ade80] text-xs font-bold uppercase tracking-wider">
            Email Verified Successfully ✓
          </span>
        </motion.div>
      );
    }

    // STATE 1: Email Input
    if (!otpSent) {
      return (
        <motion.div
          key="email-input"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <div className="flex items-center gap-3 flex-1 h-[80px] px-6 rounded-[16px] premium-input-field outline-none transition-all min-w-0">
            <Mail size={24} className="text-[#0F172A] shrink-0" />
            <input
              type="email"
              placeholder="Enter your email address"
              value={data.email}
              onChange={(e: any) => update({ ...data, email: e.target.value })}
              className="flex-1 bg-transparent outline-none text-[#0F172A] text-[22px] font-bold placeholder-[#64748B] min-w-0"
            />
          </div>
          <button
            onClick={handleSendOTP}
            disabled={isSendingOtp || !data.email}
            className="h-[80px] px-8 bg-transparent border border-[#4ade80]/60 text-[#4ade80] hover:bg-[#4ade80]/10 rounded-[16px] text-base font-extrabold tracking-wider hover:shadow-[0_0_15px_rgba(74,222,128,0.1)] transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
          >
            {isSendingOtp ? (
              <><Loader2 size={16} className="animate-spin" /> SENDING...</>
            ) : (
              'SEND OTP'
            )}
          </button>
        </motion.div>
      );
    }

    // STATE 2: OTP Entry
    return (
      <motion.div
        key="otp-entry"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className={cn("space-y-4 p-6 rounded-2xl bg-[#0A0E18]/30 border border-white/5 w-full", shouldShake && "shake-element")}
      >
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-[#94A3B8]">
            We sent a verification code to <span className="text-white font-bold">{data.email}</span>
          </p>
          <button 
            onClick={resetOTP}
            className="text-[12px] font-bold text-[#4ade80] hover:underline uppercase tracking-wider"
          >
            Change Email
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:max-w-[320px]">
            <OtpBoxInput value={otp} onChange={setOtp} disabled={isVerifyingOtp} />
          </div>
          <button
            onClick={handleVerifyOTP}
            disabled={isVerifyingOtp || otp.length < 6}
            className="h-14 w-full sm:w-auto px-8 bg-[#4ade80] text-[#0B0F14] hover:shadow-[0_0_20px_rgba(74,222,128,0.3)] rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
          >
            {isVerifyingOtp ? (
              <><Loader2 size={14} className="animate-spin" /> VERIFYING...</>
            ) : (
              'VERIFY OTP'
            )}
          </button>
        </div>

        {otpError && (
          <p className="text-sm font-medium text-red-400 mt-2 flex items-center gap-1.5">
            <AlertCircle size={14} /> {otpError}
          </p>
        )}

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs font-semibold text-[#64748B]">Didn&apos;t receive code?</span>
          {countdown > 0 ? (
            <span className="text-xs font-bold text-[#64748B]">
              Resend OTP in 0:{String(countdown).padStart(2, '0')}
            </span>
          ) : (
            <button 
              onClick={handleSendOTP} 
              disabled={isSendingOtp}
              className="text-xs font-black text-[#4ade80] hover:underline uppercase tracking-wider"
            >
              {isSendingOtp ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
      {/* LEFT COLUMN: Upload Card */}
      <div className="w-full lg:w-[32%] xl:w-[400px] shrink-0 flex flex-col gap-8">
        <PhotoUpload
          value={data.profilePhotoUrl}
          email={data.email}
          onChange={(url: string) => update({ ...data, profilePhotoUrl: url })}
          compact={true}
        />
        <div className="bg-white/[0.04] border border-white/10 rounded-[16px] p-5 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-[#4ade80]" />
           <h4 className="text-[14px] font-bold text-[#4ade80] tracking-wide mb-1.5">Why it matters?</h4>
           <p className="text-[12px] text-[#94A3B8] leading-relaxed font-medium">A clear profile picture and strong identity increases your visibility and trust.</p>
        </div>
      </div>

      {/* RIGHT COLUMN: Heading + Form */}
      <div className="flex-1 min-w-0 w-full flex flex-col gap-8">
        <div className="min-w-0">
          <h2 className="text-[64px] font-extrabold text-[#F9FAFB] tracking-tight leading-tight">Your Identity</h2>
          <p className="text-[#94A3B8] text-[20px] mt-4 font-medium opacity-90">Basic credentials and contact sync. This helps students and organizations trust your profile.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 xl:gap-x-16 gap-y-10">
          <PremiumInput label="Full Name" value={data.fullName} onChange={(e: any) => update({ ...data, fullName: e.target.value })} error={errors.fullName} />
          <PremiumInput label="City" placeholder="Enter your city" value={data.city} onChange={(e: any) => update({ ...data, city: e.target.value })} error={errors.city} />
        <div className="flex flex-col gap-3 w-full relative">
          <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide flex items-center gap-2">
            Country <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <select
              className="w-full h-[68px] px-6 rounded-[16px] premium-input-field outline-none transition-all text-[#0F172A] text-[18px] appearance-none cursor-pointer"
              value={data.country}
              onChange={(e) => update({ ...data, country: e.target.value })}
            >
              <option value="" className="bg-white text-slate-800">Select Country</option>
              <option value="India" className="bg-white text-slate-800">India</option>
              <option value="USA" className="bg-white text-slate-800">USA</option>
            </select>
            <ChevronDown className="absolute right-5 pointer-events-none text-slate-600 w-5 h-5" />
          </div>
          {errors.country && <p className="text-[12px] font-medium text-red-400 mt-1 ml-1">{errors.country}</p>}
        </div>
        <div className="flex flex-col gap-3 w-full relative">
          <label className="text-[22px] font-extrabold text-[#FFFFFF] ml-1 block tracking-wide flex items-center gap-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 flex items-center gap-2 pl-4 pr-3 py-2 border-r border-slate-300">
              <span className="text-[24px]">🇮🇳</span>
              <span className="text-[22px] font-bold text-[#0F172A]">+91</span>
              <ChevronDown className="w-5 h-5 text-slate-500 ml-1" />
            </div>
            <input type="tel" placeholder="Enter your phone number" value={data.phone} onChange={(e) => update({ ...data, phone: e.target.value })} className={cn("w-full h-[80px] pl-38 pr-6 rounded-[16px] premium-input-field outline-none transition-all text-[22px] font-bold placeholder-[#64748B]", errors.phone && "border-red-500/40")} />
          </div>
          {errors.phone && <p className="text-[12px] font-medium text-red-400 mt-1 ml-1">{errors.phone}</p>}
        </div>
        <PremiumInput label="Professional Headline" placeholder="e.g. AI Engineer & Full Stack Mentor" value={profData.headline} onChange={(e: any) => updateProf({ ...profData, headline: e.target.value })} error={errors.headline} />
        <PremiumInput 
          label="LinkedIn Profile URL" 
          placeholder="https://linkedin.com/in/username" 
          value={data.linkedinUrl} 
          onChange={(e: any) => update({ ...data, linkedinUrl: e.target.value })} 
          onBlur={(e: any) => {
            let val = e.target.value.trim();
            if (val && !val.includes('linkedin.com') && !val.startsWith('http://') && !val.startsWith('https://')) {
              if (val.startsWith('in/')) {
                val = `https://www.linkedin.com/${val}`;
              } else if (val.startsWith('/')) {
                val = `https://www.linkedin.com/in${val}`;
              } else {
                val = `https://www.linkedin.com/in/${val}`;
              }
              update({ ...data, linkedinUrl: val });
            }
          }}
          error={errors.linkedinUrl} 
        />
        <PremiumInput 
          label="GitHub / Portfolio Link (Optional)" 
          placeholder="https://github.com/username" 
          value={data.githubUrl} 
          onChange={(e: any) => update({ ...data, githubUrl: e.target.value })} 
          onBlur={(e: any) => {
            let val = e.target.value.trim();
            if (val && !val.includes('github.com') && !val.startsWith('http://') && !val.startsWith('https://')) {
              val = `https://github.com/${val}`;
              update({ ...data, githubUrl: val });
            }
          }}
          error={errors.githubUrl} 
        />
        <PremiumInput 
          label="Personal Website (Optional)" 
          placeholder="https://yourwebsite.com" 
          value={data.personalWebsite} 
          onChange={(e: any) => update({ ...data, personalWebsite: e.target.value })} 
          onBlur={(e: any) => {
            let val = e.target.value.trim();
            if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
              val = `https://${val}`;
              update({ ...data, personalWebsite: val });
            }
          }}
          error={errors.personalWebsite} 
        />
      </div>

      <div className="space-y-3 mt-8">
        <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide flex items-center gap-2">
          Short Bio <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            className={cn(
              "w-full min-h-[160px] p-6 rounded-[16px] premium-input-field outline-none transition-all text-[#F9FAFB] text-[18px] placeholder-[#64748B] resize-none",
              errors.shortBio && "border-red-500/40"
            )}
            placeholder="A short introduction about yourself (min 20 characters)..."
            value={profData.bio}
            onChange={(e) => {
              const val = e.target.value;
              // Sync bio to both professionalDetails.bio AND personalDetails.shortBio
              updateProf({ ...profData, bio: val });
              update({ ...data, shortBio: val });
            }}
          />
          <span className={cn(
            "absolute bottom-4 right-4 text-[11px] font-bold",
            profData.bio.length < 20 ? "text-red-400" : "text-[#4ade80]"
          )}>{profData.bio.length}/200</span>
        </div>
        {errors.shortBio && <p className="text-[12px] font-medium text-red-400 mt-1 ml-1">{errors.shortBio}</p>}
      </div>


      {/* 3-State Verification Panel */}
      <div className={cn(
        'py-6 rounded-none transition-all duration-500 bg-transparent mt-8'
      )}>
        <div className="flex items-center gap-4 mb-5">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300',
            otpVerified
              ? 'text-[#4ade80] bg-[#4ade80]/10'
              : 'text-[#94A3B8] bg-slate-800'
          )}>
            {otpVerified ? <CheckCircle2 size={16} /> : otpSent ? <Shield size={16} /> : <Mail size={16} />}
          </div>
          <p className="text-[14px] font-medium text-[#64748B] tracking-wide">
            {otpVerified ? 'Identity Verified' : otpSent ? 'Enter Verification Code' : 'Email Verification Required'}
          </p>
        </div>
        <AnimatePresence mode="wait">
          {renderVerification()}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}

function ProfessionalStepRedesign({ data, update, errors }: any) {
  return (
    <div className="space-y-12">
      <div className="mb-12">
        <h2 className="text-[64px] font-extrabold text-[#F9FAFB] tracking-tight leading-tight">Professional Expertise</h2>
        <p className="text-[#94A3B8] text-[20px] font-medium mt-4 opacity-90">We match instructors based on specialization.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 xl:gap-x-16 gap-y-10">
        <PremiumInput label="Current Role" placeholder="e.g. Senior Frontend Engineer" value={data.currentRole} onChange={(e: any) => update({ ...data, currentRole: e.target.value })} error={errors.currentRole} />
        <PremiumInput label="Current Company" placeholder="e.g. Google, Stripe, Meta" value={data.currentCompany} onChange={(e: any) => update({ ...data, currentCompany: e.target.value })} error={errors.currentCompany} />
        
        <PremiumInput label="Primary Domain" placeholder="e.g. Artificial Intelligence, Web Dev" value={data.primaryDomain} onChange={(e: any) => update({ ...data, primaryDomain: e.target.value })} error={errors.primaryDomain} />
        <PremiumInput label="Top Tools & Technologies" placeholder="React, Python, AWS..." value={data.toolsMastery} onChange={(e: any) => update({ ...data, toolsMastery: e.target.value })} error={errors.toolsMastery} />
        <PremiumInput label="Key Skills (comma separated)" placeholder="System Design, Machine Learning..." value={data.skills?.join(', ')} onChange={(e: any) => update({ ...data, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} error={errors.skills} />
        
        <PremiumInput label="Years of Industry Experience" type="number" placeholder="e.g. 5" value={data.yearsOfExperience} onChange={(e: any) => update({ ...data, yearsOfExperience: e.target.value })} error={errors.yearsOfExperience} />
        <PremiumInput label="Years of Teaching Experience" type="number" placeholder="e.g. 2" value={data.teachingExperience} onChange={(e: any) => update({ ...data, teachingExperience: e.target.value })} error={errors.teachingExperience} />
        
        <PremiumInput label="Languages Known" placeholder="English, Hindi, Spanish" value={data.languagesKnown} onChange={(e: any) => update({ ...data, languagesKnown: e.target.value })} error={errors.languagesKnown} />
      </div>

      <div className="space-y-2">
        <label className="text-[14px] font-medium text-[#94A3B8] ml-1 block tracking-wide">Preferred Session Types</label>
        <div className="flex flex-wrap gap-3 pt-2">
          {['Workshops', 'Bootcamps', 'Seminars', '1:1 Mentorship', 'Corporate Training'].map(type => (
            <button key={type} type="button" onClick={() => {
              const n = data.preferredSessionType?.includes(type) ? data.preferredSessionType.filter((x: any) => x !== type) : [...(data.preferredSessionType||[]), type];
              update({ ...data, preferredSessionType: n });
            }} className={cn("px-5 py-2.5 rounded-full font-medium text-[14px] transition-all", data.preferredSessionType?.includes(type) ? "bg-[#4ade80] text-[#0B0F14]" : "bg-white/[0.02] text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F9FAFB]")}>
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EducationStepRedesign({ data, update, credentialsData, updateCreds, documents, updateDocs, errors }: any) {
  const creds = credentialsData || {};

  return (
    <div className="space-y-12">
      <div className="mb-12">
        <h2 className="text-[64px] font-extrabold text-[#F9FAFB] tracking-tight leading-tight">Credentials & Background</h2>
        <p className="text-[#94A3B8] text-[20px] font-medium mt-4 opacity-90">Verify your academic history and professional credibility.</p>
      </div>

      <div className="p-8 bg-[#161B22]/50 border border-white/[0.04] rounded-[24px] space-y-8">
        <h3 className="text-[20px] font-semibold text-[#F9FAFB]">Highest Qualification</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 xl:gap-x-16 gap-y-10">
          <PremiumInput 
            label="Highest Qualification" 
            placeholder="e.g. Master of Business Administration" 
            value={creds.highestQualification || ''} 
            onChange={(e: any) => updateCreds({ ...creds, highestQualification: e.target.value })} 
            error={errors.highestQualification} 
          />
          <PremiumInput 
            label="Institution / University" 
            placeholder="e.g. Harvard University" 
            value={data[0]?.institution || ''} 
            onChange={(e: any) => { 
              const n = [...data]; 
              if(!n[0]) n[0] = { institution: '', degree: '', fieldOfStudy: '', graduationYear: '' };
              n[0].institution = e.target.value; 
              update(n); 
            }} 
            error={errors.institution}
          />
          <PremiumInput 
            label="Degree & Major" 
            placeholder="e.g. B.Sc. in Computer Science" 
            value={data[0]?.degree || ''} 
            onChange={(e: any) => { 
              const n = [...data]; 
              if(!n[0]) n[0] = { institution: '', degree: '', fieldOfStudy: '', graduationYear: '' };
              n[0].degree = e.target.value; 
              update(n); 
            }} 
            error={errors.degree}
          />
          <PremiumInput 
            label="Graduation Year" 
            placeholder="e.g. 2020" 
            value={data[0]?.graduationYear || ''} 
            onChange={(e: any) => { 
              const n = [...data]; 
              if(!n[0]) n[0] = { institution: '', degree: '', fieldOfStudy: '', graduationYear: '' };
              n[0].graduationYear = e.target.value; 
              update(n); 
            }} 
            error={errors.graduationYear}
          />
        </div>
      </div>

      <div className="p-8 bg-[#161B22]/50 border border-white/[0.04] rounded-[24px] space-y-8">
        <h3 className="text-[20px] font-semibold text-[#F9FAFB]">Verification Documents</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassmorphicFileUpload
            label="Resume / CV (PDF format)"
            value={documents.resumeUrl || ''}
            onChange={(url: string) => updateDocs({ ...documents, resumeUrl: url })}
            accept="application/pdf"
            type="RESUME"
            required={true}
            error={errors.resumeUrl}
          />
          <GlassmorphicFileUpload
            label="Highest Degree Certificate (PDF / Image)"
            value={documents.degreeUrl || ''}
            onChange={(url: string) => updateDocs({ ...documents, degreeUrl: url })}
            accept="application/pdf,image/*"
            type="DEGREE"
            required={false}
            error={errors.degreeUrl}
          />
        </div>
      </div>

      <div className="p-8 bg-[#161B22]/50 border border-white/[0.04] rounded-[24px] space-y-8">
        <h3 className="text-[20px] font-semibold text-[#F9FAFB]">Achievements & Publications</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 xl:gap-x-16 gap-y-10">
          <PremiumInput 
            label="Professional Certifications (Optional)" 
            placeholder="e.g. AWS Certified Solutions Architect, CA" 
            value={creds.certifications ? (Array.isArray(creds.certifications) ? creds.certifications.join(', ') : creds.certifications) : ''} 
            onChange={(e: any) => updateCreds({ ...creds, certifications: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} 
          />
          <PremiumInput 
            label="Awards & Achievements (Optional)" 
            placeholder="e.g. Winner of Google AI Challenge, Top 5% in University" 
            value={creds.awards || ''} 
            onChange={(e: any) => updateCreds({ ...creds, awards: e.target.value })} 
          />
          <PremiumInput 
            label="Hackathons & Competitions (Optional)" 
            placeholder="e.g. Smart India Hackathon 2025 finalist" 
            value={creds.hackathonsParticipated || ''} 
            onChange={(e: any) => updateCreds({ ...creds, hackathonsParticipated: e.target.value })} 
          />
          <PremiumInput 
            label="Research Papers / Publications (Optional)" 
            placeholder="e.g. Published CNN architecture analysis in IEEE" 
            value={creds.publishedResearch || ''} 
            onChange={(e: any) => updateCreds({ ...creds, publishedResearch: e.target.value })} 
          />
          <div className="lg:col-span-2">
            <PremiumInput 
              label="Open Source Contributions (Optional)" 
              placeholder="e.g. Contributed to Next.js core, maintainer of React hooks lib" 
              value={creds.openSourceContributions || ''} 
              onChange={(e: any) => updateCreds({ ...creds, openSourceContributions: e.target.value })} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TeachingStepRedesign({ data, update, documents, updateDocs, errors }: any) {
  const toggleAudience = (level: string) => {
    const arr = data.audiencePreference || [];
    const next = arr.includes(level) ? arr.filter((x: any) => x !== level) : [...arr, level];
    update({ ...data, audiencePreference: next });
  };

  const toggleLanguage = (lang: string) => {
    const arr = data.sessionLanguage || [];
    const next = arr.includes(lang) ? arr.filter((x: any) => x !== lang) : [...arr, lang];
    update({ ...data, sessionLanguage: next });
  };

  return (
    <div className="space-y-12">
      <div className="mb-12">
        <h2 className="text-[64px] font-extrabold text-[#F9FAFB] tracking-tight leading-tight">Teaching Capability</h2>
        <p className="text-[#94A3B8] text-[20px] font-medium mt-4 opacity-90">Verify your instruction pedagogy, interactive methods, and presentation formats.</p>
      </div>

      <div className="p-8 bg-[#161B22]/50 border border-white/[0.04] rounded-[24px] space-y-8">
        <h3 className="text-[20px] font-semibold text-[#F9FAFB]">Instruction Settings</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 xl:gap-x-16 gap-y-10">
          <PremiumInput 
            label="Subjects / Topics to Teach" 
            placeholder="e.g. Advanced Python, System Design, React" 
            value={data.subjects ? (Array.isArray(data.subjects) ? data.subjects.join(', ') : data.subjects) : ''} 
            onChange={(e: any) => update({ ...data, subjects: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} 
            error={errors.subjects} 
          />

          <div className="flex flex-col gap-3 w-full">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Teaching Style</label>
            <div className="relative">
              <select
                className="w-full h-[68px] px-6 rounded-[16px] premium-input-field outline-none transition-all text-[#F9FAFB] text-[18px] appearance-none cursor-pointer"
                value={data.teachingStyle || ''}
                onChange={(e) => update({ ...data, teachingStyle: e.target.value })}
              >
                <option value="" className="bg-[#111827]">Select Style</option>
                <option value="Interactive & Live Coding" className="bg-[#111827]">Interactive & Live Coding</option>
                <option value="Structured & Lecture-Based" className="bg-[#111827]">Structured & Lecture-Based</option>
                <option value="Project-Based & Practical" className="bg-[#111827]">Project-Based & Practical</option>
                <option value="Socratic & Question-Driven" className="bg-[#111827]">Socratic & Question-Driven</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B] w-5 h-5" />
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Communication Style</label>
            <div className="relative">
              <select
                className="w-full h-[68px] px-6 rounded-[16px] premium-input-field outline-none transition-all text-[#F9FAFB] text-[18px] appearance-none cursor-pointer"
                value={data.communicationStyle || ''}
                onChange={(e) => update({ ...data, communicationStyle: e.target.value })}
              >
                <option value="" className="bg-[#111827]">Select Style</option>
                <option value="Highly Energetic & Motivational" className="bg-[#111827]">Highly Energetic & Motivational</option>
                <option value="Conversational & Friendly" className="bg-[#111827]">Conversational & Friendly</option>
                <option value="Formal & Academic" className="bg-[#111827]">Formal & Academic</option>
                <option value="Calm & Methodical" className="bg-[#111827]">Calm & Methodical</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B] w-5 h-5" />
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Comfortable Class Size</label>
            <div className="relative">
              <select
                className="w-full h-[68px] px-6 rounded-[16px] premium-input-field outline-none transition-all text-[#F9FAFB] text-[18px] appearance-none cursor-pointer"
                value={data.comfortableClassSize || ''}
                onChange={(e) => update({ ...data, comfortableClassSize: e.target.value })}
              >
                <option value="" className="bg-[#111827]">Select Size</option>
                <option value="1:1 Mentorship" className="bg-[#111827]">1:1 Mentorship</option>
                <option value="Small Batches (2-10 students)" className="bg-[#111827]">Small Batches (2-10 students)</option>
                <option value="Medium Classes (10-50 students)" className="bg-[#111827]">Medium Classes (10-50 students)</option>
                <option value="Large Lectures (50+ students)" className="bg-[#111827]">Large Lectures (50+ students)</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B] w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-6">
          <div className="space-y-3">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Audience Level Preference</label>
            <div className="flex flex-wrap gap-3">
              {['Beginners', 'Teens / High School', 'College Students', 'Working Professionals'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleAudience(level)}
                  className={cn(
                    "px-6 py-3 rounded-full font-semibold text-[15px] transition-all border",
                    data.audiencePreference?.includes(level)
                      ? "bg-[#4ade80] text-[#0B0F14] border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.25)]"
                      : "bg-white/[0.02] text-[#94A3B8] border-white/5 hover:bg-white/[0.05] hover:text-[#F9FAFB]"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Languages for Teaching</label>
            <div className="flex flex-wrap gap-3">
              {['English', 'Hindi', 'Hinglish', 'Tamil', 'Spanish'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={cn(
                    "px-6 py-3 rounded-full font-semibold text-[15px] transition-all border",
                    data.sessionLanguage?.includes(lang)
                      ? "bg-[#4ade80] text-[#0B0F14] border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.25)]"
                      : "bg-white/[0.02] text-[#94A3B8] border-white/5 hover:bg-white/[0.05] hover:text-[#F9FAFB]"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-[#161B22]/50 border border-white/[0.04] rounded-[24px] space-y-8">
        <h3 className="text-[20px] font-semibold text-[#F9FAFB]">Confidence & Setup</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 xl:gap-x-16 gap-y-10">
          <div className="flex flex-col gap-3 w-full">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Public Speaking Confidence (1-5)</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => update({ ...data, publicSpeakingConfidence: val })}
                  className={cn(
                    "flex-1 h-14 rounded-xl font-bold text-lg transition-all",
                    data.publicSpeakingConfidence === val
                      ? "bg-[#4ade80] text-[#0B0F14] shadow-[0_0_15px_rgba(74,222,128,0.25)]"
                      : "bg-white/[0.02] text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F9FAFB]"
                  )}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Camera Confidence (1-5)</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => update({ ...data, cameraComfort: val })}
                  className={cn(
                    "flex-1 h-14 rounded-xl font-bold text-lg transition-all",
                    data.cameraComfort === val
                      ? "bg-[#4ade80] text-[#0B0F14] shadow-[0_0_15px_rgba(74,222,128,0.25)]"
                      : "bg-white/[0.02] text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F9FAFB]"
                  )}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6 bg-white/[0.01] p-6 rounded-2xl border border-white/5">
            <span className="text-[16px] font-semibold text-[#F9FAFB] block">Hardware Checklist</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={data.hasWebcam || false} 
                  onChange={(e) => update({ ...data, hasWebcam: e.target.checked })}
                  className="w-5 h-5 rounded-md bg-white/[0.04] border-none text-[#4ade80] focus:ring-[#4ade80]/20" 
                />
                <span className="text-[15px] font-semibold text-[#94A3B8] group-hover:text-[#F9FAFB] transition-colors">HD Webcam Available</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={data.hasMic || false} 
                  onChange={(e) => update({ ...data, hasMic: e.target.checked })}
                  className="w-5 h-5 rounded-md bg-white/[0.04] border-none text-[#4ade80] focus:ring-[#4ade80]/20" 
                />
                <span className="text-[15px] font-semibold text-[#94A3B8] group-hover:text-[#F9FAFB] transition-colors">Professional Microphone</span>
              </label>
              <div className="flex items-center gap-2">
                <PremiumInput label="Internet Speed (Mbps)" placeholder="e.g. 100" value={data.internetSpeed} onChange={(e: any) => update({ ...data, internetSpeed: e.target.value })} error={errors.internetSpeed} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-[#161B22]/50 border border-white/[0.04] rounded-[24px] space-y-8">
        <h3 className="text-[20px] font-semibold text-[#F9FAFB]">Presentation & Video Proofs</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassmorphicFileUpload
            label="Intro / Teaching Video Upload"
            value={documents.introVideoUrl || ''}
            onChange={(url: string) => updateDocs({ ...documents, introVideoUrl: url })}
            accept="video/mp4,video/quicktime"
            type="INTRO_VIDEO"
            required={false}
            error={errors.introVideoUrl}
          />
          <GlassmorphicFileUpload
            label="Sample Slide Presentation (PDF)"
            value={documents.presentationUrl || ''}
            onChange={(url: string) => updateDocs({ ...documents, presentationUrl: url })}
            accept="application/pdf"
            type="PRESENTATION"
            required={false}
            error={errors.presentationUrl}
          />
          <div className="lg:col-span-2">
            <PremiumInput 
              label="Alternative Demo Video URL (Youtube / Loom)" 
              placeholder="https://youtube.com/watch?v=..." 
              value={data.demoVideoUrl || ''} 
              onChange={(e: any) => update({ ...data, demoVideoUrl: e.target.value })} 
              error={errors.demoVideoUrl} 
            />
          </div>
        </div>
      </div>

      <div className="p-8 bg-[#161B22]/50 border border-white/[0.04] rounded-[24px] space-y-8">
        <h3 className="text-[20px] font-semibold text-[#F9FAFB]">Pedagogy Questions</h3>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 w-full">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">How do you simplify difficult concepts?</label>
            <textarea
              className="w-full min-h-[120px] p-6 rounded-[16px] premium-input-field outline-none transition-all text-[#F9FAFB] text-[18px] placeholder-[#64748B] resize-none"
              placeholder="e.g. Using relatable real-world analogies first, before showing code..."
              value={data.simplifyConcepts || ''}
              onChange={(e) => update({ ...data, simplifyConcepts: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-3 w-full">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Describe your teaching process.</label>
            <textarea
              className="w-full min-h-[120px] p-6 rounded-[16px] premium-input-field outline-none transition-all text-[#F9FAFB] text-[18px] placeholder-[#64748B] resize-none"
              placeholder="e.g. 10 mins theory -> 30 mins code-along -> 10 mins Q&A..."
              value={data.teachingProcess || ''}
              onChange={(e) => update({ ...data, teachingProcess: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-3 w-full">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">How do you keep students engaged?</label>
            <textarea
              className="w-full min-h-[120px] p-6 rounded-[16px] premium-input-field outline-none transition-all text-[#F9FAFB] text-[18px] placeholder-[#64748B] resize-none"
              placeholder="e.g. Asking periodic check-in questions, live polls, debugging exercises..."
              value={data.keepStudentsEngaged || ''}
              onChange={(e) => update({ ...data, keepStudentsEngaged: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AvailabilityStepRedesign({ data, update, errors }: any) {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const SLOTS = ['Morning (8 AM - 12 PM)', 'Afternoon (12 PM - 4 PM)', 'Evening (4 PM - 8 PM)', 'Night (8 PM - 12 AM)'];

  const toggleDay = (day: string) => {
    const arr = data.availableDays || [];
    const next = arr.includes(day) ? arr.filter((x: any) => x !== day) : [...arr, day];
    update({ ...data, availableDays: next, availability: next });
  };

  const toggleSlot = (slot: string) => {
    const arr = data.preferredTimeSlots || [];
    const next = arr.includes(slot) ? arr.filter((x: any) => x !== slot) : [...arr, slot];
    update({ ...data, preferredTimeSlots: next });
  };

  return (
    <div className="space-y-12">
      <div className="mb-12">
        <h2 className="text-[64px] font-extrabold text-[#F9FAFB] tracking-tight leading-tight">Availability & Rates</h2>
        <p className="text-[#94A3B8] text-[20px] font-medium mt-4 opacity-90">Indicate your weekly slots, expected hourly compensation, and preferred teaching format.</p>
      </div>

      <div className="p-8 bg-[#161B22]/50 border border-white/[0.04] rounded-[24px] space-y-8">
        <h3 className="text-[20px] font-semibold text-[#F9FAFB]">Weekly Schedule Blocks</h3>
        
        <div className="space-y-4">
          <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Available Days</label>
          <div className="flex flex-wrap gap-3">
            {DAYS.map(d => (
              <button 
                key={d} 
                type="button" 
                onClick={() => toggleDay(d)} 
                className={cn(
                  "px-6 py-3.5 rounded-full font-semibold text-[15px] transition-all border", 
                  (data.availableDays || data.availability || []).includes(d) 
                    ? "bg-[#4ade80] text-[#0B0F14] border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.25)]" 
                    : "bg-white/[0.02] text-[#94A3B8] border-white/5 hover:bg-white/[0.05]"
                )}
              >
                {d}
              </button>
            ))}
          </div>
          {errors.availableDays && <p className="text-[14px] font-medium text-red-400 mt-1 ml-1">{errors.availableDays}</p>}
        </div>

        <div className="space-y-4 pt-4">
          <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Preferred Time Slots</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SLOTS.map(slot => (
              <button 
                key={slot} 
                type="button" 
                onClick={() => toggleSlot(slot)} 
                className={cn(
                  "h-16 px-4 rounded-2xl font-semibold text-[14px] transition-all border flex items-center justify-center text-center", 
                  data.preferredTimeSlots?.includes(slot) 
                    ? "bg-[#4ade80] text-[#0B0F14] border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.25)]" 
                    : "bg-white/[0.02] text-[#94A3B8] border-white/5 hover:bg-white/[0.04]"
                )}
              >
                {slot}
              </button>
            ))}
          </div>
          {errors.preferredTimeSlots && <p className="text-[14px] font-medium text-red-400 mt-1 ml-1">{errors.preferredTimeSlots}</p>}
        </div>
      </div>

      <div className="p-8 bg-[#161B22]/50 border border-white/[0.04] rounded-[24px] space-y-8">
        <h3 className="text-[20px] font-semibold text-[#F9FAFB]">Location & Settings</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 xl:gap-x-16 gap-y-10">
          <div className="flex flex-col gap-3 w-full">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Preferred Mode</label>
            <div className="relative">
              <select
                className="w-full h-[68px] px-6 rounded-[16px] premium-input-field outline-none transition-all text-[#F9FAFB] text-[18px] appearance-none cursor-pointer"
                value={data.remoteOfflineAvailability || 'Remote & Offline'}
                onChange={(e) => update({ ...data, remoteOfflineAvailability: e.target.value, preferredMode: e.target.value })}
              >
                <option value="Remote Only" className="bg-[#111827]">Remote Only</option>
                <option value="Offline Only" className="bg-[#111827]">Offline Only</option>
                <option value="Remote & Offline" className="bg-[#111827]">Remote & Offline (Hybrid)</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B] w-5 h-5" />
            </div>
          </div>

          <PremiumInput 
            label="Timezone" 
            placeholder="e.g. IST (UTC+5:30), EST" 
            value={data.timezone || ''} 
            onChange={(e: any) => update({ ...data, timezone: e.target.value })} 
            error={errors.timezone} 
          />

          <div className="flex flex-col gap-4 bg-white/[0.01] p-6 rounded-2xl border border-white/5 lg:col-span-2">
            <span className="text-[16px] font-semibold text-[#F9FAFB] block">Travel & Extra Availability</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={data.travelAvailability || false} 
                  onChange={(e) => update({ ...data, travelAvailability: e.target.checked })}
                  className="w-5 h-5 rounded-md bg-white/[0.04] border-none text-[#4ade80] focus:ring-[#4ade80]/20" 
                />
                <span className="text-[15px] font-semibold text-[#94A3B8] group-hover:text-[#F9FAFB] transition-colors">Willing to travel for bootcamps</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={data.weekendAvailability || false} 
                  onChange={(e) => update({ ...data, weekendAvailability: e.target.checked })}
                  className="w-5 h-5 rounded-md bg-white/[0.04] border-none text-[#4ade80] focus:ring-[#4ade80]/20" 
                />
                <span className="text-[15px] font-semibold text-[#94A3B8] group-hover:text-[#F9FAFB] transition-colors">Weekend Availability</span>
              </label>
              <div className="flex items-center gap-2">
                <PremiumInput 
                  label="Monthly Availability (Hours)" 
                  placeholder="e.g. 40" 
                  value={data.monthlyAvailability || ''} 
                  onChange={(e: any) => update({ ...data, monthlyAvailability: e.target.value })} 
                  error={errors.monthlyAvailability} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-[#161B22]/50 border border-white/[0.04] rounded-[24px] space-y-8">
        <h3 className="text-[20px] font-semibold text-[#F9FAFB]">Compensation Details</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 xl:gap-x-16 gap-y-10">
          <div className="flex flex-col gap-3 w-full">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Preferred Payment Method</label>
            <div className="relative">
              <select
                className="w-full h-[68px] px-6 rounded-[16px] premium-input-field outline-none transition-all text-[#F9FAFB] text-[18px] appearance-none cursor-pointer"
                value={data.preferredPaymentMethod || 'Bank Transfer'}
                onChange={(e) => update({ ...data, preferredPaymentMethod: e.target.value })}
              >
                <option value="UPI" className="bg-[#111827]">UPI</option>
                <option value="Bank Transfer" className="bg-[#111827]">Direct Bank Transfer</option>
                <option value="PayPal" className="bg-[#111827]">PayPal / International</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B] w-5 h-5" />
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Expected Hourly Rate (₹)</label>
            <div className="relative flex items-center pt-4">
              <input 
                type="range" 
                min={500} 
                max={10000} 
                step={500}
                value={data.hourlyRate || data.pricing || 1000} 
                onChange={(e) => update({ ...data, hourlyRate: Number(e.target.value), pricing: Number(e.target.value) })}
                className="w-full accent-[#4ade80] bg-[#161B22] h-2 rounded-full cursor-pointer"
              />
              <span className="absolute right-0 -top-8 text-xl font-bold text-[#4ade80]">₹{data.hourlyRate || data.pricing || 1000}/hr</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:col-span-2">
            <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Expected Custom Workshop Pricing (₹)</label>
            <div className="relative flex items-center pt-4">
              <input 
                type="range" 
                min={5000} 
                max={150000} 
                step={5000}
                value={data.workshopPricing || 25000} 
                onChange={(e) => update({ ...data, workshopPricing: Number(e.target.value) })}
                className="w-full accent-[#4ade80] bg-[#161B22] h-2 rounded-full cursor-pointer"
              />
              <span className="absolute right-0 -top-8 text-xl font-bold text-[#4ade80]">₹{data.workshopPricing || 25000} total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStepRedesign({ data, update, setStep, handleSubmit, isSubmitting, errors }: any) {
  const review = data.reviewDetails || { bankDetails: '', agreedToNDA: false, agreedToTerms: false };

  const getMissingFields = () => {
    const missing: { label: string; step: number }[] = [];
    if (!data.personalDetails.fullName) missing.push({ label: 'Full Name', step: 1 });
    if (!data.personalDetails.email) missing.push({ label: 'Email Address', step: 1 });
    if (!data.personalDetails.phone) missing.push({ label: 'Phone Number', step: 1 });
    if (!data.personalDetails.city) missing.push({ label: 'City', step: 1 });
    if (!data.personalDetails.country) missing.push({ label: 'Country', step: 1 });
    if (!data.personalDetails.profilePhotoUrl) missing.push({ label: 'Profile Photo', step: 1 });
    if (!data.personalDetails.linkedinUrl) missing.push({ label: 'LinkedIn Profile', step: 1 });
    if (!data.professionalDetails.headline) missing.push({ label: 'Professional Headline', step: 1 });
    if (!data.professionalDetails.bio) missing.push({ label: 'Short Bio', step: 1 });
    
    if (!data.professionalDetails.primaryDomain) missing.push({ label: 'Primary Domain', step: 2 });
    if (!data.professionalDetails.skills || data.professionalDetails.skills.length === 0) missing.push({ label: 'Key Skills', step: 2 });
    if (!data.professionalDetails.yearsOfExperience) missing.push({ label: 'Years of Experience', step: 2 });
    if (!data.professionalDetails.currentRole) missing.push({ label: 'Current Role', step: 2 });
    if (!data.professionalDetails.currentCompany) missing.push({ label: 'Current Company', step: 2 });
    if (!data.professionalDetails.toolsMastery) missing.push({ label: 'Tools & Technologies', step: 2 });
    
    if (!data.credentialsDetails.highestQualification) missing.push({ label: 'Highest Qualification', step: 3 });
    if (!data.educationDetails[0]?.institution) missing.push({ label: 'Institution / University', step: 3 });
    if (!data.educationDetails[0]?.degree) missing.push({ label: 'Degree & Major', step: 3 });
    if (!data.documents.resumeUrl) missing.push({ label: 'Resume Upload', step: 3 });

    if (!data.teachingDetails.subjects || data.teachingDetails.subjects.length === 0) missing.push({ label: 'Subjects to Teach', step: 4 });
    if (!data.teachingDetails.teachingStyle) missing.push({ label: 'Teaching Style', step: 4 });
    if (!data.teachingDetails.communicationStyle) missing.push({ label: 'Communication Style', step: 4 });
    if (!data.teachingDetails.comfortableClassSize) missing.push({ label: 'Class Size Comfort', step: 4 });
    if (!data.teachingDetails.sessionLanguage || data.teachingDetails.sessionLanguage.length === 0) missing.push({ label: 'Languages for Teaching', step: 4 });
    if (!data.teachingDetails.simplifyConcepts) missing.push({ label: 'Simplified Concepts Explanation', step: 4 });

    if (!data.availabilityDetails.availableDays || data.availabilityDetails.availableDays.length === 0) missing.push({ label: 'Available Days', step: 5 });
    if (!data.availabilityDetails.preferredTimeSlots || data.availabilityDetails.preferredTimeSlots.length === 0) missing.push({ label: 'Preferred Time Slots', step: 5 });
    if (!data.availabilityDetails.timezone) missing.push({ label: 'Timezone', step: 5 });

    return missing;
  };

  const missingFields = getMissingFields();
  const totalRequired = 30;
  const filledCount = totalRequired - missingFields.length;
  const score = Math.max(0, Math.min(100, Math.round((filledCount / totalRequired) * 100)));

  const getReadinessLabel = (s: number) => {
    if (s === 100) return { label: 'Elite Verification Ready', color: 'text-[#4ade80]', bg: 'bg-[#4ade80]/10 border-[#4ade80]/20' };
    if (s >= 80) return { label: 'Strong Pedigree', color: 'text-[#4ade80]', bg: 'bg-[#4ade80]/10 border-[#4ade80]/20' };
    if (s >= 50) return { label: 'Intermediate Details', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: 'Needs Vetting Details', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  };

  const readiness = getReadinessLabel(score);

  return (
    <div className="space-y-10">
      <div className="mb-12">
        <h2 className="text-[64px] font-extrabold text-[#F9FAFB] tracking-tight leading-tight">Review Application</h2>
        <p className="text-[#94A3B8] text-[20px] font-medium mt-4 opacity-90">Ensure all details are correct before submission.</p>
      </div>

      <div className="p-8 rounded-[24px] bg-white/[0.01] border border-white/[0.04] flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="space-y-3 flex-1">
          <span className="text-[13px] font-black uppercase tracking-wider text-[#64748B]">Profile Completeness</span>
          <div className="flex items-center gap-4">
            <h4 className="text-[48px] font-black text-[#F9FAFB]">{score}%</h4>
            <span className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border", readiness.bg, readiness.color)}>
              {readiness.label}
            </span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#4ade80] transition-all duration-500" style={{ width: `${score}%` }} />
          </div>
        </div>
        
        {missingFields.length > 0 && (
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-right shrink-0">
            <p className="text-sm font-semibold text-[#94A3B8]">Missing Required Fields</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{missingFields.length} fields remaining</p>
          </div>
        )}
      </div>

      <div className="p-8 rounded-[24px] bg-[#161B22]/50 border border-white/[0.04] text-[#F9FAFB] relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#4ade80] overflow-hidden">
                 {data.personalDetails.profilePhotoUrl ? (
                    
                   <img src={data.personalDetails.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <User size={32} />
                 )}
               </div>
               <div>
                 <h3 className="text-2xl font-bold tracking-tight">{data.personalDetails.fullName || 'Unnamed Applicant'}</h3>
                 <p className="text-[#94A3B8] text-sm font-semibold mt-1">{data.professionalDetails.headline || 'No headline set'}</p>
               </div>
            </div>
            <button 
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-[#F9FAFB] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              Edit Identity
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6 border-t border-white/[0.03]">
             <div>
               <p className="text-[12px] font-semibold text-[#64748B] tracking-wide mb-1 uppercase">Years of Experience</p>
               <p className="font-bold text-lg text-[#F9FAFB]">{data.professionalDetails.yearsOfExperience || '0'} Years</p>
             </div>
             <div>
               <p className="text-[12px] font-semibold text-[#64748B] tracking-wide mb-1 uppercase">Location</p>
               <p className="font-bold text-lg text-[#F9FAFB]">{data.personalDetails.city || 'N/A'}, {data.personalDetails.country || 'N/A'}</p>
             </div>
             <div>
               <p className="text-[12px] font-semibold text-[#64748B] tracking-wide mb-1 uppercase">Pricing Expectation</p>
               <p className="font-bold text-lg text-[#4ade80]">₹{data.availabilityDetails.pricing || data.availabilityDetails.hourlyRate || '0'}/hr</p>
             </div>
          </div>

          <div className="pt-6 border-t border-white/[0.03] space-y-4">
            <span className="text-[13px] font-black uppercase tracking-wider text-[#64748B]">Verification Documents</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#94A3B8]">Resume/CV File</span>
                {data.documents.resumeUrl ? (
                  <span className="text-xs font-bold text-[#4ade80] uppercase tracking-wider bg-[#4ade80]/10 px-2 py-0.5 rounded">Uploaded</span>
                ) : (
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded">Missing</span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#94A3B8]">Degree Certificate</span>
                {data.documents.degreeUrl ? (
                  <span className="text-xs font-bold text-[#4ade80] uppercase tracking-wider bg-[#4ade80]/10 px-2 py-0.5 rounded">Uploaded</span>
                ) : (
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">Not Uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {missingFields.length > 0 && (
        <div className="p-8 rounded-[24px] bg-red-500/5 border border-red-500/10 space-y-4">
          <h4 className="text-[18px] font-bold text-red-400">Please Complete the Following Fields:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {missingFields.map((field) => (
              <button
                key={field.label}
                onClick={() => setStep(field.step)}
                className="flex items-center justify-between p-4 bg-red-950/20 border border-red-900/30 rounded-xl hover:bg-red-900/10 transition-colors text-left"
              >
                <span className="text-[14px] font-semibold text-red-300">{field.label}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">Go to Step {field.step}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-8 bg-[#161B22]/50 border border-white/[0.04] rounded-[24px] space-y-6">
        <h3 className="text-[20px] font-semibold text-[#F9FAFB]">Compliance & Payment Agreement</h3>
        
        <div className="flex flex-col gap-3 w-full">
          <label className="text-[18px] font-semibold text-[#F9FAFB] ml-1 block tracking-wide">Bank Account Details / UPI ID</label>
          <input
            type="text"
            value={review.bankDetails}
            onChange={(e: any) => update({ ...data, reviewDetails: { ...review, bankDetails: e.target.value } })}
            placeholder="e.g. UPI ID: name@okaxis or Bank Account Number & IFSC"
            className="w-full h-16 px-6 rounded-[14px] premium-input-field outline-none transition-all text-[#F9FAFB] text-[18px] placeholder-[#64748B]"
          />
          {errors.bankDetails && <p className="text-[14px] font-medium text-red-400 mt-1 ml-1">{errors.bankDetails}</p>}
        </div>

        <label className="flex items-start gap-4 cursor-pointer pt-2 group">
          <input 
            type="checkbox" 
            checked={review.agreedToNDA || false} 
            onChange={(e) => update({ ...data, reviewDetails: { ...review, agreedToNDA: e.target.checked } })}
            className="w-5 h-5 rounded bg-white/[0.04] border-none text-[#4ade80] focus:ring-[#4ade80]/20 mt-0.5" 
          />
          <span className="text-[14px] font-semibold text-[#94A3B8] group-hover:text-[#F9FAFB] transition-colors leading-relaxed">
            I agree that the course content developed for this platform remains the intellectual property of the company (NDA & IP Agreement).
          </span>
        </label>
        {errors.agreedToNDA && <p className="text-[14px] font-medium text-red-400 mt-1 ml-1">{errors.agreedToNDA}</p>}
      </div>

      <div className="p-5 rounded-[16px] bg-amber-500/5 flex gap-4 mt-6">
        <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[14px] font-semibold text-[#94A3B8] leading-relaxed">By submitting, you agree to our Instructor Quality Protocols and Academic Vetting standards.</p>
      </div>
    </div>
  );
}
