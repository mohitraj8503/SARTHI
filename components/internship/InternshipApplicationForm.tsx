'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { PREFERRED_TRACKS } from '@/lib/constants/internship';
import { isIilmUniversity } from '@/lib/utils/iilm';
import {
  Loader2,
  Check,
  AlertCircle,
  Send,
  User,
  GraduationCap,
  Building2,
  BookOpen,
  Globe,
  Code,
  FileText,
  ChevronLeft,
  ArrowRight,
  MapPin,
  Clock,
} from 'lucide-react';

export const internshipFields = [
  "Software Development",
  "AI & Machine Learning",
  "Data Science & Analytics",
  "Web Development",
  "App Development",
  "UI/UX & Product Design",
  "Cybersecurity",
  "Cloud & DevOps",
  "Digital Marketing",
  "Content & Creative",
  "Business & Operations",
  "Other",
];

interface FormProps {
  initialValues?: Partial<{
    name: string;
    email: string;
    college: string;
    course: string;
    semester: string;
    location: string;
    github: string;
    linkedin: string;
    domain: string;
    statement: string;
    preferredField: string;
    internshipTrack: "experienced" | "learning";
  }>;
  onSuccess?: (appData: any) => void;
  redirectOnSuccess?: boolean;
  redirectUrl?: string;
}

export default function InternshipApplicationForm({
  initialValues,
  onSuccess,
  redirectOnSuccess = false,
  redirectUrl = '/dashboard/internship',
}: FormProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState(initialValues?.name || user?.name || '');
  const [email, setEmail] = useState(initialValues?.email || user?.email || '');
  const [college, setCollege] = useState(initialValues?.college || (user as any)?.college || '');
  const [course, setCourse] = useState(initialValues?.course || '');
  const [semester, setSemester] = useState(initialValues?.semester || '1');
  const [location, setLocation] = useState(initialValues?.location || (user as any)?.location || '');
  const [domain, setDomain] = useState(initialValues?.domain || PREFERRED_TRACKS[0]);
  const [github, setGithub] = useState(initialValues?.github || '');
  const [linkedin, setLinkedin] = useState(initialValues?.linkedin || '');
  const [statement, setStatement] = useState(initialValues?.statement || '');
  
  const [preferredField, setPreferredField] = useState(initialValues?.preferredField || '');
  const [internshipTrack, setInternshipTrack] = useState<'experienced' | 'learning' | ''>(initialValues?.internshipTrack || '');
  
  const [fieldError, setFieldError] = useState('');
  const [trackError, setTrackError] = useState('');

  const [step, setStep] = useState<'field' | 'track' | 'details'>('field');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [reducedMotion, setReducedMotion] = useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.email && !email) setEmail(user.email);
      if ((user as any)?.college && !college) setCollege((user as any).college);
      if ((user as any)?.location && !location) setLocation((user as any).location);
    }
  }, [user]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const handleNextFromField = () => {
    if (!preferredField) {
      setFieldError('Please select your preferred field.');
      return;
    }
    setFieldError('');
    setDirection('forward');
    setStep('track');
  };

  const handleNextFromTrack = () => {
    if (!internshipTrack) {
      setTrackError('Please select an internship track.');
      return;
    }
    setTrackError('');
    setDirection('forward');
    setStep('details');
  };

  const handleBackToField = () => {
    setDirection('backward');
    setStep('field');
  };

  const handleBackToTrack = () => {
    setDirection('backward');
    setStep('track');
  };

  const getAnimationClass = () => {
    if (reducedMotion) return '';
    return direction === 'forward' ? 'animate-slideInRight' : 'animate-slideInLeft';
  };

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rejectedInfo, setRejectedInfo] = useState<{ isRejected: boolean; reason?: string }>({ isRejected: false });
  const [nonIilmSuccessInfo, setNonIilmSuccessInfo] = useState<{ applicationId: string } | null>(null);
  const [enrollmentSuccessInfo, setEnrollmentSuccessInfo] = useState<{
    applicationId: string;
    track: string;
    amount: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setRejectedInfo({ isRejected: false });

    let valid = true;
    if (!preferredField) {
      setFieldError('Please select your preferred field.');
      valid = false;
    } else {
      setFieldError('');
    }

    if (!internshipTrack) {
      setTrackError('Please select an internship track.');
      valid = false;
    } else {
      setTrackError('');
    }

    if (!valid) {
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/internship/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          college,
          course,
          semester,
          location,
          domain,
          github,
          linkedin,
          statement,
          preferredField,
          internshipTrack,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push(`/login?redirect=/internship/apply`);
        return;
      }

      if (data.rejected) {
        setRejectedInfo({ isRejected: true, reason: data.reason });
      } else if (res.ok && data.success) {
        // Only applicants from IILM University see the checkout page
        if (isIilmUniversity(college)) {
          router.push(`/internship/apply/checkout/${data.application.id}`);
        } else {
          setNonIilmSuccessInfo({ applicationId: data.application.id });
        }
        return;
      } else {
        setErrorMessage(data.error || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage('Network error occurred. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (rejectedInfo.isRejected) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4 max-w-xl mx-auto my-6">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-red-900 uppercase">Application Disqualified</h3>
        <p className="text-xs text-red-700 leading-relaxed">
          {rejectedInfo.reason === 'ARKA_JAIN_TECHNICAL_RESTRICTION'
            ? 'As per program policy, applications from Arka Jain University technical programs (B.Tech / Diploma) are not eligible for this internship cohort.'
            : 'Your application could not be processed due to program restrictions.'}
        </p>
      </div>
    );
  }

  if (nonIilmSuccessInfo) {
    const referenceId = `APP-2026-${nonIilmSuccessInfo.applicationId.slice(-4).toUpperCase()}`;
    return (
      <div className="p-8 md:p-10 text-center space-y-6 relative overflow-hidden font-sans text-slate-800 bg-white border border-slate-200 rounded-3xl shadow-xl max-w-xl mx-auto my-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <Check className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-widest">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> Under Evaluation
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
            Application Submitted Successfully
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
            Your application for <strong>{name}</strong> from <strong>{college}</strong> ({location || 'Location Noted'}) has been received. Our team will review your profile details and notify you via email.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Application Reference</span>
            <span className="font-mono font-bold text-slate-800 uppercase">{referenceId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">College / University</span>
            <span className="font-bold text-slate-800">{college}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Location</span>
            <span className="font-bold text-slate-800">{location || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Current Status</span>
            <span className="font-black text-amber-600 uppercase">Under Review</span>
          </div>
        </div>

        <div className="pt-2 max-w-md mx-auto">
          <a
            href="/dashboard/internship"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-98 w-full"
          >
            <span>Go to Intern Dashboard</span>
            <ArrowRight className="w-4 h-4 text-emerald-300" />
          </a>
        </div>
      </div>
    );
  }

  if (enrollmentSuccessInfo) {
    const trackLabel = enrollmentSuccessInfo.track === 'experienced' ? 'Experienced Track' : 'Learning & Development Track';
    const referenceId = `APP-2026-${enrollmentSuccessInfo.applicationId.slice(-4).toUpperCase()}`;
    return (
      <div className="p-8 md:p-10 text-center space-y-6 relative overflow-hidden font-sans text-slate-800">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <Check className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
            ✓ Enrollment Confirmed
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
            Application Submitted & Enrollment Confirmed
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
            Your SARTHI internship enrollment is confirmed successfully.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Internship Track</span>
            <span className="font-bold text-slate-800">{trackLabel}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Amount Paid</span>
            <span className="font-black text-slate-900">₹{enrollmentSuccessInfo.amount}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Application Reference</span>
            <span className="font-mono font-bold text-slate-800 uppercase">{referenceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Status</span>
            <span className="font-black text-emerald-700 uppercase">Enrolled & Approved</span>
          </div>
        </div>

        {enrollmentSuccessInfo.track === 'learning' && (
          <p className="text-[11px] text-indigo-700 font-extrabold bg-indigo-50 border border-indigo-100 p-3 rounded-xl leading-relaxed max-w-md mx-auto">
            Your Learning Internship + Placement Support pathway is now active. Placement support begins after successful internship completion, subject to eligibility.
          </p>
        )}

        <div className="pt-2 max-w-md mx-auto">
          <a
            href="/dashboard/internship"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-98 w-full"
          >
            <span>Go to Intern Dashboard</span>
            <ArrowRight className="w-4 h-4 text-emerald-300" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Self-contained Step Transition Keyframe Animations */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between max-w-lg mx-auto mb-8 font-sans select-none px-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black leading-none transition-all ${
            step === 'field' 
              ? 'bg-[#1B4332] text-white ring-4 ring-[#1B4332]/10 scale-105' 
              : preferredField
              ? 'bg-emerald-100 text-[#1B4332] border border-[#1B4332]/20 font-bold'
              : 'bg-slate-100 text-slate-450 border border-slate-200'
          }`}>
            {preferredField ? '✓' : '1'}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            step === 'field' ? 'text-[#1B4332]' : 'text-slate-400'
          }`}>Field</span>
        </div>

        <div className="flex-1 h-0.5 bg-slate-200/80 mx-4 rounded-full overflow-hidden">
          <div className={`h-full bg-[#1B4332] transition-all duration-300 ${
            step === 'field' ? 'w-0' : step === 'track' ? 'w-1/2' : 'w-full'
          }`} />
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black leading-none transition-all ${
            step === 'track' 
              ? 'bg-[#1B4332] text-white ring-4 ring-[#1B4332]/10 scale-105' 
              : internshipTrack 
              ? 'bg-emerald-100 text-[#1B4332] border border-[#1B4332]/20 font-bold'
              : 'bg-slate-100 text-slate-450 border border-slate-200'
          }`}>
            {internshipTrack ? '✓' : '2'}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            step === 'track' ? 'text-[#1B4332]' : 'text-slate-400'
          }`}>Track</span>
        </div>

        <div className="flex-1 h-0.5 bg-slate-200/80 mx-4 rounded-full overflow-hidden">
          <div className={`h-full bg-[#1B4332] transition-all duration-300 ${
            step === 'details' ? 'w-full' : 'w-0'
          }`} />
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black leading-none transition-all ${
            step === 'details' 
              ? 'bg-[#1B4332] text-white ring-4 ring-[#1B4332]/10 scale-105' 
              : 'bg-slate-100 text-slate-450 border border-slate-200'
          }`}>
            3
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            step === 'details' ? 'text-[#1B4332]' : 'text-slate-400'
          }`}>Details</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Select Your Field */}
      {step === 'field' && (
        <div className={`space-y-6 ${getAnimationClass()}`}>
          <div className="space-y-3 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold font-mono">1</span>
              <label className="text-sm font-black uppercase tracking-wider text-slate-800">
                Select Your Field <span className="text-emerald-600">*</span>
              </label>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Choose the field you would like to focus on during your SARTHI internship.
            </p>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <select
                required
                value={preferredField}
                onChange={(e) => {
                  setPreferredField(e.target.value);
                  if (e.target.value) setFieldError('');
                }}
                className={`w-full pl-11 pr-4 py-3.5 bg-white border ${
                  fieldError ? 'border-red-300 focus:ring-red-500/15' : 'border-slate-200 focus:ring-[#1B4332]/15'
                } rounded-xl focus:outline-none focus:ring-2 focus:border-[#1B4332]/40 text-sm font-semibold text-slate-800 transition-all appearance-none cursor-pointer`}
              >
                <option value="" disabled>-- Select preferred field --</option>
                {internshipFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>
            {fieldError && (
              <p className="text-xs font-bold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {fieldError}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNextFromField}
              className="px-6 py-3.5 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4 text-emerald-350" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Choose Your Internship Track */}
      {step === 'track' && (
        <div className={`space-y-6 ${getAnimationClass()}`}>
          <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-sm font-bold font-mono shrink-0 shadow-sm">2</span>
              <label className="text-lg font-black uppercase tracking-wider text-slate-800">
                Choose Your Internship Track <span className="text-emerald-600">*</span>
              </label>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Tell us how you would like to contribute and grow during the internship.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              {/* Experienced Track */}
              <div
                onClick={() => {
                  setInternshipTrack('experienced');
                  setTrackError('');
                }}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none flex flex-col justify-between h-full bg-white ${
                  internshipTrack === 'experienced'
                    ? 'border-[#1B4332] shadow-[0_15px_30px_rgba(27,67,50,0.08)] -translate-y-1'
                    : 'border-slate-200 hover:border-slate-350 hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)]'
                }`}
              >
                {internshipTrack === 'experienced' && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#1B4332]/5 rounded-bl-full pointer-events-none" />
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-xl transition-colors duration-300 ${
                          internshipTrack === 'experienced' ? 'bg-[#1B4332]/10 text-[#1B4332]' : 'bg-slate-50 text-slate-500'
                        }`}
                      >
                        <Code className="w-5 h-5" />
                      </div>
                      <span className="text-lg font-black text-slate-900 tracking-tight">Experienced Track</span>
                    </div>
                    {internshipTrack === 'experienced' && (
                      <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-black text-[#1b6644] uppercase tracking-wide">Experienced Track — ₹1,500</p>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">For applicants who already know the work and want to contribute to real projects.</p>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
                    I already have the required skills and want to apply them to real-world projects, contribute to the team, and gain practical industry experience.
                  </p>
                </div>
                
                <div className="mt-8 flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm">
                    Contribute & Build
                  </span>
                  <span className="text-lg font-black text-slate-955">₹1,500</span>
                </div>
              </div>

              {/* Learning Track */}
              <div
                onClick={() => {
                  setInternshipTrack('learning');
                  setTrackError('');
                }}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none flex flex-col justify-between h-full bg-white ${
                  internshipTrack === 'learning'
                    ? 'border-[#1B4332] shadow-[0_15px_30px_rgba(27,67,50,0.08)] -translate-y-1'
                    : 'border-slate-200 hover:border-slate-350 hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)]'
                }`}
              >
                {internshipTrack === 'learning' && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#1B4332]/5 rounded-bl-full pointer-events-none" />
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-xl transition-colors duration-300 ${
                          internshipTrack === 'learning' ? 'bg-[#1B4332]/10 text-[#1B4332]' : 'bg-slate-50 text-slate-500'
                        }`}
                      >
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-lg font-black text-slate-900 tracking-tight">Learning Track</span>
                    </div>
                    {internshipTrack === 'learning' && (
                      <div className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-black text-[#1b6644] uppercase tracking-wide">Learning Track — ₹2,500</p>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black border border-emerald-100">Learning Internship</span> + <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-black border border-indigo-100">Placement Support</span>, with structured guidance and placement support immediately after successful internship completion, subject to eligibility.
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3">
                    I want to strengthen my skills, learn through structured guidance, and gain practical experience while working on real-world projects.
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-100 shadow-sm">
                    Learn & Grow
                  </span>
                  <span className="text-lg font-black text-slate-955">₹2,500</span>
                </div>
              </div>
            </div>

            {trackError && (
              <p className="text-xs font-bold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {trackError}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleBackToField}
              className="px-5 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4 text-slate-400" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextFromTrack}
              className="px-6 py-3.5 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4 text-emerald-355" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Application Form */}
      {step === 'details' && (
        <form onSubmit={handleSubmit} className={`space-y-6 ${getAnimationClass()}`}>
          <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold font-mono">3</span>
              <label className="text-sm font-black uppercase tracking-wider text-slate-800">
                Provide Application Details
              </label>
            </div>

            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Full Name <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15 focus:border-[#1B4332]/40 text-sm font-semibold text-slate-800 transition-all"
                    placeholder="e.g. Mohit Raj"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Email Address <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15 focus:border-[#1B4332]/40 text-sm font-semibold text-slate-800 transition-all"
                    placeholder="e.g. mohit@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: College & Course */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  College / University <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15 focus:border-[#1B4332]/40 text-sm font-semibold text-slate-800 transition-all"
                    placeholder="e.g. IILM University"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Course of Study <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15 focus:border-[#1B4332]/40 text-sm font-semibold text-slate-800 transition-all"
                    placeholder="e.g. BCA or B.Tech CSE"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Current Semester, Location & Preferred Track */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Current Semester <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <select
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15 focus:border-[#1B4332]/40 text-sm font-semibold text-slate-800 transition-all appearance-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem.toString()}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Location / City <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15 focus:border-[#1B4332]/40 text-sm font-semibold text-slate-800 transition-all"
                    placeholder="e.g. Noida or Delhi"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Preferred Track <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <Code className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <select
                    required
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15 focus:border-[#1B4332]/40 text-sm font-semibold text-slate-800 transition-all appearance-none cursor-pointer"
                  >
                    {PREFERRED_TRACKS.map((track) => (
                      <option key={track} value={track}>
                        {track}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Row 4: GitHub (Optional) & LinkedIn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  GitHub Profile <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Code className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15 focus:border-[#1B4332]/40 text-sm font-semibold text-slate-800 transition-all"
                    placeholder="e.g. username or https://github.com/username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  LinkedIn Profile / Username <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15 focus:border-[#1B4332]/40 text-sm font-semibold text-slate-800 transition-all"
                    placeholder="e.g. mohitraj8503 or https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Statement of Purpose */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                Statement of Purpose <span className="text-emerald-600">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                <textarea
                  required
                  rows={4}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4332]/15 focus:border-[#1B4332]/40 text-sm font-semibold text-slate-800 transition-all font-sans"
                  placeholder="Tell us about your technical goals, prior project experience, and why you want to join SARTHI Internship..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 gap-4">
            <button
              type="button"
              onClick={handleBackToTrack}
              className="px-5 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4 text-slate-400" />
              <span>Back</span>
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-emerald-300" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
