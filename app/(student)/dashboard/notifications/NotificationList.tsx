'use client';

import { useState } from 'react';
import { Bell, Filter, BookOpen, Video, MessageCircle, Award, AlertCircle, Clock, CheckCircle, LucideIcon } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: Date | string; // Handle potentially string dates from JSON
    unread: boolean;
    type: string;
    link?: string;
}

const typeIcons: Record<string, LucideIcon> = {
    course: BookOpen,
    live: Video,
    assignment: MessageCircle,
    achievement: Award,
    message: MessageCircle,
    certificate: Award,
    reminder: AlertCircle,
};

const typeColors: Record<string, string> = {
    course: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    live: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    assignment: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    achievement: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    message: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    certificate: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    reminder: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    general: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function NotificationList({ initialNotifications }: { initialNotifications: any[] }) {
    // Cast initial data to Notification type and handle date conversation if needed
    const [notifications, setNotifications] = useState<Notification[]>(
        initialNotifications.map(n => ({
            ...n,
            time: new Date(n.time)
        }))
    );

    const unreadNotifications = notifications.filter(n => n.unread);
    const readNotifications = notifications.filter(n => !n.unread);

    const formatTime = (date: Date | string) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    const markAllRead = async () => {
        // Optimistic update
        setNotifications(notifications.map(n => ({ ...n, unread: false })));

        // In a real implementation, you would call a Server Action here instead of fetch
        // await markAllReadAction(); 
    };

    const markAsRead = async (notificationId: string) => {
        // Optimistic update
        setNotifications(notifications.map(n =>
            n.id === notificationId ? { ...n, unread: false } : n
        ));

        // await markReadAction(notificationId);
    };

    return (
        <div className="space-y-8">
            {notifications.length > 0 ? (
                <>
                    {/* Stats - Horizontal Scroll on Mobile */}
                    <div className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar snap-x-mandatory lg:snap-none -mx-4 px-4 md:mx-0 md:px-0">
                        {[
                            { label: 'Total', value: notifications.length },
                            { label: 'Unread', value: unreadNotifications.length },
                            { label: 'Read', value: readNotifications.length },
                            {
                                label: 'This Week', value: notifications.filter(n =>
                                    new Date(n.time).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                                ).length
                            },
                        ].map((stat) => (
                            <div key={stat.label} className="flex-none w-[130px] md:w-auto snap-center p-5 md:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={markAllRead}
                            disabled={unreadNotifications.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            Mark All Read
                        </button>
                    </div>

                    {/* Unread Notifications */}
                    {unreadNotifications.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full" /> Unread ({unreadNotifications.length})
                            </h2>
                            <div className="space-y-3">
                                {unreadNotifications.map((notification) => {
                                    const Icon = typeIcons[notification.type] || Bell;
                                    return (
                                        <div
                                            key={notification.id}
                                            className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex gap-4 cursor-pointer group"
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${typeColors[notification.type] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{notification.title}</h3>
                                                        <p className="text-slate-500 text-sm mt-0.5">{notification.message}</p>
                                                    </div>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {formatTime(notification.time)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notification.id);
                                                        }}
                                                        className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium"
                                                    >
                                                        <CheckCircle className="w-3 h-3" /> Mark read
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Read Notifications */}
                    {readNotifications.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-300 rounded-full" /> Earlier ({readNotifications.length})
                            </h2>
                            <div className="space-y-3">
                                {readNotifications.map((notification) => {
                                    const Icon = typeIcons[notification.type] || Bell;
                                    return (
                                        <div
                                            key={notification.id}
                                            className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex gap-4 opacity-75 hover:opacity-100 transition-opacity"
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border bg-slate-100 text-slate-400 border-slate-200`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-700">{notification.title}</h3>
                                                        <p className="text-slate-500 text-sm mt-0.5">{notification.message}</p>
                                                    </div>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {formatTime(notification.time)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-slate-200 border-dashed group hover:border-blue-300 transition-colors">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-slate-300 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                        <Bell className="w-8 h-8 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">You&apos;re all caught up</h3>
                    <p className="text-slate-500 max-w-xs text-center mx-auto">
                        No new notifications. We&apos;ll let you know when something important happens.
                    </p>
                </div>
            )}
        </div>
    );
}

