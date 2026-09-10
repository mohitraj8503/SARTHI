'use client';

import React, { useState, useRef } from 'react';
import { Loader2, UploadCloud, X, Check, AlertCircle } from 'lucide-react';
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
];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  courseAndYear: string;
  cityState: string;
  linkedinUrl: string;
  githubUrl: string;
  motivation: string;
  skills: string[];
  resume: File | null;
  heardFrom: string;
  agreed: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  collegeName?: string;
  courseAndYear?: string;
  cityState?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  motivation?: string;
  heardFrom?: string;
  agreed?: string;
  resume?: string;
}

export default function RegistrationForm() {
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    courseAndYear: '',
    cityState: '',
    linkedinUrl: '',
    githubUrl: '',
    motivation: '',
    skills: [],
    resume: null,
    heardFrom: '',
    agreed: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
    if (errors[name as keyof FormErrors]) {
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.fullName.trim()) newErrors.fullName = 'Full Name is required';
    
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
    
    if (!form.collegeName.trim()) newErrors.collegeName = 'College/University Name is required';
    if (!form.courseAndYear.trim()) newErrors.courseAndYear = 'Course & Year of Study is required';
    if (!form.cityState.trim()) newErrors.cityState = 'City/State is required';
    
    if (form.linkedinUrl && !/^https:\/\/(www\.)?linkedin\.com\/.*$/.test(form.linkedinUrl)) {
      newErrors.linkedinUrl = 'Enter a valid LinkedIn profile URL';
    }
    
    if (form.githubUrl && !/^https:\/\/(www\.)?github\.com\/.*$/.test(form.githubUrl)) {
      newErrors.githubUrl = 'Enter a valid GitHub profile URL';
    }
    
    const motivationLength = form.motivation.trim().length;
    if (motivationLength < 150 || motivationLength > 500) {
      newErrors.motivation = `Statement must be between 150 and 500 characters (current: ${motivationLength})`;
    }
    
    if (!form.heardFrom) newErrors.heardFrom = 'Please select how you heard about us';
    if (!form.agreed) newErrors.agreed = 'You must agree to the Terms & Conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      console.log('Ambassador Application Submitted Successfully:', form);
      setIsSubmitting(false);
      setShowSuccessModal(true);
      setForm({
        fullName: '',
        email: '',
        phone: '',
        collegeName: '',
        courseAndYear: '',
        cityState: '',
        linkedinUrl: '',
        githubUrl: '',
        motivation: '',
        skills: [],
        resume: null,
        heardFrom: '',
        agreed: false,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1800);
  };

  return (
    <section id="register-form" className="py-24 px-6 bg-white relative">
      <div className="container mx-auto max-w-[850px] relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">Join Us</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#111111] mt-2 mb-4 tracking-tight">
            Apply for the{' '}
            <span className="text-[#16A34A]">
              Ambassador Program
            </span>
          </h2>
          <p className="text-[#6B7280] text-sm md:text-base max-w-xl mx-auto">
            Ready to lead and grow? Fill out the details below. Our team reviews all applications within 7-10 business days.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#FCFBF8] border border-[#ECECEC] rounded-[32px] p-6 md:p-12 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Grid Group 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className={`w-full px-5 py-3.5 bg-white border ${errors.fullName ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="e.g. john.doe@example.com"
                  className={`w-full px-5 py-3.5 bg-white border ${errors.email ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Grid Group 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-2">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 99999 99999"
                  className={`w-full px-5 py-3.5 bg-white border ${errors.phone ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-2">College/University Name *</label>
                <input
                  type="text"
                  name="collegeName"
                  value={form.collegeName}
                  onChange={handleInputChange}
                  placeholder="Delhi Technological University"
                  className={`w-full px-5 py-3.5 bg-white border ${errors.collegeName ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                {errors.collegeName && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.collegeName}
                  </p>
                )}
              </div>
            </div>

            {/* Grid Group 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-2">Course & Year of Study *</label>
                <input
                  type="text"
                  name="courseAndYear"
                  value={form.courseAndYear}
                  onChange={handleInputChange}
                  placeholder="B.Tech Computer Science, 3rd Year"
                  className={`w-full px-5 py-3.5 bg-white border ${errors.courseAndYear ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                {errors.courseAndYear && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.courseAndYear}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-2">City/State *</label>
                <input
                  type="text"
                  name="cityState"
                  value={form.cityState}
                  onChange={handleInputChange}
                  placeholder="New Delhi, Delhi"
                  className={`w-full px-5 py-3.5 bg-white border ${errors.cityState ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                {errors.cityState && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.cityState}
                  </p>
                )}
              </div>
            </div>

            {/* Grid Group 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-2">LinkedIn Profile URL (Optional)</label>
                <input
                  type="text"
                  name="linkedinUrl"
                  value={form.linkedinUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  className={`w-full px-5 py-3.5 bg-white border ${errors.linkedinUrl ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                {errors.linkedinUrl && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.linkedinUrl}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-2">GitHub Profile URL (Optional)</label>
                <input
                  type="text"
                  name="githubUrl"
                  value={form.githubUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                  className={`w-full px-5 py-3.5 bg-white border ${errors.githubUrl ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
                />
                {errors.githubUrl && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.githubUrl}
                  </p>
                )}
              </div>
            </div>

            {/* Skills selection */}
            <div>
              <label className="block text-sm font-semibold text-[#111111] mb-3">Relevant Skills/Interests</label>
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
            </div>

            {/* Motivation statement */}
            <div>
              <label className="block text-sm font-semibold text-[#111111] mb-2">
                Why do you want to become a Student Ambassador? *
              </label>
              <p className="text-xs text-[#6B7280] mb-2">Please explain in 150 to 500 characters. Focus on your interests, goals, and community passion.</p>
              <textarea
                name="motivation"
                rows={5}
                value={form.motivation}
                onChange={handleInputChange}
                placeholder="Write your explanation here..."
                className={`w-full px-5 py-3.5 bg-white border ${errors.motivation ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
              />
              <div className="flex justify-between items-center mt-1.5">
                {errors.motivation ? (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.motivation}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-[11px] font-bold text-[#6B7280]">
                  {form.motivation.trim().length} / 500 chars
                </span>
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-semibold text-[#111111] mb-2">Resume / CV (Optional)</label>
              <p className="text-xs text-[#6B7280] mb-3">Upload PDF format only (Max size: 5MB).</p>
              
              {!form.resume ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed ${errors.resume ? 'border-red-500/35 bg-red-50/10' : 'border-[#ECECEC] hover:border-[#16A34A]/40 bg-white'} rounded-2xl p-6 text-center cursor-pointer transition-colors`}
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
              {errors.resume && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.resume}
                </p>
              )}
            </div>

            {/* Referrals dropdown */}
            <div>
              <label className="block text-sm font-semibold text-[#111111] mb-2">How did you hear about us? *</label>
              <select
                name="heardFrom"
                value={form.heardFrom}
                onChange={handleInputChange}
                className={`w-full px-5 py-3.5 bg-white border ${errors.heardFrom ? 'border-red-500/50' : 'border-[#ECECEC]'} rounded-xl text-[#4B5563] focus:outline-none focus:border-[#16A34A]/55 transition-colors`}
              >
                <option value="">Select an option</option>
                <option value="Social Media">Social Media</option>
                <option value="Friend">Friend / Word of Mouth</option>
                <option value="College">College Club / Faculty</option>
                <option value="Event">Event / Hackathon</option>
                <option value="Other">Other</option>
              </select>
              {errors.heardFrom && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.heardFrom}
                </p>
              )}
            </div>

            {/* T&C Checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreed"
                  checked={form.agreed}
                  onChange={handleCheckboxChange}
                  className={`mt-1 rounded bg-white border ${errors.agreed ? 'border-red-500/50' : 'border-[#ECECEC]'} text-[#16A34A] focus:ring-0 focus:ring-offset-0`}
                />
                <span className="text-xs text-[#6B7280] leading-relaxed">
                  I agree to the SARTHI Student Ambassador Terms & Conditions, and consent to receiving communication regarding the recruitment process.
                </span>
              </label>
              {errors.agreed && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.agreed}
                </p>
              )}
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[#16A34A] hover:bg-[#2D6A4F] text-white font-bold tracking-wider uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>
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
                Application Received!
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-8">
                You&apos;ve registered successfully! Get ready — your challenge is on its way 🚀. Keep an eye on your email inbox.
              </p>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3.5 rounded-xl bg-[#111111] text-white font-bold hover:bg-[#16A34A] transition-colors"
              >
                Awesome
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
