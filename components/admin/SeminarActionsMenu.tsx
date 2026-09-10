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
    UserMinus,
    Download,
    Calendar,
    Layers,
    XCircle,
    Video,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

interface SeminarActionsMenuProps {
    seminar: any;
    onViewDetails: () => void;
}

export function SeminarActionsMenu({ seminar, onViewDetails }: SeminarActionsMenuProps) {
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

    const duplicateMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/admin/seminars/${seminar.id}/duplicate`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to duplicate');
            return res.json();
        },
        onSuccess: () => {
            addToast({ message: 'Seminar duplicated successfully', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['admin-seminars'] });
            setIsOpen(false);
        }
    });

    const cancelMutation = useMutation({
        mutationFn: async () => {
            if (!confirm('Are you sure you want to cancel this seminar? This will notify all registered students.')) return;
            const res = await fetch(`/api/admin/seminars/${seminar.id}/cancel`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to cancel');
            return res.json();
        },
        onSuccess: () => {
            addToast({ message: 'Seminar cancelled and students notified', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['admin-seminars'] });
            setIsOpen(false);
        }
    });

    const syncMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/admin/seminars/${seminar.id}/sync`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to sync');
            return res.json();
        },
        onSuccess: (data) => {
            addToast({ message: `Synced with YouTube: ${data.youtubeStatus}`, type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['admin-seminars'] });
            setIsOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!confirm('DANGER: This will permanently delete all seminar data and registrations. Type DELETE to confirm.')) return;
            const res = await fetch(`/api/admin/seminars/${seminar.id}`, { method: 'DELETE' }); // Using admin delete endpoint
            if (!res.ok) throw new Error('Failed to delete');
            return res.json();
        },
        onSuccess: () => {
            addToast({ message: 'Seminar permanently removed', type: 'success' });
            queryClient.invalidateQueries({ queryKey: ['admin-seminars'] });
            setIsOpen(false);
        }
    });

    const actionItems = [
        { label: 'View Details', icon: Eye, onClick: onViewDetails },
        { label: 'Manage Event', icon: Settings, onClick: () => router.push(`/admin/seminars/${seminar.id}/manage`) },
        {
            label: 'Copy Public Link', icon: Copy, onClick: () => {
                navigator.clipboard.writeText(`${window.location.origin}/seminars/${seminar.slug}`);
                addToast({ message: 'URL copied to clipboard', type: 'success' });
                setIsOpen(false);
            }
        },
        { label: 'Duplicate Seminar', icon: Layers, onClick: () => duplicateMutation.mutate() },
        {
            label: 'Export Attendees', icon: Download, onClick: () => {
                window.open(`/api/admin/seminars/${seminar.id}/attendees/export`, '_blank');
                setIsOpen(false);
            }
        },
        ...(seminar.youtubeBroadcastId ? [{ label: 'Sync YouTube', icon: RefreshCw, onClick: () => syncMutation.mutate(), isLoading: syncMutation.isPending }] : []),
    ];

    const statusSpecificItems: Array<{
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      onClick: () => void;
      danger?: boolean;
    }> = [];
    if (seminar.status === 'SCHEDULED' || seminar.status === 'DRAFT') {
        statusSpecificItems.push(
            { label: 'Reschedule', icon: Calendar, onClick: () => router.push(`/admin/seminars/${seminar.id}/manage?tab=edit`) },
            { label: 'Cancel Seminar', icon: XCircle, onClick: () => cancelMutation.mutate(), danger: true }
        );
    } else if (seminar.status === 'LIVE') {
        statusSpecificItems.push(
            { label: 'Join as Host', icon: Video, onClick: () => window.open(seminar.meetLink, '_blank') },
            { label: 'End Seminar', icon: Ban, onClick: () => cancelMutation.mutate(), danger: true }
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-[#7A8FAF] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-lg transition-all"
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#E2E8F4] z-[100] overflow-hidden p-2"
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
                                        item.danger ? "text-red-500 hover:bg-red-50" : "text-[#1C2B4A] hover:bg-[#F8F9FC]"
                                    )}
                                >
                                    <item.icon className={cn("w-4 h-4", item.danger ? "text-red-400" : "text-[#7A8FAF]")} />
                                    {item.label}
                                </button>
                            ))}

                            <div className="h-[1px] bg-[#F0F2F8] my-2 mx-2" />

                            <button
                                onClick={() => deleteMutation.mutate()}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                            >
                                <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                                Permanently Delete
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

