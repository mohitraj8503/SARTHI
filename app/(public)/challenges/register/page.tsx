'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Check, AlertCircle, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CHALLENGE_OPTIONS = [
  { id: 'ai-ideathon', title: 'AI & Machine Learning Ideathon' },
  { id: 'kids-coding-olympiad', title: 'Kids National Coding Olympiad (Till 9 - 10 Class)' },
  { id: 'coding-olympiad', title: 'National Coding Olympiad' }
];

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  challengeId: string;
  portfolioUrl: string;
  motivation: string;
  agreed: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  collegeName?: string;
  challengeId?: string;
  agreed?: string;
}

export default function ChallengeRegistrationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    challengeId: '',
    portfolioUrl: '',
    motivation: '',
    agreed: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Pre-select challenge from URL query
  useEffect(() => {
    const challengeIdParam = searchParams.get('challenge');
    if (challengeIdParam && CHALLENGE_OPTIONS.some(c => c.id === challengeIdParam)) {
      setForm(prev => ({ ...prev, challengeId: challengeIdParam }));
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone.replace(/[\s-+]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!form.collegeName.trim()) newErrors.collegeName = 'College/University name is required';
    if (!form.challengeId) newErrors.challengeId = 'Please select a challenge';
    if (!form.agreed) newErrors.agreed = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/challenges/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: form.challengeId,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          collegeName: form.collegeName,
          portfolioUrl: form.portfolioUrl,
          motivation: form.motivation,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to submit registration. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setShowSuccess(true);
    } catch (err) {
      console.error('Registration submission error:', err);
      alert('An unexpected network error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .registration-wrapper {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0b1329;
          color: #1F2937;
          min-height: calc(100vh - 60px);
          position: relative;
          padding: 8rem 2rem 4rem;
        }

        .video-bg-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .video-bg-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
        }

        .video-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(11, 19, 41, 0.35) 0%, rgba(11, 19, 41, 0.65) 100%);
          backdrop-filter: blur(1px);
        }

        .floating-orbs {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }

        .orb {
          position: absolute; border-radius: 50%; opacity: 0.08;
          animation: float 20s infinite ease-in-out;
        }

        .orb-1 { width: 600px; height: 600px; background: #1B4332; top: -200px; right: -100px; }
        .orb-2 { width: 400px; height: 400px; background: #40916C; bottom: -100px; left: -100px; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }

        .form-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          max-width: 680px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
          overflow: hidden;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #ffffff;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 0.625rem 1.25rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          margin-bottom: 2rem;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        }

        .back-btn:hover {
          color: #ffffff;
          background: rgba(27, 67, 50, 0.9);
          border-color: rgba(64, 145, 108, 0.6);
          transform: translateX(-3px);
          box-shadow: 0 6px 20px rgba(27, 67, 50, 0.4);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1F2937;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #E5E7EB;
          border-radius: 14px;
          font-size: 0.95rem;
          font-family: inherit;
          background: white;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #40916C;
          box-shadow: 0 0 0 4px rgba(64, 145, 108, 0.1);
        }

        .error-message {
          color: #EF4444;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .submit-btn {
          width: 100%;
          padding: 1.125rem;
          background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
          color: white;
          border-radius: 16px;
          font-weight: 800;
          font-size: 1rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 10px 25px rgba(27, 67, 50, 0.2);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(27, 67, 50, 0.3);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 640px) {
          .registration-wrapper {
            padding: 6rem 1.5rem 2rem;
          }
          .form-card {
            border-radius: 24px;
          }
        }
      `}</style>

      <div className="video-bg-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="video-bg-element"
        >
          <source src="/videos/challenges-bg.mp4" type="video/mp4" />
          <source src="https://cdn.pixabay.com/video/2025/09/15/304330_large.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>

      <div className="floating-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="max-w-[680px] mx-auto relative z-10">
        <button onClick={() => router.back()} className="back-btn">
          <ArrowLeft size={16} /> Back to Challenges
        </button>

        <div className="form-card p-8 sm:p-10">
          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-8 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
                    <Sparkles size={11} className="fill-emerald-700" /> Challenge Entry
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-[#1B4332]">
                    Register for Challenge
                  </h1>
                  <p className="text-sm text-slate-500 mt-2">
                    Enter your details below to secure your spot and start compiling solutions.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="input-group">
                    <label className="input-label">Select Challenge</label>
                    <select
                      name="challengeId"
                      value={form.challengeId}
                      onChange={handleInputChange}
                      className="form-input text-slate-700"
                    >
                      <option value="">-- Choose a challenge --</option>
                      {CHALLENGE_OPTIONS.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    {errors.challengeId && (
                      <span className="error-message"><AlertCircle size={12} /> {errors.challengeId}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="input-group">
                      <label className="input-label">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="form-input"
                      />
                      {errors.fullName && (
                        <span className="error-message"><AlertCircle size={12} /> {errors.fullName}</span>
                      )}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="form-input"
                      />
                      {errors.email && (
                        <span className="error-message"><AlertCircle size={12} /> {errors.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="input-group">
                      <label className="input-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        className="form-input"
                      />
                      {errors.phone && (
                        <span className="error-message"><AlertCircle size={12} /> {errors.phone}</span>
                      )}
                    </div>

                    <div className="input-group">
                      <label className="input-label">College / University</label>
                      <input
                        type="text"
                        name="collegeName"
                        value={form.collegeName}
                        onChange={handleInputChange}
                        placeholder="IIT Bombay"
                        className="form-input"
                      />
                      {errors.collegeName && (
                        <span className="error-message"><AlertCircle size={12} /> {errors.collegeName}</span>
                      )}
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">GitHub / Portfolio Link (Optional)</label>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={form.portfolioUrl}
                      onChange={handleInputChange}
                      placeholder="https://github.com/johndoe"
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Brief Motivation (Optional)</label>
                    <textarea
                      name="motivation"
                      rows={3}
                      value={form.motivation}
                      onChange={handleInputChange}
                      placeholder="Why do you want to join this challenge?"
                      className="form-input resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-3 mt-4">
                    <input
                      type="checkbox"
                      id="agreed"
                      name="agreed"
                      checked={form.agreed}
                      onChange={handleCheckboxChange}
                      className="mt-1 w-4 h-4 rounded border-gray-300 accent-emerald-600"
                    />
                    <label htmlFor="agreed" className="text-xs text-slate-500 leading-normal cursor-pointer select-none">
                      I agree to abide by the challenge rules, guidelines, and code of conduct. I confirm that all details provided are correct.
                    </label>
                  </div>
                  {errors.agreed && (
                    <span className="error-message"><AlertCircle size={12} /> {errors.agreed}</span>
                  )}

                  <button type="submit" disabled={isSubmitting} className="submit-btn mt-6">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing Entry...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Submit Registration
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full border border-emerald-150 flex items-center justify-center mx-auto mb-6 shadow-md">
                  <Check className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-black text-[#1B4332] tracking-tight">
                  Registration Successful!
                </h1>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-3 leading-relaxed">
                  Congratulations! You have successfully registered for the challenge. We have sent the submission rules and guidelines to your email.
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 max-w-sm mx-auto mt-6 text-left space-y-2.5">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Registration Summary</div>
                  <div className="text-sm font-bold text-slate-700 flex justify-between">
                    <span>Name:</span> <span className="font-extrabold text-slate-900">{form.fullName}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-700 flex justify-between">
                    <span>Challenge:</span> 
                    <span className="font-extrabold text-emerald-800">
                      {CHALLENGE_OPTIONS.find(c => c.id === form.challengeId)?.title}
                    </span>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3">
                  <Link href="/challenges" className="block">
                    <button className="w-full sm:w-auto px-8 py-3 bg-[#1B4332] text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-[#2D6A4F] transition-all">
                      Back to Challenges
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
