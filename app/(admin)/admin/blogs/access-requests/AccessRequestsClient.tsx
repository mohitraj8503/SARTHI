'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Check, X, Clock, Search, Filter, 
  ChevronRight, Mail, Calendar, ShieldCheck, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function AccessRequestsClient() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blog-access-request');
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      toast.error('Failed to load access requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/blog-access-request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'rejected': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            Blog Access Requests
          </h1>
          <p className="text-slate-400 mt-2">Manage and review premium content access requests from users.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRequests}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all flex items-center gap-2 text-sm font-medium border border-slate-700"
          >
            <Clock className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pending', count: requests.filter(r => r.status === 'pending').length, color: 'text-amber-400', icon: Clock },
          { label: 'Approved', count: requests.filter(r => r.status === 'approved').length, color: 'text-emerald-400', icon: Check },
          { label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length, color: 'text-rose-400', icon: X },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.count}</h3>
            </div>
            <div className={`p-4 rounded-xl ${stat.color.replace('text', 'bg')}/10`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-5 h-5 text-slate-500" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-sm min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="p-6">User Details</th>
                <th className="p-6">Requested Email</th>
                <th className="p-6">Request Date</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td colSpan={5} className="p-6">
                        <div className="h-12 bg-slate-800/50 rounded-xl w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-500">
                        <Users className="w-16 h-16 opacity-20" />
                        <p className="text-xl font-medium">No requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <motion.tr 
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                            {request.user?.avatar_url || request.user?.image ? (
                              <Image src={request.user.avatar_url || request.user.image} alt={request.name} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100">{request.name}</p>
                            <p className="text-xs text-slate-500 font-mono">{request.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Mail className="w-4 h-4 text-slate-500" />
                          {request.email}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          {new Date(request.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-2">
                          {request.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(request.id, 'approved')}
                                className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg border border-emerald-500/20 transition-all shadow-lg shadow-emerald-500/10"
                                title="Approve"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(request.id, 'rejected')}
                                className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-500/20 transition-all shadow-lg shadow-rose-500/10"
                                title="Reject"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleUpdateStatus(request.id, 'pending')}
                              className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                            >
                              <Clock className="w-4 h-4" />
                              Reset to Pending
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
