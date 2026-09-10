'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, BellOff, ExternalLink, Inbox } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { io } from 'socket.io-client';
import { useAuth } from '@/components/AuthProvider';

interface Notification {
    id: string;
    title: string;
    body?: string;
    type: string;
    isRead: boolean;
    href?: string;
    createdAt: string | Date;
}

export function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchPreview = async () => {
        try {
            const res = await fetch('/api/notifications/preview');
            const data = await res.json();
            if (data.items) {
                setNotifications(data.items);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        fetchPreview();

        // SSE Implementation
        const eventSource = new EventSource('/api/notifications/stream');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // Format incoming data to match Notification interface
            const newNotification: Notification = {
                id: Math.random().toString(36).substr(2, 9), // Temporary ID for UI
                title: data.title,
                body: data.body,
                type: data.type,
                isRead: false,
                href: data.href || `/courses/${data.courseId}/learn?lessonId=${data.lessonId}`,
                createdAt: new Date()
            };

            setNotifications(prev => [newNotification, ...prev].slice(0, 8));
            setUnreadCount(prev => prev + 1);

            // Trigger toast
            import('react-hot-toast').then(({ toast }) => {
                toast.success(data.title, {
                    description: data.body,
                    duration: 6000,
                    icon: '🚀'
                } as any);
            });
        };

        eventSource.onerror = (err) => {
            console.error('SSE Connection Error:', err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [user]);


    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark read:', err);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white animate-pulse" aria-hidden="true">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full uppercase tracking-wider">
                                    {unreadCount} New
                                </span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <BellOff className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                                <p className="text-xs text-slate-400 mt-1">We&apos;ll notify you when something important happens.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((n) => (
                                    <Link
                                        key={n.id}
                                        href={n.href || '#'}
                                        onClick={() => setIsOpen(false)}
                                        className={`block p-4 hover:bg-slate-50 transition-colors relative group ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-transparent'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className={`text-sm leading-tight mb-1 truncate ${!n.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                                        {n.title}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                {n.body && (
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                        {n.body}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!n.isRead && (
                                                        <button
                                                            onClick={(e) => markAsRead(n.id, e)}
                                                            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                    {n.href && (
                                                        <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1">
                                                            View Details <ExternalLink className="w-2.5 h-2.5" />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-50 bg-slate-50/30 text-center">
                        <Link
                            href="/dashboard/notifications"
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            See all notifications
                            <Inbox className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

