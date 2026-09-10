'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ToastProvider';
import { Loader2, Save, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string | null;
    thumbnail: string | null;
    status?: string;
    level?: string;
    deviceLimit?: number;
    isPublished?: boolean;
    isFeatured?: boolean;
}

interface CourseEditModalProps {
    course: Course | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CourseEditModal({ course, open, onOpenChange }: CourseEditModalProps) {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Course>>({});

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                price: course.price || 0,
                category: course.category || '',
                thumbnail: course.thumbnail || '',
                level: course.level || 'Beginner',
                deviceLimit: course.deviceLimit || 2,
                isPublished: course.isPublished ?? (course.status === 'published' || !course.status),
                isFeatured: course.isFeatured ?? false,
            });
        }
    }, [course]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/courses/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: course.id,
                    ...formData,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update course');
            }

            addToast({ message: 'Course updated successfully', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            onOpenChange(false);
        } catch (error: any) {
            addToast({ message: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!course) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white border-[#E2E8F4]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#1C2B4A]">Edit Course</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest pl-1">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-xl text-[14px] text-[#1C2B4A] focus:border-[#E8B84B] outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest pl-1">Price (₹)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : 0 })}
                                className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-xl text-[14px] text-[#1C2B4A] focus:border-[#E8B84B] outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest pl-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-xl text-[14px] text-[#1C2B4A] focus:border-[#E8B84B] outline-none transition-all min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest pl-1">Category</label>
                            <input
                                type="text"
                                value={formData.category || ''}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-xl text-[14px] text-[#1C2B4A] focus:border-[#E8B84B] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest pl-1">Level</label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-xl text-[14px] text-[#1C2B4A] focus:border-[#E8B84B] outline-none transition-all"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest pl-1">Thumbnail URL</label>
                        <input
                            type="text"
                            value={formData.thumbnail || ''}
                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-xl text-[14px] text-[#1C2B4A] focus:border-[#E8B84B] outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-8 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isPublished}
                                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                className="w-4 h-4 accent-[#E8B84B]"
                            />
                            <span className="text-[12px] font-bold text-[#1C2B4A] uppercase tracking-widest">Published</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isFeatured}
                                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                className="w-4 h-4 accent-[#E8B84B]"
                            />
                            <span className="text-[12px] font-bold text-[#1C2B4A] uppercase tracking-widest">Featured</span>
                        </label>
                    </div>

                    <DialogFooter className="pt-4">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-6 py-2.5 text-[#7A8FAF] font-bold text-[12px] uppercase tracking-widest hover:text-[#1C2B4A] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2.5 bg-[#1C2B4A] text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#2C3E5F] transition-all shadow-lg shadow-[#1C2B4A]/10 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

