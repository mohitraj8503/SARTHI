'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface NotificationResponse {
  items: Notification[];
  unreadCount: number;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

async function fetchNotifications(): Promise<NotificationResponse> {
  const res = await fetch('/api/notifications/preview');
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

async function markAsRead(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
}

async function markAllAsRead(): Promise<void> {
  const res = await fetch('/api/notifications/read-all', {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read');
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery<NotificationResponse>({
    queryKey: ['notifications', 'preview'],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  });

  // Real-time updates using Server-Sent Events
  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream');

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        // Invalidate and refetch notifications
        refetch();
        // Trigger haptic feedback for new notifications
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Fallback to polling if SSE fails
      setTimeout(() => refetch(), 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [refetch]);

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preview'] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preview'] });
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full transition-colors hover:bg-[#1A3C2E]/5"
        aria-label="Notifications"
      >
        <Bell size={22} color="#1A3C2E" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#E74C3C] text-white text-[11px] font-semibold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold" style={{ color: '#1A3C2E' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => readAllMutation.mutate()}
                  disabled={readAllMutation.isPending}
                  className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50"
                  style={{ color: '#2D6A4F' }}
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={16} color="#5D705C" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <Bell size={32} color="#5D705C" strokeWidth={1.5} />
                  <p className="mt-3 text-sm font-medium" style={{ color: '#5D705C' }}>
                    No notifications yet
                  </p>
                  <p className="mt-1 text-xs" style={{ color: '#5D705C' }}>
                    You&apos;re all caught up!
                  </p>
                </div>
              ) : (
                <ul>
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        onClick={() => {
                          if (!notification.read) {
                            readMutation.mutate(notification.id);
                          }
                        }}
                        className="w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {notification.read ? (
                            <Check size={14} color="#5D705C" />
                          ) : (
                            <span
                              className="block w-2.5 h-2.5 rounded-full mt-0.5"
                              style={{ backgroundColor: '#E74C3C' }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="text-sm truncate"
                              style={{
                                color: notification.read ? '#5D705C' : '#1A3C2E',
                                fontWeight: notification.read ? 400 : 600,
                              }}
                            >
                              {notification.title}
                            </span>
                            <span
                              className="text-xs flex-shrink-0"
                              style={{ color: '#5D705C' }}
                            >
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          <p
                            className="text-xs mt-0.5 leading-relaxed"
                            style={{ color: '#5D705C' }}
                          >
                            {truncateText(notification.body, 80)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                <a
                  href="/teacher/notifications"
                  className="text-xs font-medium transition-colors hover:opacity-80"
                  style={{ color: '#E8B84B' }}
                >
                  View all notifications
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

