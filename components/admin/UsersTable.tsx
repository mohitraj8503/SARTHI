'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  LogIn,
  Shield,
  Ban,
  CheckCircle,
  Loader2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  status: 'active' | 'suspended' | 'pending';
  platformSegment?: 'MAIN' | 'JUNIOR';
  educationLevel?: string | null;
  createdAt: string;
  enrollments: number;
  lastActive?: string;
  coursesCount?: number;
  _count?: { enrollments: number };
  progress?: string;
  recentActivity?: any[];
}

interface Column {
  key: keyof User | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
}

interface UsersTableProps {
  users: User[];
  loading?: boolean;
  onRowClick?: (user: User) => void;
  onAction?: (action: string, user: User) => void;
}

const columns: Column[] = [
  { key: 'name', label: 'User', sortable: true, width: '200px' },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true, width: '100px' },
  { key: 'platformSegment', label: 'Segment', sortable: true, width: '110px' },
  { key: 'status', label: 'Status', sortable: true, width: '120px' },
  { key: 'enrollments', label: 'Enrollments', sortable: true, width: '120px' },
  { key: 'createdAt', label: 'Joined', sortable: true, width: '140px' },
  { key: 'actions', label: '', width: '60px' },
];

export function UsersTable({ users, loading, onRowClick, onAction }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'main' | 'junior'>('all');
  const [sortField, setSortField] = useState<keyof User>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Segment Filter
    if (selectedSegment !== 'all') {
      const target = selectedSegment.toUpperCase();
      result = result.filter(u => (u.platformSegment || 'MAIN').toUpperCase() === target);
    }

    // Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';

      if (sortField === 'createdAt') {
        const aTime = new Date(aVal as string).getTime();
        const bTime = new Date(bVal as string).getTime();
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (aVal === null || bVal === null) return 0;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchTerm, sortField, sortOrder]);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredAndSortedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredAndSortedUsers.map((u) => u.id)));
    }
  };

  const handleSelectUser = (id: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedUsers(newSet);
  };

  const getStatusBadge = (status: User['status']) => {
    const styles = {
      active: { bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-100', label: 'Active' },
      suspended: { bg: 'bg-red-50', color: 'text-red-600', border: 'border-red-100', label: 'Suspended' },
      pending: { bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100', label: 'Pending' },
    };
    return styles[status];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-[#E2E8F4] rounded-[24px] overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-[#F0F2F8]">
        <div className="flex items-center gap-4">
          <div className="relative group min-w-[260px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8FAF] group-focus-within:text-[#1C2B4A] transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded-xl text-[14px] text-[#1C2B4A] outline-none focus:border-[#1C2B4A] transition-all placeholder:text-[#A8B8D8]"
            />
          </div>

          {/* Segment Filter: All | Main | Junior */}
          <div className="flex items-center bg-[#F8F9FC] p-1 rounded-xl border border-[#E2E8F4]">
            {[
              { id: 'all', label: 'All' },
              { id: 'main', label: '🎓 Main' },
              { id: 'junior', label: '🎒 Junior' },
              { id: 'pending', label: '⏳ Pending' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedSegment(tab.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                  selectedSegment === tab.id
                    ? "bg-white text-[#1C2B4A] shadow-sm border border-[#E2E8F4]"
                    : "text-[#7A8FAF] hover:text-[#1C2B4A]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {selectedUsers.size > 0 && (
            <span className="text-[12px] font-bold text-[#7A8FAF] bg-[#F0F2F8] px-3 py-1 rounded-lg">
              {selectedUsers.size} Selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 text-[#1C2B4A] font-bold text-[12px] uppercase tracking-widest bg-white border border-[#E2E8F4] rounded-xl hover:bg-[#F8F9FC] transition-all">
            <Filter size={16} />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto admin-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FC] border-b border-[#E2E8F4]">
              <th className="w-10 px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-[#E2E8F4] text-[#1C2B4A] focus:ring-[#1C2B4A]"
                />
              </th>
              {columns.filter(c => c.key !== 'actions').map((col) => (
                <th
                  key={col.key as string}
                  onClick={() => col.sortable && handleSort(col.key as keyof User)}
                  className={cn(
                    "px-6 py-4 text-[11px] font-black text-[#7A8FAF] uppercase tracking-widest",
                    col.sortable ? "cursor-pointer hover:text-[#1C2B4A] transition-colors" : ""
                  )}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortField === col.key && (
                      sortOrder === 'asc' ? <ChevronUp size={14} className="text-[#1C2B4A]" /> : <ChevronDown size={14} className="text-[#1C2B4A]" />
                    )}
                  </div>
                </th>
              ))}
              <th className="w-[60px] px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F2F8]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={columns.length + 1} className="px-6 py-6">
                    <div className="h-10 bg-[#F8F9FC] rounded-xl w-full" />
                  </td>
                </tr>
              ))
            ) : filteredAndSortedUsers.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-24 text-center">
                  <div className="w-16 h-16 bg-[#F8F9FC] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#A8B8D8]">
                    <Search className="w-8 h-8" />
                  </div>
                  <h4 className="text-[18px] font-bold text-[#1C2B4A]">No intelligence found</h4>
                  <p className="text-[13px] text-[#7A8FAF] mt-1 font-medium italic">Try broader search criteria.</p>
                </td>
              </tr>
            ) : (
              filteredAndSortedUsers.map((user) => {
                const statusBadge = getStatusBadge(user.status);
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-[#F8F9FC]/50 transition-all group"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-4 h-4 rounded border-[#E2E8F4] text-[#1C2B4A] focus:ring-[#1C2B4A]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E2E8F4] bg-[#F8F9FC] flex-shrink-0">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || 'User'}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#1C2B4A] font-bold text-[14px]">
                              {user.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p onClick={() => onRowClick?.(user)} className="text-base font-bold text-slate-900 hover:text-[#F97316] cursor-pointer transition-colors max-w-[220px] truncate">{user.name || 'Unnamed'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm sm:text-base font-semibold text-slate-600 hover:text-slate-900 transition-colors">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 uppercase tracking-wider">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border",
                        user.platformSegment === 'JUNIOR'
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : user.platformSegment === 'PENDING'
                          ? "bg-purple-50 text-purple-800 border-purple-300"
                          : "bg-emerald-50 text-emerald-800 border-emerald-300"
                      )}>
                        {user.platformSegment === 'JUNIOR' 
                          ? '🎒 JUNIOR' 
                          : user.platformSegment === 'PENDING'
                          ? '⏳ PENDING'
                          : '🎓 MAIN'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border",
                        statusBadge.bg,
                        statusBadge.color,
                        statusBadge.border
                      )}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-base sm:text-lg font-black text-slate-900">{user.enrollments}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Courses</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-500">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                          className="p-2 text-[#7A8FAF] hover:text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-xl transition-all"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeDropdown === user.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="absolute right-6 top-12 w-[220px] bg-white border border-[#E2E8F4] rounded-[20px] shadow-2xl p-2 z-50 overflow-hidden"
                          >
                            <button
                              onClick={() => { onRowClick?.(user); setActiveDropdown(null); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-xl transition-all group"
                            >
                              <Eye size={16} className="text-[#A8B8D8] group-hover:text-[#1C2B4A]" />
                              Inspect Portfolio
                            </button>
                            <button
                              onClick={() => { onAction?.('impersonate', user); setActiveDropdown(null); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-xl transition-all group"
                            >
                              <LogIn size={16} className="text-[#A8B8D8] group-hover:text-[#1C2B4A]" />
                              Impersonate User
                            </button>
                            <button
                              onClick={() => { onAction?.('change_role', user); setActiveDropdown(null); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold text-[#1C2B4A] hover:bg-[#F8F9FC] rounded-xl transition-all group"
                            >
                              <Shield size={16} className="text-[#A8B8D8] group-hover:text-[#1C2B4A]" />
                              Modify Authority
                            </button>
                            <div className="h-px bg-[#F0F2F8] my-2" />
                            <button
                              onClick={() => { onAction?.(user.status === 'active' ? 'suspend' : 'activate', user); setActiveDropdown(null); }}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 text-[12px] font-bold rounded-xl transition-all group",
                                user.status === 'active' ? "text-red-500 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                              )}
                            >
                              {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                              {user.status === 'active' ? 'Revoke Access' : 'Restore Access'}
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-t border-[#F0F2F8] bg-[#F8F9FC]/50">
        <span className="text-[12px] font-bold text-[#7A8FAF] uppercase tracking-widest">
          Audit Ready: {filteredAndSortedUsers.length} of {users.length} Identities
        </span>
        <div className="flex gap-2">
          <button
            disabled
            className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#A8B8D8] bg-white border border-[#E2E8F4] rounded-xl disabled:opacity-50 cursor-not-allowed"
          >
            Prev
          </button>
          <button
            disabled
            className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#A8B8D8] bg-white border border-[#E2E8F4] rounded-xl disabled:opacity-50 cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

