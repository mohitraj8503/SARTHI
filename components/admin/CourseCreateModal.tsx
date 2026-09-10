'use client';

import { useState, useEffect } from 'react';
import {
    X,
    Sparkles,
    BookOpen,
    Layers,
    User,
    Layout,
    Tag,
    DollarSign,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

interface CourseCreateModalProps {
    open: boolean;
    onClose: () => void;
}

export function CourseCreateModal({ open, onClose }: CourseCreateModalProps) {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        instructorId: '',
        price: 0,
        description: '',
        publishImmediately: false
    });

    const { data: teacherData, isLoading: loadingTeachers } = useQuery({
        queryKey: ['admin-teachers'],
        queryFn: async () => {
            const res = await fetch('/api/admin/teachers');
            if (!res.ok) throw new Error('Failed to fetch teachers');
            return res.json();
        }
    });

    const teachers = teacherData?.teachers || [];

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            if (!data.title || !data.category || !data.instructorId) {
                throw new Error('Please fill in all required fields (Title, Category, Instructor)');
            }
            const res = await fetch('/api/admin/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create course');
            }
            return res.json();
        },
        onSuccess: (newCourse) => {
            addToast({ message: 'Course created successfully!', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-courses-summary'] });
            onClose();
            router.push(`/admin/courses/${newCourse.id}/manage`);
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
                    className="fixed inset-0 bg-[#1C2B4A]/60 backdrop-blur-md"
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
                            <div className="flex items-center gap-2 text-[#E8B84B]">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-[11px] font-black uppercase tracking-[0.25em]">Course Creation Portal</span>
                            </div>
                            <h2 className="text-[32px] font-bold text-[#1C2B4A] tracking-tight leading-none">Draft Your Curriculum</h2>
                            <p className="text-[14px] text-[#7A8FAF] font-medium italic">Start drafting your next industry-leading course experience.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-[#F8F9FC] text-[#7A8FAF] rounded-2xl hover:text-[#1C2B4A] transition-all border border-[#E2E8F4]"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-8">
                        {/* Core Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 col-span-full">
                                <label className="text-[11px] font-black text-[#1C2B4A] uppercase tracking-widest pl-1">Course Title *</label>
                                <div className="relative group">
                                    <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8FAF] group-focus-within:text-[#1C2B4A] transition-colors" />
                                    <input
                                        required
                                        placeholder="e.g. Masterclass on Distributed Systems"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full pl-16 pr-6 py-5 bg-[#F8F9FC] border-2 border-[#E2E8F4] focus:border-[#1C2B4A] rounded-[24px] outline-none text-[15px] font-bold text-[#1C2B4A] transition-all placeholder:text-[#A8B8D8] placeholder:font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#1C2B4A] uppercase tracking-widest pl-1">Category *</label>
                                <div className="relative group">
                                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8FAF] transition-colors" />
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full pl-16 pr-6 py-5 bg-[#F8F9FC] border-2 border-[#E2E8F4] focus:border-[#1C2B4A] rounded-[24px] outline-none text-[15px] font-bold text-[#1C2B4A] appearance-none transition-all"
                                    >
                                        <option value="">Select Domain</option>
                                        <option value="Programming">Programming</option>
                                        <option value="System Design">System Design</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="Management">Management</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="AI / ML">AI & Machine Learning</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#1C2B4A] uppercase tracking-widest pl-1">Assign Instructor *</label>
                                <div className="relative group">
                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8FAF] transition-colors" />
                                    <select
                                        required
                                        value={formData.instructorId}
                                        onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                                        className="w-full pl-16 pr-12 py-5 bg-[#F8F9FC] border-2 border-[#E2E8F4] focus:border-[#1C2B4A] rounded-[24px] outline-none text-[15px] font-bold text-[#1C2B4A] appearance-none transition-all"
                                        disabled={loadingTeachers}
                                    >
                                        <option value="">Choose Instructor</option>
                                        {teachers.map((t: any) => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                                        ))}
                                    </select>
                                    {loadingTeachers && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C2B4A] animate-spin" />}
                                </div>
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#1C2B4A] uppercase tracking-widest pl-1">Course Pricing (INR)</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A8FAF] group-focus-within:text-[#1C2B4A] transition-colors" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0 for Free"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full pl-16 pr-6 py-5 bg-[#F8F9FC] border-2 border-[#E2E8F4] focus:border-[#1C2B4A] rounded-[24px] outline-none text-[15px] font-bold text-[#1C2B4A] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-1 px-4 mb-2">
                                <p className="text-[11px] text-[#7A8FAF] font-medium leading-relaxed italic">₹0 will mark this as a &quot;Free Course&quot; for all students.</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-[#1C2B4A] uppercase tracking-widest pl-1">Short Narrative / Brief</label>
                            <textarea
                                rows={4}
                                placeholder="Tell students what they will achieve by the end of this journey..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-8 bg-[#F8F9FC] border-2 border-[#E2E8F4] focus:border-[#1C2B4A] rounded-[32px] outline-none text-[14px] font-medium text-[#1C2B4A] transition-all placeholder:text-[#A8B8D8]"
                            />
                        </div>

                        <div className="h-[1px] bg-[#F0F2F8]" />

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <div className="relative w-12 h-6">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.publishImmediately}
                                        onChange={(e) => setFormData({ ...formData, publishImmediately: e.target.checked })}
                                    />
                                    <div className="w-12 h-6 bg-[#E2E8F4] rounded-full peer-checked:bg-green-500 transition-colors" />
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[13px] font-bold text-[#1C2B4A]">Publish Immediately?</p>
                                    <p className="text-[10px] text-[#7A8FAF] font-bold uppercase tracking-widest">Mark as Live upon creation</p>
                                </div>
                            </label>

                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 sm:flex-none px-8 py-4 text-[#7A8FAF] font-bold text-[12px] uppercase tracking-widest hover:text-[#1C2B4A] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-5 bg-[#1C2B4A] text-white rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#2C3E5F] transition-all shadow-xl shadow-[#1C2B4A]/20 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
                                    {formData.publishImmediately ? 'Commission Course' : 'Save as Draft'}
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

