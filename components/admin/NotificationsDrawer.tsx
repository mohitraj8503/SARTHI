'use client';

import {
    Bell,
    X,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    UserPlus,
    Clock,
    ArrowRight,
    Filter,
    Trash2,
    Calendar,
    Zap,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
    id: string;
    title: string;
    body?: string;
    type: string;
    isRead: boolean;
    href?: string;
    createdAt: string;
    user?: {
        name: string;
        email: string;
        role: string;
    };
}

interface NotificationsDrawerProps {
    open: boolean;
    onClose: () => void;
}

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const queryClient = useQueryClient();

    // Fetch notifications
    const { data: notificationsData, isLoading, error } = useQuery({
        queryKey: ['admin-notifications', filter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filter === 'unread') params.set('unreadOnly', 'true');
            params.set('pageSize', '50');

            const res = await fetch(`/api/admin/notifications?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch notifications');
            return res.json();
        },
        enabled: open,
        refetchInterval: 30000, // Refetch every 30 seconds when open
    });

    // Mark notification as read
    const markReadMutation = useMutation({
        mutationFn: async (notificationId: string) => {
            const res = await fetch('/api/admin/notifications/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark-read', notificationId })
            });
            if (!res.ok) throw new Error('Failed to mark notification as read');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        }
    });

    // Mark all as read
    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/admin/notifications/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark-all-read' })
            });
            if (!res.ok) throw new Error('Failed to mark all notifications as read');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        }
    });

    // Delete notification
    const deleteMutation = useMutation({
        mutationFn: async (notificationId: string) => {
            const res = await fetch('/api/admin/notifications/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', notificationId })
            });
            if (!res.ok) throw new Error('Failed to delete notification');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        }
    });

    const notifications = notificationsData?.data?.notifications || [];
    const unreadCount = notificationsData?.data?.unreadCount || 0;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'enrollment': return UserPlus;
            case 'payment': return CreditCard;
            case 'error': return AlertCircle;
            case 'system': return Zap;
            case 'course': return Calendar;
            default: return Bell;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'enrollment': return 'text-blue-500 bg-blue-50';
            case 'payment': return 'text-green-500 bg-green-50';
            case 'error': return 'text-red-500 bg-red-50';
            case 'system': return 'text-purple-500 bg-purple-50';
            case 'course': return 'text-orange-500 bg-orange-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    const markAllRead = () => {
        markAllReadMutation.mutate();
    };

    const removeNotification = (notificationId: string) => {
        deleteMutation.mutate(notificationId);
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
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
                        className="fixed inset-0 bg-[#1C2B4A]/40 backdrop-blur-sm z-[110]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-[111] overflow-hidden flex flex-col border-l border-[#E2E8F4]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-[#F0F2F8] bg-white flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-[#1C2B4A]/5 text-[#1C2B4A] rounded-lg">
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-[18px] font-bold text-[#1C2B4A]">Notifications</h2>
                                </div>
                                <p className="text-[11px] text-[#7A8FAF] font-bold uppercase tracking-widest pl-9">Real-time system events</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-[#7A8FAF] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content Actions */}
                        <div className="px-8 py-4 flex items-center justify-between bg-[#F8F9FC]/50 border-b border-[#F0F2F8]">
                            <button
                                onClick={markAllRead}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-3 h-3" /> Mark all as read
                            </button>
                            <button
                                onClick={() => {
                                    console.log('Filter clicked');
                                }}
                                className="text-[10px] font-bold text-[#7A8FAF] hover:text-[#1C2B4A] uppercase tracking-widest flex items-center gap-2"
                            >
                                <Filter className="w-3 h-3" /> Filter
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 admin-scrollbar">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#7A8FAF]" />
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notif: Notification) => {
                                    const Icon = getNotificationIcon(notif.type);
                                    const colorClasses = getNotificationColor(notif.type);

                                    return (
                                        <motion.div
                                            key={notif.id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={cn(
                                                "group p-4 rounded-2xl border transition-all relative overflow-hidden",
                                                notif.isRead
                                                    ? "bg-white border-[#E2E8F4] opacity-90"
                                                    : "bg-[#F8F9FC] border-[#E2E8F4] shadow-sm ring-1 ring-[#1C2B4A]/5"
                                            )}
                                        >
                                            {!notif.isRead && (
                                                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                            )}
                                            <div className="flex gap-4">
                                                <div className={cn("mt-1 p-2.5 rounded-xl flex-shrink-0", colorClasses)}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1 pr-6">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-[13px] font-bold text-[#1C2B4A] group-hover:text-blue-600 transition-colors leading-tight">{notif.title}</h4>
                                                        <span className="text-[10px] font-medium text-[#7A8FAF] flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatTimeAgo(notif.createdAt)}</span>
                                                    </div>
                                                    <p className="text-[12px] text-[#7A8FAF] font-medium leading-relaxed">{notif.body}</p>
                                                    {notif.user && (
                                                        <p className="text-[10px] text-[#A8B8D8] font-medium">
                                                            {notif.user.name} ({notif.user.role})
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Notification Actions */}
                                            <div className="absolute right-4 bottom-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={() => markReadMutation.mutate(notif.id)}
                                                        className="p-1.5 text-[#7A8FAF] hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                        title="Mark as read"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => removeNotification(notif.id)}
                                                    className="p-1.5 text-[#7A8FAF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : error ? (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-16 h-16 bg-red-50 rounded-[24px] flex items-center justify-center text-red-500 mb-6">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-[16px] font-bold text-[#1C2B4A]">Failed to load notifications</h4>
                                    <p className="text-[13px] text-[#7A8FAF] mt-2 font-medium">Please try again later.</p>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-16 h-16 bg-[#F8F9FC] rounded-[24px] flex items-center justify-center text-[#A8B8D8] mb-6">
                                        <Bell className="w-8 h-8 opacity-20" />
                                    </div>
                                    <h4 className="text-[16px] font-bold text-[#1C2B4A]">Inbox is all clear</h4>
                                    <p className="text-[13px] text-[#7A8FAF] mt-2 font-medium">No new system alerts or operational notifications at this time.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[#F0F2F8] bg-[#F8F9FC]">
                            <button
                                onClick={() => window.location.href = '/admin/activity?source=system'}
                                className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1C2B4A] text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#2C3E5F] transition-all shadow-lg shadow-[#1C2B4A]/10"
                            >
                                View Activity Logs <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

