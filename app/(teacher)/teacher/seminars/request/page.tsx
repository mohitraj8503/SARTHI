'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, Plus, Video, Users,
    X, ArrowLeft, Loader2, Send, Info, Tag, User, BookOpen
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function SeminarRequestPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        topic: '',
        description: '',
        whyUseful: '',
        proposedAt: '',
        proposedDuration: '60 minutes',
        targetAudience: 'Beginner to Intermediate',
        speakerName: '',
        tags: '',
        resources: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/seminars/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                }),
            });

            if (!res.ok) throw new Error('Failed to submit request');

            addToast({ message: 'Seminar request submitted successfully', type: 'success' });
            setSubmitted(true);
        } catch (error: any) {
            addToast({ message: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-8"
                >
                    <CheckCircle className="w-10 h-10" />
                </motion.div>
                <h2 className="text-3xl font-bold text-[#1A3C2E] mb-4">Request Received!</h2>
                <p className="text-[#5D705C] max-w-md mx-auto mb-10 leading-relaxed font-medium">
                    Your seminar proposal has been sent to the admin team for review.
                    You can track the live status on your educator dashboard.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/teacher/dashboard')}
                        className="btn-teacher-primary px-10 py-4"
                    >
                        GO TO DASHBOARD
                    </button>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="btn-teacher-outline px-10 py-4"
                    >
                        NEW REQUEST
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white border border-[#E8E2D9] rounded-2xl text-[#5D705C] hover:text-[#1A3C2E] hover:border-[#2D6A4F] transition-all no-transform"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-[32px] font-bold text-[#1A3C2E] tracking-tight leading-none">Request Seminar</h1>
                        <p className="text-[#5D705C] font-medium mt-1 uppercase text-[10px] tracking-widest">Share knowledge with the community</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="teacher-card p-10 space-y-8">
                        {/* Title Section */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-[#5D705C] uppercase tracking-[2px] flex items-center gap-2">
                                <Video className="w-3.5 h-3.5" /> Seminar Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Masterclass: Future of AI in Modern Education"
                                className="teacher-input w-full text-lg py-4"
                            />
                        </div>

                        {/* Grid Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#5D705C] uppercase tracking-[2px] flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5" /> Topic / Category *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.topic}
                                    onChange={e => setForm({ ...form, topic: e.target.value })}
                                    placeholder="e.g. Artificial Intelligence"
                                    className="teacher-input w-full"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#5D705C] uppercase tracking-[2px] flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Speaker Name
                                </label>
                                <input
                                    type="text"
                                    value={form.speakerName}
                                    onChange={e => setForm({ ...form, speakerName: e.target.value })}
                                    placeholder="Leave blank to use your profile"
                                    className="teacher-input w-full"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-[#5D705C] uppercase tracking-[2px] flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5" /> Short Description *
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Tell us what this seminar is about..."
                                className="teacher-input w-full resize-none leading-relaxed"
                            />
                        </div>

                        {/* Why Useful */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-[#5D705C] uppercase tracking-[2px] flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" /> Why is this useful for students? *
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={form.whyUseful}
                                onChange={e => setForm({ ...form, whyUseful: e.target.value })}
                                placeholder="Define the primary outcome or value..."
                                className="teacher-input w-full resize-none leading-relaxed"
                            />
                        </div>

                        {/* Schedule Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#5D705C] uppercase tracking-[2px] flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> Proposed Date/Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={form.proposedAt}
                                    onChange={e => setForm({ ...form, proposedAt: e.target.value })}
                                    className="teacher-input w-full"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#5D705C] uppercase tracking-[2px] flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" /> Duration *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.proposedDuration}
                                    onChange={e => setForm({ ...form, proposedDuration: e.target.value })}
                                    placeholder="e.g. 60 minutes"
                                    className="teacher-input w-full"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#5D705C] uppercase tracking-[2px] flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Target Audience *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.targetAudience}
                                    onChange={e => setForm({ ...form, targetAudience: e.target.value })}
                                    placeholder="e.g. All Students"
                                    className="teacher-input w-full"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-[#5D705C] uppercase tracking-[2px] flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5" /> Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={e => setForm({ ...form, tags: e.target.value })}
                                placeholder="React, Career, Industry..."
                                className="teacher-input w-full"
                            />
                        </div>

                        {/* Resources */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-[#5D705C] uppercase tracking-[2px] flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" /> Resources / Notes (Optional)
                            </label>
                            <textarea
                                rows={2}
                                value={form.resources}
                                onChange={e => setForm({ ...form, resources: e.target.value })}
                                placeholder="Any links or files to be shared..."
                                className="teacher-input w-full resize-none leading-relaxed"
                            />
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-teacher-primary py-5 text-base font-bold flex items-center justify-center gap-3 shadow-xl"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                                SUBMIT SEMINAR REQUEST
                            </button>
                        </div>
                    </div>
                </form>

                {/* Sidebar Info */}
                <aside className="space-y-6">
                    <div className="teacher-card p-6 bg-[#E8F5EE] border-[#C5D5C0]">
                        <h4 className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-[2px] mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4" /> Policy
                        </h4>
                        <ul className="space-y-3">
                            {[
                                'Always Free & Public',
                                'Admin Controlled',
                                'YouTube Centralized',
                                'No Direct Publishing'
                            ].map(item => (
                                <li key={item} className="flex items-center gap-2 text-[13px] text-[#1A3C2E] font-medium">
                                    <CheckCircle className="w-3.5 h-3.5 text-[#2D6A4F]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="teacher-card p-6 border-dashed">
                        <h4 className="text-[11px] font-bold text-[#1A3C2E] uppercase tracking-[2px] mb-3">What Happens Next?</h4>
                        <div className="space-y-4">
                            {[
                                { step: '1', text: 'Admin reviews your proposal for topic fit.' },
                                { step: '2', text: 'If approved, admin schedules the official slot.' },
                                { step: '3', text: 'Broadcast link & instructions shared with you.' },
                                { step: '4', text: 'You go live! Platform handles the rest.' }
                            ].map(({ step, text }) => (
                                <div key={step} className="flex gap-3">
                                    <span className="w-5 h-5 rounded-full bg-[#1A3C2E] text-white text-[10px] flex items-center justify-center shrink-0 font-bold">{step}</span>
                                    <p className="text-[12px] text-[#5D705C] leading-relaxed font-medium">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function CheckCircle({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

