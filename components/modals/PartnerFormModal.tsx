'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle2, 
    Building2, 
    MapPin, 
    Users2, 
    Lightbulb,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface PartnerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STEPS = [
    { id: 'basic', title: 'Basic Info', icon: Building2 },
    { id: 'location', title: 'Location', icon: MapPin },
    { id: 'capacity', title: 'Capacity', icon: Users2 },
    { id: 'intent', title: 'Intent', icon: Lightbulb },
];

export default function PartnerFormModal({ isOpen, onClose }: PartnerFormModalProps) {
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        organization: '',
        type: 'School',
        state: '',
        district: '',
        areaType: 'Rural',
        students: '',
        infra: [] as string[],
        intent: ''
    });

    const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const handlePrev = () => setStep(s => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/public/partner-request', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            
            if (res.ok) {
                setIsSuccess(true);
                toast.success("Application submitted successfully!");
            } else {
                toast.error("Failed to submit application. Please try again.");
            }
        } catch (err) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleInfra = (item: string) => {
        setFormData(prev => ({
            ...prev,
            infra: prev.infra.includes(item) 
                ? prev.infra.filter(i => i !== item)
                : [...prev.infra, item]
        }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-[2rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-black/5"
                >
                    {/* Header Banner */}
                    <div className="h-32 bg-[#1A3C2E] relative flex items-end p-8">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white tracking-tight font-outfit">
                                Partner With SARTHI
                            </h2>
                            <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                                Institutional Onboarding Portal
                            </p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {!isSuccess ? (
                        <div className="p-8">
                            {/* Step Indicators */}
                            <div className="flex items-center gap-2 mb-10">
                                {STEPS.map((s, i) => (
                                    <React.Fragment key={s.id}>
                                        <div className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                                            i === step ? "bg-[#10B981]/10 text-[#10B981]" : "text-[#1A3C2E]/20"
                                        )}>
                                            <s.icon className={cn("w-4 h-4", i === step ? "opacity-100" : "opacity-40")} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{s.title}</span>
                                        </div>
                                        {i < STEPS.length - 1 && <div className="h-px flex-1 bg-black/5" />}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Form Content */}
                            <div className="min-h-[360px]">
                                {step === 0 && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <Input label="Full Name" value={formData.name} onChange={v => setFormData(d => ({ ...d, name: v }))} placeholder="Enter your name" />
                                            <Input label="Professional Email" value={formData.email} onChange={v => setFormData(d => ({ ...d, email: v }))} placeholder="name@organization.com" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <Input label="Phone Number" value={formData.phone} onChange={v => setFormData(d => ({ ...d, phone: v }))} placeholder="+91 ..." />
                                            <Input label="Organization Name" value={formData.organization} onChange={v => setFormData(d => ({ ...d, organization: v }))} placeholder="e.g. KV School" />
                                        </div>
                                        <Select 
                                            label="Organization Type" 
                                            value={formData.type} 
                                            options={['School', 'College', 'NGO', 'Training Center', 'Individual']} 
                                            onChange={v => setFormData(d => ({ ...d, type: v }))} 
                                        />
                                    </motion.div>
                                )}

                                {step === 1 && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <Input label="State" value={formData.state} onChange={v => setFormData(d => ({ ...d, state: v }))} placeholder="State" />
                                            <Input label="District" value={formData.district} onChange={v => setFormData(d => ({ ...d, district: v }))} placeholder="District" />
                                        </div>
                                        <Select 
                                            label="Geographic Area" 
                                            value={formData.areaType} 
                                            options={['Rural', 'Semi-Urban', 'Urban']} 
                                            onChange={v => setFormData(d => ({ ...d, areaType: v }))} 
                                        />
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                        <Input label="Student Reach (Approx.)" value={formData.students} onChange={v => setFormData(d => ({ ...d, students: v }))} placeholder="e.g. 500+" />
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#1A3C2E]/30 mb-4 block">Infrastructure Availability</label>
                                            <div className="flex flex-wrap gap-3">
                                                {['Computer Lab', 'Internet', 'Projector', 'Classroom', 'Power Backup'].map(item => (
                                                    <button
                                                        key={item}
                                                        onClick={() => toggleInfra(item)}
                                                        className={cn(
                                                            "px-6 py-3 rounded-2xl border text-[11px] font-bold transition-all",
                                                            formData.infra.includes(item) 
                                                                ? "bg-[#10B981] text-white border-[#10B981] shadow-lg shadow-[#10B981]/20" 
                                                                : "bg-white border-black/5 text-[#1A3C2E]/40 hover:border-black/10"
                                                        )}
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#1A3C2E]/30 mb-4 block">Collaboration Intent</label>
                                            <textarea 
                                                value={formData.intent}
                                                onChange={e => setFormData(d => ({ ...d, intent: e.target.value }))}
                                                className="w-full bg-[#f8f8f6] border border-black/5 rounded-[2rem] p-6 text-sm text-[#1A3C2E] outline-none focus:bg-white focus:ring-4 focus:ring-[#10B981]/5 focus:border-[#10B981]/20 transition-all min-h-[180px] font-medium"
                                                placeholder="Tell us why you'd like to partner with SARTHI..."
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-8">
                                <button 
                                    onClick={handlePrev}
                                    disabled={step === 0}
                                    className="flex items-center gap-2 text-[#1A3C2E]/30 hover:text-[#1A3C2E] disabled:opacity-0 transition-all font-bold uppercase tracking-widest text-[11px]"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                                
                                {step < STEPS.length - 1 ? (
                                    <button 
                                        onClick={handleNext}
                                        className="bg-[#1A3C2E] text-white px-10 py-4 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                                    >
                                        Continue
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-[#10B981] text-white px-10 py-4 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#10B981]/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : 'Submit Partnership Application'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-16 text-center flex flex-col items-center">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 border border-emerald-100"
                            >
                                <CheckCircle2 className="w-12 h-12 text-[#10B981]" />
                            </motion.div>
                            <h3 className="text-3xl font-bold text-[#1A3C2E] font-outfit">Application Submitted</h3>
                            <p className="text-[#1A3C2E]/50 mt-4 max-w-sm font-medium leading-relaxed">
                                Your partnership request has been recorded. Our team will review your profile and reach out within 24–48 hours.
                            </p>
                            <button 
                                onClick={onClose}
                                className="mt-12 bg-[#1A3C2E] text-white px-12 py-4 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                                Close Portal
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function Input({ label, value, onChange, placeholder }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#1A3C2E]/30 px-1">{label}</label>
            <input 
                type="text" 
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#f8f8f6] border border-black/5 rounded-2xl px-6 py-4 text-sm text-[#1A3C2E] outline-none focus:bg-white focus:ring-4 focus:ring-[#10B981]/5 focus:border-[#10B981]/20 transition-all font-medium placeholder:text-[#1A3C2E]/20"
            />
        </div>
    );
}

function Select({ label, value, options, onChange }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#1A3C2E]/30 px-1">{label}</label>
            <div className="flex flex-wrap gap-3">
                {options.map((opt: string) => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={cn(
                            "px-6 py-3 rounded-2xl border text-[11px] font-bold transition-all",
                            value === opt 
                                ? "bg-[#1A3C2E] text-white border-[#1A3C2E] shadow-lg" 
                                : "bg-[#f8f8f6] border-transparent text-[#1A3C2E]/40 hover:bg-black/5"
                        )}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}
