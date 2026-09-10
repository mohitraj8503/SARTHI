'use client';

import { useState } from 'react';
import {
    X,
    Sparkles,
    Award,
    Target,
    Layers,
    Clock,
    DollarSign,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

interface CertificationCreateModalProps {
    open: boolean;
    onClose: () => void;
}

export function CertificationCreateModal({ open, onClose }: CertificationCreateModalProps) {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        level: 'Intermediate',
        price: 39,
        durationMinutes: 45,
        passingScore: 80,
        description: '',
        publishImmediately: false
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            if (!data.title) {
                throw new Error('Certification title is required');
            }
            const res = await fetch('/api/admin/certification-exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    difficulty: data.level,
                    duration: data.durationMinutes,
                    status: data.publishImmediately ? 'PUBLISHED' : 'DRAFT'
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create certification');
            }
            return res.json();
        },
        onSuccess: (newCert) => {
            addToast({ message: 'Certification created successfully!', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['admin-certifications'] });
            queryClient.invalidateQueries({ queryKey: ['admin-certifications-summary'] });
            onClose();
            // router.push(`/admin/certification-exams/${newCert.id}/manage`);
        },
        onError: (err: Error) => {
            addToast({ message: err.message, type: 'error' });
        }
    });

    if (!open) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden relative z-10 p-10 max-h-[90vh] overflow-y-auto admin-scrollbar"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-brand-orange">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-[11px] font-black uppercase tracking-[0.25em]">Credential Creation Portal</span>
                            </div>
                            <h2 className="text-[32px] font-bold text-brand-dark tracking-tight leading-none">Draft New Certification</h2>
                            <p className="text-[14px] text-slate-400 font-medium italic">Architect a high-fidelity assessment for global professionals.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-brand-dark transition-all border border-slate-100"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-8">
                        {/* Core Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 col-span-full">
                                <label className="text-[11px] font-black text-brand-dark uppercase tracking-widest pl-1">Title *</label>
                                <div className="relative group">
                                    <Award className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-dark transition-colors" />
                                    <input
                                        required
                                        placeholder="e.g. Professional Cloud Architect"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 focus:border-brand-dark rounded-[24px] outline-none text-[15px] font-bold text-brand-dark transition-all placeholder:text-slate-300 placeholder:font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-brand-dark uppercase tracking-widest pl-1">Level *</label>
                                <div className="relative group">
                                    <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />
                                    <select
                                        required
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 focus:border-brand-dark rounded-[24px] outline-none text-[15px] font-bold text-brand-dark appearance-none transition-all"
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Professional</option>
                                        <option>Expert</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-brand-dark uppercase tracking-widest pl-1">Duration (Mins) *</label>
                                <div className="relative group">
                                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />
                                    <input
                                        type="number"
                                        required
                                        value={formData.durationMinutes}
                                        onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 focus:border-brand-dark rounded-[24px] outline-none text-[15px] font-bold text-brand-dark transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Metrics Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-brand-dark uppercase tracking-widest pl-1">Price (INR)</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-dark transition-colors" />
                                    <input
                                        type="number"
                                        placeholder="39"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 focus:border-brand-dark rounded-[24px] outline-none text-[15px] font-bold text-brand-dark transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-brand-dark uppercase tracking-widest pl-1">Passing Score (%)</label>
                                <div className="relative group">
                                    <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.passingScore}
                                        onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 focus:border-brand-dark rounded-[24px] outline-none text-[15px] font-bold text-brand-dark transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-brand-dark uppercase tracking-widest pl-1">Description</label>
                            <textarea
                                rows={4}
                                placeholder="Describe the scope and impact of this certification..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-8 bg-slate-50 border-2 border-slate-100 focus:border-brand-dark rounded-[32px] outline-none text-[14px] font-medium text-brand-dark transition-all placeholder:text-slate-300"
                            />
                        </div>

                        <div className="h-[1px] bg-slate-100" />

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <div className="relative w-12 h-6">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.publishImmediately}
                                        onChange={(e) => setFormData({ ...formData, publishImmediately: e.target.checked })}
                                    />
                                    <div className="w-12 h-6 bg-slate-200 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[13px] font-bold text-brand-dark">Publish Immediately?</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mark as Live upon creation</p>
                                </div>
                            </label>

                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 sm:flex-none px-8 py-4 text-slate-400 font-bold text-[12px] uppercase tracking-widest hover:text-brand-dark transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-5 bg-brand-dark text-white rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-brand-dark/20 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                    {formData.publishImmediately ? 'Commission Cert' : 'Save Draft'}
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

