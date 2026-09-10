'use client';

import { useState, useRef, useEffect } from 'react';
import {
    MoreVertical,
    Eye,
    Settings,
    Copy,
    Trash2,
    Ban,
    Play,
    Layers,
    Download,
    Calendar,
    Layers as DuplicateIcon, // Resolve naming conflict if needed
    CheckCircle2,
    XCircle,
    Sparkles,
    Star,
    Archive,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

interface Course {
    id: string;
    title: string;
    slug: string;
    isActive: boolean;
    isPublished: boolean;
    isFeatured?: boolean;
}

interface CourseActionsMenuProps {
    course: any;
}

export function CourseActionsMenu({ course }: { course: Course }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const statusMutation = useMutation({
        mutationFn: async (action: string) => {
            const res = await fetch(`/api/admin/courses/${course.id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error('Action failed');
            return res.json();
        },
        onSuccess: (data, action) => {
            addToast({ message: `Course state successfully updated to ${action}`, type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-courses-summary'] });
            setIsOpen(false);
        }
    });

    const duplicateMutation = useMutation({
        mutationFn: async () => {
            addToast({ message: 'Cloning curriculum architecture...', type: 'info' });
            const res = await fetch(`/api/admin/courses/${course.id}/duplicate`, { method: 'POST' });
            if (!res.ok) throw new Error('Deep clone failed');
            return res.json();
        },
        onSuccess: () => {
            addToast({ message: 'Course successfully duplicated as Draft', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            setIsOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/admin/courses/${course.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Deletion failed');
            return res.json();
        },
        onSuccess: () => {
            addToast({ message: 'Course has been purged from inventory.', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-courses-summary'] });
            setIsOpen(false);
        }
    });

    const actionItems: any[] = [
        { label: 'View Analytics', icon: Eye, onClick: () => router.push(`/admin/courses/${course.id}/manage`) },
        { label: 'Edit Content', icon: Settings, onClick: () => router.push(`/admin/courses/${course.id}/manage?tab=edit`) },
        {
            label: 'Copy Enrollment URL', icon: Copy, onClick: () => {
                navigator.clipboard.writeText(`${window.location.origin}/courses/${course.slug}`);
                addToast({ message: 'URL copied for enrollment sharing', type: 'success' });
                setIsOpen(false);
            }
        },
        { label: 'Duplicate Course', icon: DuplicateIcon, onClick: () => duplicateMutation.mutate() },
        {
            label: course.isFeatured ? 'Remove from Featured' : 'Feature on Home',
            icon: Star,
            onClick: () => statusMutation.mutate('toggle-featured')
        },
        {
            label: 'Export Enrollments', icon: Download, onClick: () => {
                window.open(`/api/admin/courses/${course.id}/students?export=true`, '_blank');
                setIsOpen(false);
            }
        },
    ];

    const statusSpecificItems: Array<{
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      onClick: () => void;
      danger?: boolean;
    }> = [];
    if (course.isActive) {
        if (course.isPublished) {
            statusSpecificItems.push(
                { label: 'Unpublish (Draft)', icon: Play, onClick: () => statusMutation.mutate('unpublish'), danger: false },
                { label: 'Archive Course', icon: Archive, onClick: () => statusMutation.mutate('archive'), danger: true }
            );
        } else {
            statusSpecificItems.push(
                { label: 'Publish Live', icon: CheckCircle2, onClick: () => statusMutation.mutate('publish'), danger: false },
                { label: 'Archive Course', icon: Archive, onClick: () => statusMutation.mutate('archive'), danger: true }
            );
        }
    } else {
        statusSpecificItems.push(
            { label: 'Restore to Draft', icon: RefreshCw, onClick: () => statusMutation.mutate('restore'), danger: false },
            {
                label: 'Permanently Delete', icon: Trash2, onClick: () => {
                    deleteMutation.mutate();
                }, danger: true
            }
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-[#7A8FAF] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-xl transition-all"
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-[#E2E8F4] z-[100] overflow-hidden p-2"
                    >
                        <div className="space-y-1">
                            {actionItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-xl transition-all group"
                                >
                                    <item.icon className="w-4 h-4 text-[#7A8FAF] group-hover:text-[#1C2B4A]" />
                                    {item.label}
                                </button>
                            ))}

                            {statusSpecificItems.length > 0 && <div className="h-[1px] bg-[#F0F2F8] my-2 mx-2" />}

                            {statusSpecificItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold rounded-xl transition-all group",
                                        item.danger ? "text-red-500 hover:bg-red-50 font-black" : "text-[#1C2B4A] hover:bg-[#F8F9FC]"
                                    )}
                                >
                                    <item.icon className={cn("w-4 h-4", item.danger ? "text-red-400 group-hover:text-red-600" : "text-[#7A8FAF] group-hover:text-[#1C2B4A]")} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

