'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, ChevronLeft, Phone, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function StudentApplicationPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', age: '', district: '', phone: '',
    school: '', grade: '', literacyLevel: 'Basic',
    whyApply: '', careerGoals: '',
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    { title: 'Identity', fields: ['name', 'age', 'district', 'phone'] },
    { title: 'Education', fields: ['school', 'grade'] },
    { title: 'Motivation', fields: ['whyApply', 'careerGoals'] },
    { title: 'Verification', fields: ['consent'] }
  ];
  
  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep(5); // Success
    } catch (error) {
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-24">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back button */}
        <Link href="/rural-initiative" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />
            Back to Initiative
        </Link>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-16 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          {steps.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500
                ${step > i + 1 ? 'bg-emerald-600 text-white' : 
                  step === i + 1 ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 
                  'bg-white text-slate-400 border border-slate-200'}`}
              >
                {step > i + 1 ? <Check className="w-5 h-5 stroke-[3]" /> : i + 1}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${step === i + 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
        
        {/* Form Content */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-900/5 border border-slate-100">
          {step === 5 ? (
            <div className="text-center space-y-8 py-12">
              <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Check className="w-10 h-10 text-emerald-600 stroke-[3]" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Application Received!</h2>
                <p className="text-slate-500 font-medium">
                  We&apos;ll review your details and contact you within 5 business days for a verification call.
                </p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 text-left space-y-4">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Next Steps:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                    <span className="text-sm text-slate-600 font-medium">Verification call from our district coordinator</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                    <span className="text-sm text-slate-600 font-medium">Eligibility assessment at Government High School</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                    <span className="text-sm text-slate-600 font-medium">Enrollment confirmation and lab schedule</span>
                  </li>
                </ul>
              </div>
              <div className="pt-8">
                <Link 
                  href="/rural-initiative"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                >
                  Return to Initiative Page
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Step {step} of 4</p>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{steps[step - 1].title} Details</h2>
              </div>
              
              <div className="space-y-6">
                {step === 1 && (
                    <div className="grid gap-6">
                        <InputGroup label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="As per school records" />
                        <div className="grid sm:grid-cols-2 gap-6">
                            <InputGroup label="Age" type="number" value={formData.age} onChange={v => setFormData({...formData, age: v})} placeholder="e.g. 17" />
                            <InputGroup label="District" value={formData.district} onChange={v => setFormData({...formData, district: v})} placeholder="e.g. Madhubani" />
                        </div>
                        <InputGroup label="Phone Number" type="tel" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="+91 00000 00000" />
                    </div>
                )}

                {step === 2 && (
                    <div className="grid gap-6">
                        <InputGroup label="School Name" value={formData.school} onChange={v => setFormData({...formData, school: v})} placeholder="e.g. Govt High School, Madhubani" />
                        <InputGroup label="Current Grade / Qualification" value={formData.grade} onChange={v => setFormData({...formData, grade: v})} placeholder="e.g. Class 11" />
                    </div>
                )}

                {step === 3 && (
                    <div className="grid gap-6">
                        <TextareaGroup label="Why do you want to learn digital skills?" value={formData.whyApply} onChange={v => setFormData({...formData, whyApply: v})} placeholder="Tell us about your interest in computers..." />
                        <TextareaGroup label="What are your future career goals?" value={formData.careerGoals} onChange={v => setFormData({...formData, careerGoals: v})} placeholder="What do you want to become?" />
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-8">
                        <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex gap-4">
                            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                            <div className="space-y-3">
                                <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Consent & Verification</p>
                                <p className="text-sm text-emerald-700/80 font-medium leading-relaxed">
                                    By submitting, I confirm that the information provided is correct. I agree to be contacted by SARTHI district coordinators for program verification.
                                </p>
                                <label className="flex items-center gap-3 pt-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.consent} 
                                        onChange={e => setFormData({...formData, consent: e.target.checked})}
                                        className="w-5 h-5 rounded-lg border-2 border-emerald-200 text-emerald-600 focus:ring-emerald-500 transition-all"
                                    />
                                    <span className="text-xs font-black text-emerald-900 uppercase tracking-widest">I Agree to the Terms</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="flex items-center gap-2 px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors disabled:opacity-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || (step === 4 && !formData.consent)}
                  className="flex items-center gap-2 px-10 py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : step === 4 ? 'Complete Application' : 'Next Step'}
                  {!isSubmitting && step < 4 && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Help footer */}
        <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Need help applying?</p>
                    <p className="text-sm font-black text-slate-900">Call: +91-7061600818</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder, type = 'text' }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input 
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all"
            />
        </div>
    );
}

function TextareaGroup({ label, value, onChange, placeholder }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <textarea 
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required
                rows={4}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] px-8 py-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all resize-none"
            />
        </div>
    );
}
