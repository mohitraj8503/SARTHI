'use client';

import { useEffect } from 'react';
import {
    X,
    Calendar,
    Clock,
    User,
    Video,
    Users,
    ExternalLink,
    Copy,
    Info,
    Lock,
    ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Seminar {
    id: string;
    title: string;
    slug?: string;
    description?: string;
    status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'REPLAY_READY' | 'CANCELLED';
    scheduledAt: string;
    durationMinutes?: number;
    duration?: number;
    instructor?: { name: string; image: string };
    speaker?: { name: string; photo: string };
    instructorName?: string;
    type?: string;
    meetLink?: string;
    youtubeBroadcastId?: string;
    registrations: { _count: { seminarId: number } } | any;
    _count?: { registrations: number };
    capacity?: number;
    attendanceCount?: number;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface SeminarDetailsDrawerProps {
    seminar: Seminar | null;
    open: boolean;
    onClose: () => void;
}

export function SeminarDetailsDrawer({ seminar, open, onClose }: SeminarDetailsDrawerProps) {
    const router = useRouter();

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!seminar) return null;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        });
    };

    const statusColors: Record<string, string> = {
        SCHEDULED: 'bg-blue-50 text-blue-600 border-blue-100',
        LIVE: 'bg-red-50 text-red-600 border-red-100',
        ENDED: 'bg-gray-50 text-gray-600 border-gray-100',
        DRAFT: 'bg-yellow-50 text-yellow-600 border-yellow-100',
        CANCELLED: 'bg-orange-50 text-orange-600 border-orange-100',
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#1C2B4A]/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-white shadow-2xl z-[101] flex flex-col border-l border-[#E2E8F4]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[#F0F2F8] flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                        statusColors[seminar.status]
                                    )}>
                                        {seminar.status === 'LIVE' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
                                        {seminar.status}
                                    </span>
                                    <span className="px-3 py-1 bg-[#F0F2F8] text-[#1C2B4A] rounded-md text-[10px] font-bold uppercase tracking-widest border border-[#E2E8F4]">
                                        {seminar.type || 'Workshop'}
                                    </span>
                                </div>
                                <h2 className="text-[20px] font-bold text-[#1C2B4A] mt-2">{seminar.title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-[#7A8FAF] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 admin-scrollbar">
                            {/* Quick Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/seminars/${seminar.slug || seminar.id}`);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F8F9FC] text-[#1C2B4A] border border-[#E2E8F4] rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-white transition-all"
                                >
                                    <Copy className="w-4 h-4" /> Copy Link
                                </button>
                                <button
                                    onClick={() => {
                                        window.open(`/seminars/${seminar.slug || seminar.id}`, '_blank');
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F8F9FC] text-[#1C2B4A] border border-[#E2E8F4] rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-white transition-all"
                                >
                                    <ExternalLink className="w-4 h-4" /> Public Page
                                </button>
                            </div>

                            {/* Core Info Section */}
                            <section className="space-y-4">
                                <h3 className="text-[11px] font-bold text-[#7A8FAF] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5" /> Core Information
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 bg-[#F8F9FC] rounded-[16px] border border-[#E2E8F4] flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F4] flex items-center justify-center text-[#1C2B4A]">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider">Date</p>
                                            <p className="text-[14px] font-bold text-[#1C2B4A]">{formatDate(seminar.scheduledAt)}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-[#F8F9FC] rounded-[16px] border border-[#E2E8F4] flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F4] flex items-center justify-center text-[#1C2B4A]">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider">Time</p>
                                            <p className="text-[14px] font-bold text-[#1C2B4A]">{formatTime(seminar.scheduledAt)} ({seminar.durationMinutes || 60} min)</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-[#F8F9FC] rounded-[16px] border border-[#E2E8F4] flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F4] flex items-center justify-center text-[#1C2B4A]">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider">Instructor</p>
                                            <p className="text-[14px] font-bold text-[#1C2B4A]">{seminar.instructor?.name || seminar.instructorName || 'Official Mentor'}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-[#F8F9FC] rounded-[16px] border border-[#E2E8F4] flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F4] flex items-center justify-center text-red-500">
                                            <Video className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider">YouTube Broadcast</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[14px] font-bold text-[#1C2B4A]">
                                                    {seminar.youtubeBroadcastId ? `LIVE ID: ${seminar.youtubeBroadcastId}` : 'No YouTube Link'}
                                                </p>
                                                {seminar.youtubeBroadcastId && (
                                                    <button 
                                                        onClick={() => window.open(`https://youtu.be/${seminar.youtubeBroadcastId}`, '_blank')}
                                                        className="text-[11px] font-bold text-red-500 hover:underline px-2"
                                                    >
                                                        WATCH
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-[#F8F9FC] rounded-[16px] border border-[#E2E8F4] flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F4] flex items-center justify-center text-blue-500">
                                            <Video className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider">Meeting Link (Meet)</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[14px] font-bold text-[#1C2B4A]">••••••••••••••••</p>
                                                {seminar.meetLink && (
                                                    <button 
                                                        onClick={() => navigator.clipboard.writeText(seminar.meetLink || '')} 
                                                        className="text-[11px] font-bold text-blue-600 hover:underline px-2"
                                                    >
                                                        Copy
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Description Section */}
                            <section className="space-y-4">
                                <h3 className="text-[11px] font-bold text-[#7A8FAF] uppercase tracking-[0.2em]">About Seminar</h3>
                                <div className="prose prose-sm max-w-none text-[#1C2B4A]/80 leading-relaxed">
                                    {seminar.description || "In this intensive seminar, we'll dive deep into modern architecture patterns, best practices for scalability, and real-world implementation strategies. Perfect for developers looking to level up their core infrastructure skills."}
                                </div>
                            </section>

                            {/* Stats Section */}
                            <section className="space-y-4">
                                <h3 className="text-[11px] font-bold text-[#7A8FAF] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Registrations
                                </h3>
                                <div className="bg-[#F8F9FC] rounded-[20px] border border-[#E2E8F4] p-6 grid grid-cols-2 gap-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider">Registered</p>
                                        <p className="text-[28px] font-bold text-[#1C2B4A]">{seminar._count?.registrations || seminar.registrations?._count?.seminarId || 0}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-[#7A8FAF] uppercase tracking-wider">Attendance</p>
                                        <p className="text-[28px] font-bold text-[#1C2B4A]">{seminar.attendanceCount || '—'}</p>
                                    </div>
                                    <div className="col-span-2 space-y-2 pt-4 border-t border-[#E2E8F4]">
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span className="text-[#7A8FAF] uppercase tracking-wider">Capacity</span>
                                            <span className="text-[#1C2B4A]">{seminar._count?.registrations || 0} / {seminar.capacity || 500} Seats</span>
                                        </div>
                                        <div className="h-2 bg-[#E2E8F4] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full shadow-sm shadow-blue-500/20"
                                                style={{ width: `${Math.min(((seminar._count?.registrations || 0) / (seminar.capacity || 500)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Audit Info */}
                            <section className="pt-8 border-t border-[#F0F2F8] space-y-3">
                                <div className="flex justify-between text-[11px] text-[#7A8FAF]">
                                    <span>Created By</span>
                                    <span className="font-bold text-[#1C2B4A]">{seminar.createdBy || 'Super Admin'}</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-[#7A8FAF]">
                                    <span>Last Updated</span>
                                    <span className="font-bold text-[#1C2B4A]">{seminar.updatedAt ? new Date(seminar.updatedAt).toLocaleDateString() : 'Mar 02, 2026'}</span>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[#F0F2F8] bg-[#F8F9FC]">
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => router.push(`/admin/seminars/${seminar.id}/manage`)}
                                    className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1C2B4A] text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#2C3E5F] transition-all shadow-lg shadow-[#1C2B4A]/10"
                                >
                                    Manage Seminar <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                                <div className="flex items-center justify-center gap-2 text-[10px] text-[#7A8FAF] font-bold uppercase tracking-wider">
                                    <Lock className="w-3 h-3" /> Details = Read Only
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

