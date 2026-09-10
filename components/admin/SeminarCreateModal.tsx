'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    X,
    Calendar,
    Video,
    Users,
    Type,
    Shield,
    Globe,
    ChevronDown,
    Loader2,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';

interface SeminarCreateModalProps {
    open: boolean;
    onClose: () => void;
}

export function SeminarCreateModal({ open, onClose }: SeminarCreateModalProps) {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: '',
        type: 'Workshop',
        scheduledAtDate: '',
        scheduledAtTime: '',
        durationMinutes: 60,
        instructorId: '',
        description: '',
        maxAttendees: 500,
        isPrivate: false,
        meetLink: '',
        youtubeVideoId: '',
        streamingPlatform: 'YOUTUBE' as 'YOUTUBE' | 'GOOGLE_MEET',
        tags: [] as string[]
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const scheduledAt = `${data.scheduledAtDate}T${data.scheduledAtTime}:00`;
            const res = await fetch('/api/admin/seminars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    scheduledAt,
                    durationMinutes: data.durationMinutes,
                    instructorId: data.instructorId || undefined,
                    maxAttendees: data.maxAttendees,
                    isPrivate: data.isPrivate,
                    meetLink: data.meetLink,
                    youtubeVideoId: data.youtubeVideoId,
                    streamingPlatform: data.streamingPlatform,
                    tags: data.tags,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to schedule seminar');
            }
            return res.json();
        },
        onSuccess: () => {
            addToast({ message: 'Seminar meticulously scheduled', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['admin-seminars'] });
            onClose();
        },
        onError: (err: Error) => {
            addToast({ message: err.message, type: 'error' });
        }
    });

    const instructors = [
        { id: 'instructor_arindam_mondal', name: 'Industry Expert' },
        { id: 'instructor_shailesh_sir', name: 'Industry Expert' },
        { id: 'instructor_mohit_raj', name: 'Mohit Raj' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.scheduledAtDate || !formData.scheduledAtTime) {
            addToast({ message: 'Please complete all required fields', type: 'error' });
            return;
        }
        createMutation.mutate(formData);
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#1C2B4A]/60 backdrop-blur-md z-[110]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[32px] shadow-2xl z-[111] overflow-hidden flex flex-col max-h-[90vh] border border-[#E2E8F4]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-[#F0F2F8] flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-[#E8B84B]/10 text-[#E8B84B] rounded-xl">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-[20px] font-bold text-[#1C2B4A]">Schedule New Seminar</h2>
                                </div>
                                <p className="text-[12px] text-[#7A8FAF] font-medium pl-9">Orchestrate a premium live learning event for your students.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-[#7A8FAF] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 admin-scrollbar">
                            {/* Event Concept */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-extrabold text-[#7A8FAF] uppercase tracking-[0.2em] flex items-center gap-2 border-b border-[#F0F2F8] pb-3">
                                    <Type className="w-4 h-4" /> 01. Event Concept
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider block ml-1">Title (Required)</label>
                                        <input
                                            required
                                            placeholder="e.g. Advanced System Architecture Masterclass"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-6 py-4 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] text-[#1C2B4A] font-bold focus:border-[#1C2B4A] outline-none transition-all placeholder:font-medium placeholder:opacity-40"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider block ml-1">Type</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.type}
                                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                    className="w-full px-6 py-4 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] text-[#1C2B4A] font-bold focus:border-[#1C2B4A] outline-none appearance-none transition-all"
                                                >
                                                    <option>Workshop</option>
                                                    <option>Webinar</option>
                                                    <option>Masterclass</option>
                                                    <option>Q&A Session</option>
                                                </select>
                                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8FAF] pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider block ml-1">Instructor</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.instructorId}
                                                    onChange={e => setFormData({ ...formData, instructorId: e.target.value })}
                                                    className="w-full px-6 py-4 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] text-[#1C2B4A] font-bold focus:border-[#1C2B4A] outline-none appearance-none transition-all"
                                                >
                                                    <option value="">Select Instructor</option>
                                                    {instructors.map(teach => (
                                                        <option key={teach.id} value={teach.id}>{teach.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8FAF] pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Execution Details */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-extrabold text-[#7A8FAF] uppercase tracking-[0.2em] flex items-center gap-2 border-b border-[#F0F2F8] pb-3">
                                    <Calendar className="w-4 h-4" /> 02. Execution Details
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider block ml-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.scheduledAtDate}
                                            onChange={e => setFormData({ ...formData, scheduledAtDate: e.target.value })}
                                            className="w-full px-6 py-4 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] text-[#1C2B4A] font-bold outline-none focus:border-[#1C2B4A]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider block ml-1">Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.scheduledAtTime}
                                            onChange={e => setFormData({ ...formData, scheduledAtTime: e.target.value })}
                                            className="w-full px-6 py-4 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] text-[#1C2B4A] font-bold outline-none focus:border-[#1C2B4A]"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 lg:col-span-1">
                                        <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider block ml-1">Duration (Min)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.durationMinutes}
                                            onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                            className="w-full px-6 py-4 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] text-[#1C2B4A] font-bold outline-none focus:border-[#1C2B4A]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider block ml-1">Streaming Platform</label>
                                        <div className="relative">
                                            <select
                                                value={formData.streamingPlatform}
                                                onChange={e => setFormData({ ...formData, streamingPlatform: e.target.value as any })}
                                                className="w-full px-6 py-4 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] text-[#1C2B4A] font-bold focus:border-[#1C2B4A] outline-none appearance-none"
                                            >
                                                <option value="YOUTUBE">YouTube Live</option>
                                                <option value="GOOGLE_MEET">Google Meet</option>
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8FAF] pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider block ml-1">
                                            {formData.streamingPlatform === 'YOUTUBE' ? 'YouTube Video ID' : 'Meet Link'}
                                        </label>
                                        <input
                                            placeholder={formData.streamingPlatform === 'YOUTUBE' ? 'e.g. dQw4w9WgXcQ' : 'https://meet.google.com/...'}
                                            value={formData.streamingPlatform === 'YOUTUBE' ? formData.youtubeVideoId : formData.meetLink}
                                            onChange={e => setFormData({
                                                ...formData,
                                                [formData.streamingPlatform === 'YOUTUBE' ? 'youtubeVideoId' : 'meetLink']: e.target.value
                                            })}
                                            className="w-full px-6 py-4 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] text-[#1C2B4A] font-bold outline-none focus:border-[#1C2B4A]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Publish Status */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-extrabold text-[#7A8FAF] uppercase tracking-[0.2em] flex items-center gap-2 border-b border-[#F0F2F8] pb-3">
                                    <Sparkles className="w-4 h-4" /> 03. Initialization Status
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['DRAFT', 'SCHEDULED', 'REGISTRATION_OPEN'].map(statusOption => (
                                        <button
                                            key={statusOption}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, status: statusOption }))}
                                            className={cn(
                                                "p-4 rounded-2xl border text-left transition-all",
                                                (formData as any).status === statusOption
                                                    ? "bg-[#1C2B4A] border-[#1C2B4A] text-white shadow-lg"
                                                    : "bg-white border-[#E2E8F4] text-[#1C2B4A] hover:border-[#1C2B4A]"
                                            )}
                                        >
                                            <span className="text-[11px] font-bold uppercase tracking-widest block mb-1">
                                                {statusOption === 'DRAFT' ? 'Save as Draft' : statusOption === 'SCHEDULED' ? 'Schedule for Later' : 'Publish & Open Registration'}
                                            </span>
                                            <span className={cn("text-[10px]", (formData as any).status === statusOption ? "text-[#A8B8D8]" : "text-[#7A8FAF]")}>
                                                {statusOption === 'DRAFT' ? 'Hidden from public' : statusOption === 'SCHEDULED' ? 'Visible, registration closed' : 'Visible, registration open'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Advanced Config */}
                            <div className="space-y-6 pb-4">
                                <h3 className="text-[11px] font-extrabold text-[#7A8FAF] uppercase tracking-[0.2em] flex items-center gap-2 border-b border-[#F0F2F8] pb-3">
                                    <Shield className="w-4 h-4" /> 03. Advanced Control
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 text-center p-6 bg-[#F8F9FC]/50 rounded-3xl border border-[#E2E8F4]">
                                        <Globe className="w-6 h-6 text-[#7A8FAF] mx-auto mb-2" />
                                        <h4 className="text-[13px] font-bold text-[#1C2B4A]">Public Visibility</h4>
                                        <p className="text-[11px] text-[#7A8FAF] mb-4">Visible to all visitors.</p>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                                            className={cn(
                                                "w-full py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all",
                                                !formData.isPrivate ? "bg-[#1C2B4A] text-white" : "bg-white border border-[#E2E8F4] text-[#7A8FAF]"
                                            )}
                                        >
                                            {!formData.isPrivate ? 'Public Active' : 'Make Public'}
                                        </button>
                                    </div>
                                    <div className="space-y-2 text-center p-6 bg-[#F8F9FC]/50 rounded-3xl border border-[#E2E8F4]">
                                        <Users className="w-6 h-6 text-[#7A8FAF] mx-auto mb-2" />
                                        <h4 className="text-[13px] font-bold text-[#1C2B4A]">Total Capacity</h4>
                                        <div className="flex items-center justify-center gap-3">
                                            <button type="button" onClick={() => setFormData(p => ({ ...p, maxAttendees: Math.max(10, p.maxAttendees - 50) }))} className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F4] text-[#1C2B4A] font-bold">-</button>
                                            <span className="text-[16px] font-black text-[#1C2B4A] min-w-[60px]">{formData.maxAttendees}</span>
                                            <button type="button" onClick={() => setFormData(p => ({ ...p, maxAttendees: p.maxAttendees + 50 }))} className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F4] text-[#1C2B4A] font-bold">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="p-8 border-t border-[#F0F2F8] bg-[#F8F9FC]/50 flex items-center justify-between gap-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-4 text-[#7A8FAF] text-[12px] font-bold uppercase tracking-widest hover:text-[#1C2B4A] transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={createMutation.isPending}
                                className="flex-1 flex items-center justify-center gap-2 px-10 py-4 bg-[#1C2B4A] text-white rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#2C3E5F] transition-all shadow-xl shadow-[#1C2B4A]/20 disabled:opacity-50"
                            >
                                {createMutation.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Schedule Seminar <CheckCircle2 className="w-4 h-4 ml-1" /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

