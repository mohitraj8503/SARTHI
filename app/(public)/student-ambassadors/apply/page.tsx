'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud, X, Check, AlertCircle, ChevronLeft, ChevronRight, BookOpen, User, GraduationCap, Compass, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SKILLS_OPTIONS = [
  'Web Dev',
  'AI/ML',
  'Cloud Computing',
  'UI/UX Design',
  'Content Creation',
  'Community Building',
  'Public Speaking',
  'Mobile Dev',
  'Cybersecurity',
  'Data Science',
  'DevOps',
];

interface FormState {
  // Step 1: Personal Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;

  // Step 2: Academic Info
  country: string;
  state: string;
  city: string;
  collegeName: string;
  degreeProgram: string;
  gradMonth: string;
  gradYear: string;

  // Step 3: Application Essays (Microsoft style)
  essayWelcome: string; // Video or written introduction
  essayGuide: string;   // Guide a peer on a technical topic
  essayTeach: string;   // Organize a campus event to teach

  // Step 4: Socials & Tech Interests
  linkedinUrl: string;
  githubUrl: string;
  blogUrl: string;
  twitterUrl: string;
  portfolioUrl: string;
  skills: string[];

  // Step 5: Resume & Submit
  resume: File | null;
  agreed: boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}

export default function AmbassadorApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkApplied = async () => {
      try {
        const res = await fetch('/api/student-ambassadors/me');
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'PENDING' || data.status === 'APPROVED' || data.status === 'REJECTED') {
            router.push('/dashboard/onboarding');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkApplied();
  }, [router]);

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',

    country: 'India',
    state: '',
    city: '',
    collegeName: '',
    degreeProgram: '',
    gradMonth: '',
    gradYear: '',

    essayWelcome: '',
    essayGuide: '',
    essayTeach: '',

    linkedinUrl: '',
    githubUrl: '',
    blogUrl: '',
    twitterUrl: '',
    portfolioUrl: '',
    skills: [],

    resume: null,
    agreed: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const toggleSkill = (skill: string) => {
    setForm((prev) => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors((prev) => ({ ...prev, resume: 'Only PDF format is supported' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resume: 'File size must be less than 5MB' }));
        return;
      }
      setForm((prev) => ({ ...prev, resume: file }));
      setErrors((prev) => ({ ...prev, resume: undefined }));
    }
  };

  const removeFile = () => {
    setForm((prev) => ({ ...prev, resume: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!form.firstName.trim()) newErrors.firstName = 'First Name is required';
      if (!form.lastName.trim()) newErrors.lastName = 'Last Name is required';
      if (!form.email.trim()) {
        newErrors.email = 'Email Address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'Enter a valid email address';
      }
      if (!form.phone.trim()) {
        newErrors.phone = 'Phone Number is required';
      } else if (!/^\+?[0-9\s-]{10,15}$/.test(form.phone.trim())) {
        newErrors.phone = 'Enter a valid phone number';
      }
      if (!form.dob) newErrors.dob = 'Date of Birth is required';
      if (!form.gender) newErrors.gender = 'Gender is required';
    }

    if (currentStep === 2) {
      if (!form.country.trim()) newErrors.country = 'Country is required';
      if (!form.state.trim()) newErrors.state = 'State is required';
      if (!form.city.trim()) newErrors.city = 'City is required';
      if (!form.collegeName.trim()) newErrors.collegeName = 'College/University Name is required';
      if (!form.degreeProgram.trim()) newErrors.degreeProgram = 'Degree Program is required';
      if (!form.gradMonth) newErrors.gradMonth = 'Graduation Month is required';
      if (!form.gradYear) newErrors.gradYear = 'Graduation Year is required';
    }

    if (currentStep === 3) {
      const welcomeLen = form.essayWelcome.trim().length;

      if (welcomeLen < 150 || welcomeLen > 2000) {
        newErrors.essayWelcome = `Introduction essay must be between 150 and 2000 characters (currently: ${welcomeLen})`;
      }
    }

    if (currentStep === 4) {
      if (!form.linkedinUrl.trim()) {
        newErrors.linkedinUrl = 'LinkedIn profile URL is required';
      } else if (!/^https:\/\/(www\.)?linkedin\.com\/.*$/.test(form.linkedinUrl)) {
        newErrors.linkedinUrl = 'Enter a valid LinkedIn URL';
      }
      if (form.githubUrl && !/^https:\/\/(www\.)?github\.com\/.*$/.test(form.githubUrl)) {
        newErrors.githubUrl = 'Enter a valid GitHub URL';
      }
      if (form.skills.length === 0) {
        newErrors.skills = 'Please select at least one technology interest';
      }
    }

    if (currentStep === 5) {
      if (!form.agreed) newErrors.agreed = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);

    try {
      let resumeBase64 = null;
      let resumeName = null;

      if (form.resume) {
        resumeName = form.resume.name;
        // Read file as base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
        });
        reader.readAsDataURL(form.resume);
        resumeBase64 = await base64Promise;
      }

      const response = await fetch('/api/student-ambassadors/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          resume: undefined, // remove file object
          resumeName,
          resumeBase64,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit application');
      }

      setIsSubmitting(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setErrors((prev) => ({ ...prev, submit: err.message || 'Submission failed' }));
      setIsSubmitting(false);
    }
  };

  return (
    <main 
      className="min-h-screen text-[#111111] pt-32 pb-16 px-6 bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
      style={{ backgroundImage: `url('https://cdn.pixabay.com/photo/2016/11/18/16/23/buildings-1835647_1280.jpg')` }}
    >
      {/* Background Dark Overlay & Blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none" />

      <div className="container mx-auto max-w-[850px] bg-white/95 border border-white/20 rounded-[32px] p-6 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 backdrop-blur-md overflow-hidden">
        
        {/* Step Indicator Top Header */}
        <div className="border-b border-[#ECECEC] pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111]">Ambassador Application</h1>
            <p className="text-[#16A34A] text-xs md:text-sm font-bold mt-1.5 uppercase tracking-wide">
              Welcome Aboard!
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  step === s
                    ? 'bg-[#16A34A] text-white'
                    : step > s
                    ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20'
                    : 'bg-[#FCFBF8] text-slate-400 border border-[#ECECEC]'
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* STEP 1: PERSONAL DETAILS */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-[#111111] flex items-center gap-2">
                <User className="w-5 h-5 text-[#16A34A]" /> Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. John"
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.firstName ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Doe"
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.lastName ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="e.g. john.doe@example.com"
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.email ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 99999 99999"
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.phone ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.dob ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  />
                  {errors.dob && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dob}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender *</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.gender ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-slate-600 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.gender}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ACADEMIC DETAILS */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-[#111111] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#16A34A]" /> Academic Institution Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Country/Region *</label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.country ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.country}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">State/Province *</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleInputChange}
                    placeholder="Delhi"
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.state ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    placeholder="New Delhi"
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.city ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.city}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">College/University Name *</label>
                <input
                  type="text"
                  name="collegeName"
                  value={form.collegeName}
                  onChange={handleInputChange}
                  placeholder="Delhi Technological University"
                  className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.collegeName ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-450 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                {errors.collegeName && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.collegeName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Degree Program & Field of Study *</label>
                <input
                  type="text"
                  name="degreeProgram"
                  value={form.degreeProgram}
                  onChange={handleInputChange}
                  placeholder="B.Tech Computer Science"
                  className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.degreeProgram ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                {errors.degreeProgram && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.degreeProgram}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Graduation Month *</label>
                  <select
                    name="gradMonth"
                    value={form.gradMonth}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.gradMonth ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-slate-650 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  >
                    <option value="">Select Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {errors.gradMonth && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.gradMonth}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Graduation Year *</label>
                  <select
                    name="gradYear"
                    value={form.gradYear}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.gradYear ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-slate-650 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  >
                    <option value="">Select Year</option>
                    {['2026', '2027', '2028', '2029', '2030'].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  {errors.gradYear && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.gradYear}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: ESSAY SECTION (CONSOLIDATED) */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-left"
            >
              <h3 className="text-xl font-bold text-[#111111] flex items-center gap-2 border-b border-[#ECECEC] pb-3">
                <BookOpen className="w-5 h-5 text-[#16A34A]" /> Written/Video Essay Section
              </h3>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Statement of Purpose *
                </label>
                <p className="text-xs text-[#6B7280] mb-3 leading-relaxed">
                  Tell us your story. Introduce yourself, describe your technical journey (projects, coding skills, or interests), and explain how you plan to build a vibrant developer community on your campus as a SARTHI Student Ambassador. (min 150, max 2000 characters).
                </p>
                <textarea
                  name="essayWelcome"
                  rows={8}
                  value={form.essayWelcome}
                  onChange={handleInputChange}
                  placeholder="Introduce yourself, your coding background, event planning ideas, and goals..."
                  className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.essayWelcome ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-semibold">
                  <span>{errors.essayWelcome ? <span className="text-red-500">{errors.essayWelcome}</span> : ''}</span>
                  <span>{form.essayWelcome.trim().length} / 2000 chars</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SOCIALS & PORTFOLIO LINKS */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-[#111111] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#16A34A]" /> Social Links & Technical Interests
              </h3>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">LinkedIn Profile URL *</label>
                <input
                  type="text"
                  name="linkedinUrl"
                  value={form.linkedinUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.linkedinUrl ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                {errors.linkedinUrl && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.linkedinUrl}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">GitHub Profile URL (Optional)</label>
                  <input
                    type="text"
                    name="githubUrl"
                    value={form.githubUrl}
                    onChange={handleInputChange}
                    placeholder="https://github.com/yourprofile"
                    className={`w-full px-5 py-3.5 bg-[#FCFBF8] border ${errors.githubUrl ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                  />
                  {errors.githubUrl && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.githubUrl}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Technical Blog / Medium URL (Optional)</label>
                  <input
                    type="text"
                    name="blogUrl"
                    value={form.blogUrl}
                    onChange={handleInputChange}
                    placeholder="https://medium.com/@username"
                    className="w-full px-5 py-3.5 bg-[#FCFBF8] border border-[#ECECEC] rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Twitter/X URL (Optional)</label>
                  <input
                    type="text"
                    name="twitterUrl"
                    value={form.twitterUrl}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/username"
                    className="w-full px-5 py-3.5 bg-[#FCFBF8] border border-[#ECECEC] rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Portfolio/Website Link (Optional)</label>
                  <input
                    type="text"
                    name="portfolioUrl"
                    value={form.portfolioUrl}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-5 py-3.5 bg-[#FCFBF8] border border-[#ECECEC] rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Technologies of Interest *</label>
                <div className="flex flex-wrap gap-2.5">
                  {SKILLS_OPTIONS.map((skill) => {
                    const isSelected = form.skills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#16A34A]/10 border-[#16A34A] text-[#16A34A]'
                            : 'bg-white border-[#ECECEC] text-[#4B5563] hover:border-slate-350'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
                {errors.skills && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.skills}</p>}
              </div>
            </motion.div>
          )}

          {/* STEP 5: RESUME & SUBMIT */}
          {step === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-[#111111] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#16A34A]" /> Resume & Submission
              </h3>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Resume / CV (Optional)</label>
                <p className="text-xs text-[#6B7280] mb-3">Upload PDF format only (Max size: 5MB).</p>
                
                {!form.resume ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed ${errors.resume ? 'border-red-500/35 bg-red-50/10' : 'border-[#ECECEC] hover:border-[#16A34A]/40 bg-[#FCFBF8]'} rounded-2xl p-6 text-center cursor-pointer transition-colors`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf"
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-[#6B7280] mx-auto mb-2.5" />
                    <span className="text-sm font-semibold text-[#6B7280]">Click to upload or drag & drop</span>
                    <span className="block text-xs text-slate-400 mt-1">PDF format up to 5MB</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white border border-[#ECECEC] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#16A34A]/10 border border-[#16A34A]/20 rounded-lg flex items-center justify-center text-[#16A34A] font-extrabold text-xs">
                        PDF
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111111] truncate max-w-[200px] md:max-w-md">
                          {form.resume.name}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {(form.resume.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="w-8 h-8 rounded-full bg-[#FCFBF8] border border-[#ECECEC] flex items-center justify-center text-[#6B7280] hover:text-red-500 hover:border-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {errors.resume && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.resume}</p>}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreed"
                    checked={form.agreed}
                    onChange={handleCheckboxChange}
                    className={`mt-1 rounded bg-white border ${errors.agreed ? 'border-red-500/50' : 'border-[#ECECEC]'} text-[#16A34A] focus:ring-0 focus:ring-offset-0`}
                  />
                  <span className="text-xs text-[#6B7280] leading-relaxed text-left">
                    I agree to the SARTHI Student Ambassador Terms & Conditions, and certify that all details, essays, and credentials provided in this application are correct.
                  </span>
                </label>
                {errors.agreed && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.agreed}</p>}
              </div>
            </motion.div>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-250 text-red-650 rounded-xl text-xs flex items-center gap-2 mt-4 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Form navigation buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-[#ECECEC]">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-2.5 border border-[#ECECEC] hover:border-[#1A3C2E] rounded-full text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#1A3C2E] transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/student-ambassadors')}
                className="px-6 py-2.5 border border-[#ECECEC] hover:border-[#1A3C2E] rounded-full text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#1A3C2E] transition-all flex items-center gap-1.5"
              >
                Cancel
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#1A3C2E] hover:bg-[#2D6A4F] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            )}
          </div>

        </form>

      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-[#ECECEC] rounded-[32px] p-8 md:p-10 max-w-md w-full text-center relative overflow-hidden shadow-xl"
            >
              <div className="w-16 h-16 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 flex items-center justify-center mx-auto mb-6 text-[#16A34A]">
                <Check className="w-8 h-8" />
              </div>

              <h3 className="text-2xl md:text-3xl font-extrabold text-[#111111] mb-3">
                Application Submitted!
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-8">
                Your application has been logged successfully. The SARTHI community coordinators will review your essays and details shortly. Keep an eye on your email inbox 🚀.
              </p>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/dashboard/ambassador');
                }}
                className="w-full py-3.5 rounded-full bg-[#1A3C2E] text-white font-bold hover:bg-[#2D6A4F] transition-colors"
              >
                Go to Ambassador Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
