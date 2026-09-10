'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  MessageSquare,
  BookOpen,
  Award,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Inbox,
  Trash2,
  Filter,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  body?: string;
  type: string;
  isRead: boolean;
  href?: string;
  createdAt: string | Date;
}

const filterTabs = [
  { id: 'all', label: 'All', icon: Inbox },
  { id: 'unread', label: 'Unread', icon: Bell },
  { id: 'assignments', label: 'Tasks', icon: BookOpen },
  { id: 'seminars', label: 'Events', icon: Calendar },
  { id: 'system', label: 'System', icon: AlertCircle },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.items) {
        setNotifications(data.items);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      // Error handled silently
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIVE_START': return <Calendar className="w-5 h-5 text-[#174F3A]" />;
      case 'MESSAGE_NEW': return <MessageSquare className="w-5 h-5 text-[#4A9E6A]" />;
      case 'ASSIGNMENT_DUE': return <AlertCircle className="w-5 h-5 text-[#E74C3C]" />;
      case 'RECORDING_NEW': return <BookOpen className="w-5 h-5 text-[#4A9E6A]" />;
      case 'GRADE_POSTED': return <Award className="w-5 h-5 text-[#174F3A]" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="w-full dashboard-container-glass p-3 sm:p-4 lg:p-10 pb-24 lg:pb-20 space-y-8 sm:space-y-12 min-h-screen">
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 max-w-[1200px] mx-auto">
        
        {/* Minimal Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight font-outfit italic uppercase">
              Updates
            </h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">
              Stay synced with your learning journey
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button
                onClick={() => {}} 
                className="px-8 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-900 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
             >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mark Read
             </button>
          </div>
        </header>

        {/* Filter Hub */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 border-b border-gray-100 pb-6 sm:pb-8">
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-[2rem] border border-gray-100 overflow-x-auto no-scrollbar max-w-full">
                {filterTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                                activeTab === tab.id 
                                    ? "bg-[#174F3A] text-white shadow-lg shadow-[#174F3A]/20" 
                                    : "text-gray-400 hover:text-gray-600 hover:bg-white"
                            )}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Notifications Grid */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="space-y-6">
                {[1,2,3].map(i => (
                  <div key={i} className="h-32 bg-gray-50 rounded-[2.5rem] animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-32 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-10 h-10 text-gray-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase font-outfit">Inbox Clear</h3>
                  <p className="text-gray-400 max-w-sm mx-auto font-bold text-xs uppercase tracking-widest">You&apos;ve mastered all your updates.</p>
                </div>
              </motion.div>
            ) : (
              notifications.map((n, index) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group glass-card p-5 sm:p-8 transition-all duration-500 hover:-translate-y-1 flex flex-col md:flex-row gap-6 sm:gap-8 items-start md:items-center",
                    !n.isRead && "border-emerald-100 bg-emerald-50/10"
                  )}
                >
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                        !n.isRead ? "bg-emerald-100 text-emerald-600" : "bg-gray-50 text-gray-400"
                    )}>
                        {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {!n.isRead && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                                <h4 className="text-xl font-black text-gray-900 uppercase font-outfit tracking-tight leading-none italic">{n.title}</h4>
                            </div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 font-bold leading-relaxed max-w-3xl italic">{n.body || "Academic update received from the portal."}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {!n.isRead && (
                            <button
                                onClick={() => handleMarkAsRead(n.id)}
                                className="px-6 py-2.5 bg-white border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            >
                                Read
                            </button>
                        )}
                        <Link 
                            href={n.href || "#"} 
                            className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-[#174F3A] hover:text-white transition-all shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
