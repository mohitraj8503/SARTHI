'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { useStudentDashboardData } from '@/hooks/useStudentDashboardData';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Only fetch if user is logged in
  const { data } = useStudentDashboardData();

  const notifications = user ? (data?.notifications || []) : [];
  const unreadCount = notifications.length;

  if (!user) return null;

  return (
    <div className="relative group/notif">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
            "w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center border transition-all relative overflow-hidden group/btn",
            isOpen 
                ? "bg-[#174F3A] border-[#174F3A] shadow-[0_0_20px_rgba(23,79,58,0.2)]" 
                : "bg-white border-gray-50 shadow-sm hover:shadow-lg hover:-translate-y-1"
        )}
      >
        <div className={cn(
            "absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity",
            isOpen && "opacity-100"
        )} />
        <Bell className={cn(
            "w-5 h-5 lg:w-6 lg:h-6 transition-colors duration-300",
            isOpen ? "text-white" : "text-gray-400 group-hover/btn:text-[#174F3A]"
        )} />
        {unreadCount > 0 && (
          <span className={cn(
              "absolute top-3.5 right-3.5 lg:top-4 lg:right-4 w-2.5 h-2.5 rounded-full border-2 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-bounce",
              isOpen ? "bg-white border-[#174F3A]" : "bg-red-500 border-white"
          )} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-6 w-auto sm:w-[420px] bg-white border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-transparent">
                <div className="space-y-1">
                    <h3 className="font-black text-lg text-gray-900 font-outfit uppercase italic leading-none">Notifications</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">STAY UPDATED WITH YOUR PROGRESS</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black bg-[#174F3A] text-white px-3 py-1 rounded-full shadow-[0_0_12px_rgba(23,79,58,0.2)]">{unreadCount} NEW</span>
                </div>
              </div>

              <div className="max-h-[450px] overflow-y-auto no-scrollbar py-2">
                {notifications.length > 0 ? (
                  <div className="px-2">
                    {notifications.map((notif: any, index: number) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={notif.id} 
                        className="p-6 hover:bg-[#FAF9F6] rounded-[1.75rem] transition-all flex gap-5 group/item cursor-pointer mb-1 mx-2"
                      >
                        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-white group-hover/item:scale-110 transition-transform ${
                            notif.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                            notif.type === 'warning' ? 'bg-amber-50 text-amber-500' :
                            notif.type === 'error' ? 'bg-rose-50 text-rose-500' :
                            'bg-blue-50 text-blue-500'
                          }`}>
                          {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                            notif.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                              <Info className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">{notif.title}</p>
                            <span className="text-[9px] font-bold text-gray-300 uppercase shrink-0">
                                {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-gray-500 leading-relaxed line-clamp-2 group-hover/item:text-gray-700 transition-colors">{notif.message}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                        <Bell className="w-8 h-8 text-gray-200" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Inbox Zero</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mt-1">NO NEW NOTIFICATIONS AT THE MOMENT</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                <Link 
                    href="/dashboard/notifications" 
                    onClick={() => setIsOpen(false)} 
                    className="w-full py-4 bg-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all border border-gray-100"
                >
                    View Full Inbox
                    <ArrowRight className="w-3 h-3 text-[#174F3A]" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

