'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Shield, 
  UserCheck, 
  GraduationCap, 
  Mail, 
  SearchX,
  MoreHorizontal,
  Eye,
  KeyRound,
  Pause,
  Play,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  avatar_url?: string;
  image?: string;
}

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        role: roleFilter === 'All' ? '' : roleFilter.toUpperCase(),
        status: statusFilter === 'All' ? '' : statusFilter.toUpperCase()
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setTotal(data.meta.total);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
      case 'GOD_ADMIN': return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'TEACHER': return <GraduationCap className="w-3.5 h-3.5" />;
      default: return <UserCheck className="w-3.5 h-3.5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
      case 'GOD_ADMIN': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'TEACHER': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 sm:px-0">
        <div className="space-y-1">
          <h1 className="text-[32px] font-bold text-[#1C2B4A] tracking-tight">
            User <span className="text-[#3A6BC4]">Management</span>
          </h1>
          <p className="text-[14px] text-[#7A8FAF] font-medium">Manage all platform students, teachers, and administrators.</p>
        </div>
 
        <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#1C2B4A] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest hover:bg-[#2D4063] transition-all shadow-lg shadow-navy-900/10">
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>
 
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[24px] border border-[#E2E8F4] shadow-sm flex flex-col xl:flex-row gap-4 items-center mx-4 sm:mx-0">
        <div className="w-full xl:w-1/3 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8FAF] group-focus-within:text-[#1C2B4A] transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, email, or digital signature..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F4] rounded-xl pl-11 pr-4 py-3 text-[13px] text-[#1C2B4A] focus:outline-none focus:ring-2 focus:ring-[#1C2B4A]/5 focus:border-[#1C2B4A] transition-all font-medium"
          />
        </div>
 
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-2/3 justify-end">
          <div className="flex bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E2E8F4] overflow-x-auto no-scrollbar w-full sm:w-auto">
            {['All', 'Student', 'Teacher', 'Admin'].map((role) => (
              <button
                key={role}
                onClick={() => { setRoleFilter(role); setPage(1); }}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  roleFilter === role 
                    ? "bg-[#1C2B4A] text-white shadow-md" 
                    : "text-[#7A8FAF] hover:text-[#1C2B4A]"
                )}
              >
                {role}
              </button>
            ))}
          </div>
 
          <div className="flex bg-[#F8FAFC] p-1.5 rounded-xl border border-[#E2E8F4] overflow-x-auto no-scrollbar w-full sm:w-auto">
            {['All', 'Active', 'Suspended', 'Banned'].map((status) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  statusFilter === status 
                    ? "bg-white text-[#1C2B4A] shadow-sm border border-[#E2E8F4]" 
                    : "text-[#7A8FAF] hover:text-[#1C2B4A]"
                )}
              >
                {status}
              </button>
            ))}
          </div>
 
          <button className="p-3 bg-white border border-[#E2E8F4] rounded-xl text-[#7A8FAF] hover:text-[#1C2B4A] hover:border-[#1C2B4A] transition-all flex justify-center items-center">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[32px] border border-[#E2E8F4] shadow-xl overflow-hidden mx-4 sm:mx-0">
        <div className="overflow-x-auto admin-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F4]">
                <th className="px-8 py-5 text-[10px] font-bold text-[#7A8FAF] uppercase tracking-[0.2em]">User Details</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[#7A8FAF] uppercase tracking-[0.2em]">Role / Access</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[#7A8FAF] uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[#7A8FAF] uppercase tracking-[0.2em]">Joined Date</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-[#7A8FAF] uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-[80px] bg-slate-50/30" />
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <SearchX className="w-16 h-16 text-[#1C2B4A]/20" />
                      <p className="text-[14px] font-bold uppercase tracking-[0.3em] text-[#1C2B4A]">No Users Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="group hover:bg-[#F8FAFC] transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#E2E8F4] border border-[#E2E8F4] flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform relative">
                          {user.image || user.avatar_url ? (
                             
                            <img src={(user.image || user.avatar_url) as string} alt={user.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span className="text-[16px] font-black text-[#1C2B4A]">{user.name?.[0] || 'U'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-[#1C2B4A] italic tracking-tight">{user.name}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#7A8FAF] font-mono mt-0.5">
                             <Mail className="w-3 h-3 opacity-60" />
                             {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        getRoleColor(user.role)
                      )}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            user.status === 'ACTIVE' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" :
                            user.status === 'BANNED' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]" :
                            "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                        )} />
                        <span className="text-[12px] font-black text-[#1C2B4A] italic">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[13px] font-bold text-[#1C2B4A]">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-[10px] text-[#7A8FAF] font-medium uppercase tracking-tighter">
                         Registered at {format(new Date(user.createdAt), 'hh:mm a')}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 pr-2">
                        <button className="p-3 rounded-2xl bg-white border border-[#E2E8F4] text-[#7A8FAF] hover:text-[#1C2B4A] hover:border-[#1C2B4A] transition-all shadow-sm hover:shadow-md group/btn">
                          <Eye className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                        </button>
                        <button className="p-3 rounded-2xl bg-white border border-[#E2E8F4] text-[#7A8FAF] hover:text-[#E8B84B] hover:border-[#E8B84B] transition-all shadow-sm group/btn">
                          <KeyRound className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                        </button>
                        <div className="relative group/menu">
                          <button className="p-3 rounded-2xl bg-white border border-[#E2E8F4] text-[#7A8FAF] hover:text-[#1C2B4A] transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {/* Inline Dropdown for Demo */}
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E2E8F4] py-2 z-50 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all translate-y-2 group-hover/menu:translate-y-0">
                             <button className="w-full px-4 py-2.5 text-left text-[11px] font-bold uppercase text-[#1C2B4A] hover:bg-slate-50 flex items-center gap-3">
                                <Pause className="w-3.5 h-3.5 text-amber-500" />
                                Suspend User
                             </button>
                             <button className="w-full px-4 py-2.5 text-left text-[11px] font-bold uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-3">
                                <Ban className="w-3.5 h-3.5" />
                                Terminate Account
                             </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
 
        {/* Console Pagination */}
        <div className="px-6 sm:px-10 py-6 sm:py-8 bg-[#1C2B4A] flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] text-center sm:text-left">
             Displaying {users.length} of {total} total users
          </p>
          <div className="flex items-center gap-4">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-10 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-xl border border-white/10">
               <span className="text-[12px] font-black text-white italic">{page}</span>
               <span className="text-[10px] font-bold text-white/20">/ {Math.ceil(total/pageSize)}</span>
            </div>
            <button 
               disabled={page >= Math.ceil(total/pageSize)}
               onClick={() => setPage(p => p + 1)}
               className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-10 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

