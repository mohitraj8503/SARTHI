'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Phone, 
  School, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles,
  BookOpen,
  GraduationCap
} from 'lucide-react';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';

const STEPS = [
  { id: 'personal', title: 'Personal', icon: User },
  { id: 'academic', title: 'Academic', icon: GraduationCap },
  { id: 'social', title: 'Social', icon: GithubIcon },
];

const JUNIOR_LEVEL_KEYS = ['CLASS_6', 'CLASS_7', 'CLASS_8', 'CLASS_9', 'CLASS_10', 'CLASS_11', 'CLASS_12'];

export default function OnboardingClient() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    educationLevel: 'GRADUATION',
    platformSegment: 'MAIN',
    college: '',
    customCollege: '',
    location: '',
    currentStatus: 'Student',
    currentCourse: 'B.Tech',
    lastQualification: '1st Year',
    bio: '',
    github: '',
    linkedin: '',
    interests: [] as string[]
  });

  const isJunior = JUNIOR_LEVEL_KEYS.includes(formData.educationLevel);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        educationLevel: (user as any).educationLevel || prev.educationLevel,
        platformSegment: (user as any).platformSegment || prev.platformSegment,
      }));
    }
  }, [user]);

  const validateStep = () => {
    switch (step) {
      case 0:
        return formData.name.trim().length >= 2 && 
               formData.email.trim().length >= 5 && 
               formData.phone.trim().length >= 10;
      case 1: {
        const collegeValid = formData.college === 'Other'
          ? formData.customCollege.trim().length >= 2
          : formData.college.trim().length >= 2;
        return !!formData.educationLevel && collegeValid && formData.currentCourse.trim().length >= 2 && formData.lastQualification.trim().length >= 2;
      }
      case 2:
        return true; // All social links are now optional
      default:
        return true;
    }
  };

  const autoSave = async (newData: any) => {
    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newData, isPartial: true }),
      });
    } catch (err) {
      console.warn('Auto-save failed:', err);
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      triggerHaptic('error');
      setError('Please fill in all required fields correctly.');
      return;
    }

    setError(null);
    if (step < STEPS.length - 1) {
      triggerHaptic('light');
      autoSave(formData); // Auto-save progress
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      triggerHaptic('light');
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    triggerHaptic('medium');

    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // If user selected "Other", send their typed college name instead
          college: formData.college === 'Other' ? formData.customCollege : formData.college,
          location: formData.location,
          personalization: {
            bio: formData.bio,
            social: {
              github: formData.github,
              linkedin: formData.linkedin
            },
            interests: formData.interests
          }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      triggerHaptic('success');
      // Refresh user session to update onboarded status
      if (refreshUser) await refreshUser();
      
      addToast({
        type: 'success',
        title: 'Profile Synchronized',
        message: 'Your workspace is ready. Welcome to the elite.'
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      triggerHaptic('error');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-[32px] font-black text-[#0F172A] tracking-tighter uppercase leading-none">The <span className="text-emerald-600">Basics</span></h2>
              <p className="text-sm font-medium text-slate-400 mt-2">How should we address you and reach you?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={16} /> Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={16} /> Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone size={16} /> WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                  required
                />
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-[32px] font-black text-[#0F172A] tracking-tighter uppercase leading-none">Academic <span className="text-emerald-600">Profile</span></h2>
              <p className="text-sm font-medium text-slate-400 mt-2">Tell us about your education background.</p>
            </div>

            <div className="space-y-4">
              {/* Education Level (Main vs Juniors determination) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <GraduationCap size={16} /> Education Level
                  </span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full",
                    isJunior 
                      ? "bg-amber-100 text-amber-900 border border-amber-300" 
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  )}>
                    {isJunior ? 'SARTHI Juniors (Class 6–12)' : 'SARTHI Main (College & Pro)'}
                  </span>
                </label>
                <select
                  value={formData.educationLevel}
                  onChange={e => {
                    const val = e.target.value;
                    const junior = JUNIOR_LEVEL_KEYS.includes(val);
                    setFormData({
                      ...formData,
                      educationLevel: val,
                      platformSegment: junior ? 'JUNIOR' : 'MAIN',
                      currentCourse: junior ? (formData.currentCourse === 'B.Tech' ? 'CBSE' : formData.currentCourse) : (formData.currentCourse === 'CBSE' ? 'B.Tech' : formData.currentCourse),
                      lastQualification: junior ? val.replace('_', ' ') : (formData.lastQualification || '1st Year')
                    });
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none appearance-none bg-white font-medium text-sm"
                  required
                >
                  <optgroup label="School Education (Class 6–12)">
                    <option value="CLASS_6">Class 6</option>
                    <option value="CLASS_7">Class 7</option>
                    <option value="CLASS_8">Class 8</option>
                    <option value="CLASS_9">Class 9</option>
                    <option value="CLASS_10">Class 10</option>
                    <option value="CLASS_11">Class 11</option>
                    <option value="CLASS_12">Class 12</option>
                  </optgroup>
                  <optgroup label="Higher Education & Professional">
                    <option value="GRADUATION">Undergraduate / College (B.Tech, BCA, B.Sc, BBA, etc.)</option>
                    <option value="POST_GRADUATION">Postgraduate (M.Tech, MCA, M.Sc, MBA, etc.)</option>
                    <option value="WORKING_PROFESSIONAL">Working Professional</option>
                    <option value="OTHER">Other / Graduate</option>
                  </optgroup>
                </select>
              </div>

              {/* Institution Field (School vs College) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <School size={16} /> {isJunior ? 'School Name' : 'College / University'}
                </label>
                {isJunior ? (
                  <input
                    type="text"
                    value={formData.college}
                    onChange={e => setFormData({ ...formData, college: e.target.value })}
                    placeholder="Enter your school name (e.g. DPS, KV, Ryan International)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none bg-white font-medium text-sm"
                    required
                  />
                ) : (
                  <>
                    <select
                      value={formData.college}
                      onChange={e => setFormData({ ...formData, college: e.target.value, customCollege: '' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none appearance-none bg-white font-medium"
                      required
                    >
                      <option value="">Select your institution</option>
                      <option value="IIT">Indian Institute of Technology (IIT)</option>
                      <option value="NIT">National Institute of Technology (NIT)</option>
                      <option value="BITS">BITS Pilani</option>
                      <option value="VIT">VIT University</option>
                      <option value="DU">Delhi University</option>
                      <option value="MU">Mumbai University</option>
                      <option value="Other">Other Institution</option>
                    </select>
                    {formData.college === 'Other' && (
                      <input
                        type="text"
                        placeholder="Type your college / university name"
                        value={formData.customCollege}
                        onChange={e => setFormData({ ...formData, customCollege: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-emerald-50/30 font-medium text-sm mt-2"
                        autoFocus
                        required
                      />
                    )}
                  </>
                )}
              </div>

              {/* Location field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  📍 Your Location
                </label>
                <input
                  type="text"
                  placeholder="City, State (e.g. Patna, Bihar)"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none bg-white font-medium text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current Status</label>
                <div className="flex gap-3">
                  {(isJunior ? ['Student', 'Self-Taught'] : ['Student', 'Working', 'Other']).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, currentStatus: status })}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all",
                        formData.currentStatus === status 
                          ? (isJunior ? "bg-amber-900 text-white border-amber-900 shadow-md" : "bg-emerald-950 text-white border-emerald-950 shadow-md")
                          : "bg-white text-gray-400 border-gray-100 hover:border-emerald-200"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <BookOpen size={16} /> {isJunior ? 'School Board' : 'Course / Degree'}
                  </label>
                  {isJunior ? (
                    <select
                      value={formData.currentCourse}
                      onChange={e => setFormData({ ...formData, currentCourse: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none appearance-none bg-white font-medium"
                      required
                    >
                      <option value="CBSE">CBSE Board</option>
                      <option value="ICSE">ICSE / ISC Board</option>
                      <option value="State Board">State Board</option>
                      <option value="IB">IB / Cambridge</option>
                      <option value="Other">Other Curriculum</option>
                    </select>
                  ) : (
                    <select
                      value={formData.currentCourse}
                      onChange={e => setFormData({ ...formData, currentCourse: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none appearance-none bg-white font-medium"
                      required
                    >
                      <option value="">Select Course</option>
                      <option value="B.Tech">B.Tech / B.E.</option>
                      <option value="BCA">BCA / MCA</option>
                      <option value="B.Sc">B.Sc / M.Sc</option>
                      <option value="MBA">MBA / BBA</option>
                      <option value="Other">Other Professional</option>
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <GraduationCap size={16} /> {isJunior ? 'Current Standard' : 'Current Year'}
                  </label>
                  {isJunior ? (
                    <input
                      type="text"
                      value={formData.educationLevel.replace('_', ' ')}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-bold text-sm cursor-not-allowed outline-none"
                    />
                  ) : (
                    <select
                      value={formData.lastQualification}
                      onChange={e => setFormData({ ...formData, lastQualification: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none appearance-none bg-white font-medium"
                      required
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-[32px] font-black text-[#0F172A] tracking-tighter uppercase leading-none">Areas of <span className="text-emerald-600">Focus</span></h2>
              <p className="text-sm font-medium text-slate-400 mt-2">How do you want to contribute?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Area of Interest (Primary)</label>
                <div className="flex flex-wrap gap-3">
                  {['Creator', 'Research', 'Tech'].map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => {
                        const newInterests = formData.interests.includes(interest) 
                          ? formData.interests.filter(i => i !== interest)
                          : [...formData.interests, interest];
                        setFormData({ ...formData, interests: newInterests });
                      }}
                      className={cn(
                        "px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all",
                        formData.interests.includes(interest) 
                          ? "bg-emerald-950 text-white border-emerald-950 shadow-md" 
                          : "bg-white text-gray-400 border-gray-100 hover:border-emerald-200"
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <LinkedinIcon size={16} className="text-[#0077B5] w-4 h-4" /> LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <GithubIcon size={16} className="w-4 h-4" /> GitHub Profile
                  </label>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optional</span>
                </div>
                <input
                  type="url"
                  value={formData.github}
                  onChange={e => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tell us a bit about yourself (Bio)</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="A short intro about your passion and goals..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none"
                />
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      {/* Background Cinematic Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        
        {/* Portal Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl border border-gray-100 overflow-hidden p-3 relative z-20">
            <Image src="/sarthi-logo.png" alt="Logo" width={80} height={80} className="w-full h-full object-contain" />
          </div>
        </div>
<div className="bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
          {/* Progress Header */}
          <div className="px-8 pt-8 flex items-center justify-between">
            <div className="flex gap-2">
              {STEPS.map((s, i) => (
                <div 
                  key={s.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === step ? "w-8 bg-[#1B4332]" : i < step ? "w-1.5 bg-emerald-500" : "w-1.5 bg-gray-100"
                  )}
                />
              ))}
            </div>
            <div className="px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-black text-emerald-700 uppercase tracking-widest">
              Step {step + 1} of {STEPS.length}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 md:p-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {error && (
              <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex gap-4">
            {step > 0 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="h-14 px-6 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className={cn(
                "h-14 flex-1 rounded-2xl bg-[#1B4332] text-white font-bold text-lg shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2",
                loading && "opacity-50 cursor-not-allowed translate-y-0"
              )}
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step === STEPS.length - 1 ? (
                <>Complete Profile <Sparkles size={20} /></>
              ) : (
                <>Continue <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-gray-400 text-xs font-bold uppercase tracking-[2px] flex items-center justify-center gap-2">
          <Check size={12} className="text-emerald-500" /> Secure Your Professional Identity
        </p>
      </div>
    </div>
  );
}

