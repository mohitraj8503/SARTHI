'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Clock, User, Mail, GraduationCap, 
  ExternalLink, Search, Filter, MoreVertical,
  CheckCircle2, XCircle, AlertCircle, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface BlogRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: {
    name: string;
    email: string;
    onboarded: boolean;
    phone?: string;
    college?: string;
    currentCourse?: string;
  };
}

export default function BlogRequestsClient() {
  const [requests, setRequests] = useState<BlogRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/blogs/access/requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId);
    try {
      const res = await fetch('/api/admin/blogs/access/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Request ${action}d successfully`);
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
        ));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-8 font-nunito pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-brand-dark tracking-tighter uppercase font-outfit">
            Blog Access <span className="text-brand-orange">Moderation</span>
          </h2>
          <p className="text-slate-500 font-medium italic">
            Review and manage creative permissions for the SARTHI network.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-yellow-50 px-6 py-3 rounded-2xl border border-yellow-100">
            <div className="text-2xl font-black text-yellow-700 font-outfit">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-[10px] font-black text-yellow-600/50 uppercase tracking-widest">Pending</div>
          </div>
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
            <div className="text-2xl font-black text-emerald-700 font-outfit">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest">Approved</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-orange transition-colors" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/5 transition-all font-medium"
          />
        </div>

        <div className="flex gap-2 p-1.5 bg-white border border-slate-100 rounded-2xl">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                filterStatus === status 
                  ? "bg-brand-dark text-white shadow-lg" 
                  : "text-slate-400 hover:text-brand-dark hover:bg-slate-50"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table/List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-orange rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing_Pipeline...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
              <AlertCircle size={32} />
            </div>
            <p className="text-slate-500 font-bold">No access requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User_Profile</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Education_Context</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Request_Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status_Flag</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions_Console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRequests.map((req) => (
                  <motion.tr 
                    layout
                    key={req.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-all font-black text-lg">
                          {req.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-brand-dark tracking-tight">{req.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail size={12} /> {req.email}
                          </div>
                          {req.user?.phone && (
                            <div className="text-[10px] text-slate-300 font-bold mt-1 uppercase tracking-widest">
                              TEL: {req.user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <GraduationCap size={14} className="text-brand-orange" />
                          {req.user?.college || 'Unknown Institution'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                          {req.user?.currentCourse || 'Unspecified Course'}
                        </div>
                        <div className="text-[10px] text-slate-400 italic">
                          {req.user?.lastQualification || 'Qualification Not Listed'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(req.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2",
                        getStatusColor(req.status)
                      )}>
                        {req.status === 'pending' && <Clock size={12} />}
                        {req.status === 'approved' && <Check size={12} />}
                        {req.status === 'rejected' && <X size={12} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={processingId === req.id}
                            onClick={() => handleAction(req.id, 'reject')}
                            className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 group/reject"
                            title="Reject Request"
                          >
                            <X size={18} className="group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            disabled={processingId === req.id}
                            onClick={() => handleAction(req.id, 'approve')}
                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50 group/approve shadow-lg shadow-emerald-500/10"
                            title="Approve Request"
                          >
                            <Check size={18} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                          onClick={() => {
                            // Reset to pending if needed or show log
                            toast.success('Log: Action taken on ' + new Date(req.createdAt).toDateString());
                          }}
                        >
                          <MoreVertical size={20} />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
