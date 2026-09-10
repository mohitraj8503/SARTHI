'use client';

import React from 'react';
import { Bell, Search, Shield, User, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  systemStatus?: {
    status: 'operational' | 'degraded' | 'maintenance';
    message: string;
  };
  pendingCount?: number;
}

export function AdminHeader({ systemStatus, pendingCount = 0 }: AdminHeaderProps) {
  return (
    <header className="px-10 py-6 flex items-center justify-between bg-white/40 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100]">
      <div className="flex items-center gap-8">
        {/* Search Bar */}
        <div className="relative group w-80">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search telemetry..."
            className="w-full pl-12 pr-6 py-3 bg-slate-50/50 border border-transparent rounded-2xl text-[13px] font-bold text-[#0F172A] outline-none focus:bg-white focus:border-amber-100 transition-all shadow-sm"
          />
        </div>

        {/* System Health Status */}
        {systemStatus && (
          <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              systemStatus.status === 'operational' ? "bg-emerald-500" :
              systemStatus.status === 'degraded' ? "bg-amber-500" : "bg-rose-500"
            )} />
            <span className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest">{systemStatus.message}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all group">
          <Bell className="w-5 h-5 text-slate-400 group-hover:text-[#0F172A] transition-colors" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-lg shadow-lg border-2 border-white">
              {pendingCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-black text-[#0F172A] leading-none uppercase">Root Admin</p>
            <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">Master Control</p>
          </div>
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-amber-400 shadow-lg group cursor-pointer hover:scale-105 transition-all">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}

