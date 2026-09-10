'use client';

import { useState } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Mail,
  ShieldAlert,
  MoreHorizontal,
  RefreshCw,
  Search,
  Plus,
  ArrowUpDown,
  UserSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface StaffMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  image: string | null;
  createdAt: string;
  lastActive: string | null;
  _count: {
    courses: number;
    workshops: number;
    seminars: number;
  };
}

export default function StaffManagementPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const { data: staff, isLoading } = useQuery<StaffMember[]>({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const res = await fetch('/api/admin/staff');
      if (!res.ok) throw new Error('Failed to fetch staff');
      const json = await res.json();
      return json.data;
    }
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ userId, role, status }: { userId: string, role?: string, status?: string }) => {
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, status })
      });
      if (!res.ok) throw new Error('Failed to update staff');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      addToast({ title: 'Success', message: 'Staff member updated successfully', type: 'success' });
    }
  });

  const filteredStaff = staff?.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const roles = ['ALL', 'ADMIN', 'TEACHER', 'INSTRUCTOR', 'SUPER_ADMIN'];

  const statColorClasses: Record<string, { bg: string; iconBg: string; iconText: string }> = {
    blue: { bg: 'bg-blue-500/5', iconBg: 'bg-blue-500/10', iconText: 'text-blue-500' },
    purple: { bg: 'bg-purple-500/5', iconBg: 'bg-purple-500/10', iconText: 'text-purple-500' },
    green: { bg: 'bg-green-500/5', iconBg: 'bg-green-500/10', iconText: 'text-green-500' },
    orange: { bg: 'bg-orange-500/5', iconBg: 'bg-orange-500/10', iconText: 'text-orange-500' },
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'SUPER_ADMIN': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'TEACHER': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'INSTRUCTOR': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen bg-[#050505]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            Staff Management
          </h1>
          <p className="text-gray-400 mt-1">Manage platform administrators, teachers, and instructors.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Invite Staff
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: staff?.length || 0, icon: Users, color: 'blue' },
          { label: 'Admins', value: staff?.filter(s => s.role.includes('ADMIN')).length || 0, icon: Shield, color: 'purple' },
          { label: 'Teachers', value: staff?.filter(s => s.role === 'TEACHER').length || 0, icon: UserCheck, color: 'green' },
          { label: 'Pending Invitations', value: 0, icon: Mail, color: 'orange' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-[#0f0f0f] border border-white/5 p-5 rounded-2xl relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${statColorClasses[stat.color]?.bg || 'bg-gray-500/5'} rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform`} />
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${statColorClasses[stat.color]?.iconBg || 'bg-gray-500/10'} ${statColorClasses[stat.color]?.iconText || 'text-gray-500'}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-inner"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border",
                selectedRole === role 
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "bg-[#0f0f0f] border-white/5 text-gray-500 hover:text-white hover:border-white/10"
              )}
            >
              {role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Staff Member</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Assets</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode='popLayout'>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4 h-16 bg-white/[0.01]" />
                    </tr>
                  ))
                ) : filteredStaff?.map((member) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={member.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                          <Image
                            src={member.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`}
                            alt={member.name || ''}
                            fill
                            className="rounded-full object-cover border border-white/10"
                          />
                          {member.lastActive && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0f0f0f] rounded-full shadow-sm" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name || 'Unnamed'}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border",
                        getRoleBadgeColor(member.role)
                      )}>
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                        <div className="flex items-center gap-1 group/item">
                          <Shield className="w-3.5 h-3.5 group-hover/item:text-blue-500 transition-colors" />
                          <span>{member._count.courses + member._count.seminars + member._count.workshops}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => updateStaffMutation.mutate({ 
                          userId: member.id, 
                          status: member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' 
                        })}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                          member.status === 'ACTIVE'
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        )}
                      >
                        {member.status === 'ACTIVE' ? <CheckCircle className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        {member.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative group/menu">
                          <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
                            <Shield className="w-5 h-5" />
                          </button>
                          <div className="invisible group-hover/menu:visible absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 p-2 overflow-hidden transform origin-top-right transition-all">
                            <p className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-widest">Change Role</p>
                            {roles.filter(r => r !== 'ALL').map(role => (
                              <button
                                key={role}
                                onClick={() => updateStaffMutation.mutate({ userId: member.id, role })}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
                              >
                                {role.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {(!filteredStaff || filteredStaff.length === 0) && !isLoading && (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserSearch className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-white font-semibold text-lg">No staff members found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">Try adjusting your search terms or role filters to find who you&apos;re looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper for standard CheckCircle from students page
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

