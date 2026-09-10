'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Search,
  Mail,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Calendar,
  XCircle,
  ChevronRight,
  User,
  Fingerprint,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SafeDate } from '@/components/admin/SafeDate';

interface UserResult {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
  createdAt: string;
}

interface PasswordResetRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  reason: string | null;
  status: string;
  newPassword: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ManagePasswordsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'direct' | 'requests'>('direct');

  // Direct password change states
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);

  // Reset requests states
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>(
    'PENDING'
  );
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);

  // Common states
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch reset requests
  const fetchRequests = useCallback(async () => {
    try {
      const url =
        requestFilter === 'ALL'
          ? '/api/admin/password-resets'
          : `/api/admin/password-resets?status=${requestFilter}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        if (Array.isArray(data)) {
          setRequests(data);
        } else if (data?.items && Array.isArray(data.items)) {
          setRequests(data.items);
        } else {
          setRequests([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch password reset requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  }, [requestFilter]);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab, fetchRequests]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/admin/users/password?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser || !newPassword) return;

    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/users/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setNewPassword('');
        setTimeout(() => {
          setSelectedUser(null);
          setMessage(null);
        }, 2000);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update password' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setUpdating(false);
    }
  };

  const handleProcessRequest = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    if (action === 'APPROVED' && !newPassword) {
      setMessage({ type: 'error', text: 'Please enter a new password' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/password-resets/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          approve: action === 'APPROVED',
          newPassword: action === 'APPROVED' ? newPassword : null,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Request ${action.toLowerCase()} successfully!` });
        setNewPassword('');
        setTimeout(() => {
          setSelectedRequest(null);
          setMessage(null);
          fetchRequests();
        }, 2000);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to process request' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setUpdating(false);
    }
  };

  const pendingCount = Array.isArray(requests)
    ? requests.filter((r) => r.status === 'PENDING').length
    : 0;

  return (
    <div className="relative flex-1 w-full animate-fade-in overflow-hidden">
      {/* Background Atmosphere - Premium Decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[80px] animate-pulse" />
        <div className="absolute top-[20%] -right-10 w-[300px] h-[300px] rounded-full bg-rose-500/5 blur-[60px] animate-float" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] -left-20 w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[70px] animate-float-delayed" style={{ animationDuration: '10s' }} />
      </div>

      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">SECURITY PROTOCOL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              ACCESS <span className="text-[#F97316]">CONTROL</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
              Credential overrides and identity recovery orchestration.
            </p>
          </div>

          <div className="flex bg-[#0F172A]/5 p-1 rounded-2xl border border-slate-100 mt-2">
            <button
              onClick={() => setActiveTab('direct')}
              className={cn(
                "px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === 'direct' ? "bg-white text-[#0F172A] shadow-md" : "text-slate-400 hover:text-[#0F172A]"
              )}
            >
              Direct Override
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={cn(
                "px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative",
                activeTab === 'requests' ? "bg-white text-[#0F172A] shadow-md" : "text-slate-400 hover:text-[#0F172A]"
              )}
            >
              Requests
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg shadow-rose-500/20">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'direct' ? (
            <motion.div
              key="direct"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Premium Search Bar */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Scan user by email or professional identity..."
                  className="w-full bg-white/80 backdrop-blur-md border border-slate-100 rounded-[2rem] pl-16 pr-[240px] py-7 text-[15px] font-medium text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 focus:outline-none transition-all shadow-[0_10px_40px_rgba(0,0,0,0.02)]"
                />
                <div className="absolute inset-y-2 right-2 flex items-center gap-2">
                   <div className="h-full w-px bg-slate-100 mx-2" />
                   <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="flex items-center gap-3 px-8 py-4 bg-[#0F172A] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all shadow-md group disabled:opacity-50"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    Run Global Scan
                  </button>
                </div>
              </div>

              {/* Grid System for Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {users.map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-[#0F172A]/5 transition-all group duration-500"
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-[#0F172A] text-2xl group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-400 transition-all duration-500">
                          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-[20px] font-black text-[#0F172A] tracking-tighter uppercase italic">{user.name || 'Anonymous User'}</h3>
                          <p className="text-[13px] text-slate-400 font-medium flex items-center gap-2">
                             <Mail className="w-4 h-4 text-slate-300" /> {user.email}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                             <span className={cn(
                              "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em]",
                              user.role === 'ADMIN' ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                            )}>
                               {user.role}
                             </span>
                             <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                               ID: {user.id.slice(-8).toUpperCase()}
                             </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          generateRandomPassword();
                        }}
                        className="w-14 h-14 bg-slate-50 text-[#0F172A] rounded-2xl hover:bg-[#0F172A] hover:text-white transition-all border border-slate-100 flex items-center justify-center shadow-sm group/btn"
                      >
                        <RotateCcw className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {searchQuery && !searching && users.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 border-dashed relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-50/30 opacity-50" />
                  <div className="relative z-10 space-y-4">
                    <AlertCircle className="w-16 h-16 text-slate-200 mx-auto opacity-50" />
                    <h3 className="text-[14px] font-black text-slate-400 uppercase tracking-[0.3em]">Zero results found for scan</h3>
                    <p className="text-[12px] text-slate-300 font-medium italic">Ensure the identity credentials are exact.</p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Premium Table Module */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.02)]">
                  <div className="flex gap-2 p-3 bg-slate-50/50 border-b border-slate-100">
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setRequestFilter(status)}
                        className={cn(
                          "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                          requestFilter === status ? "bg-white text-[#0F172A] shadow-sm border border-slate-100" : "text-slate-400 hover:text-[#0F172A]"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="bg-white border-b border-slate-50">
                                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Requester</th>
                                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Context</th>
                                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operational Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {loadingRequests ? (
                                  Array.from({ length: 3 }).map((_, i) => (
                                      <tr key={i} className="animate-pulse">
                                          <td colSpan={4} className="px-10 py-10 h-24 bg-slate-50/20"></td>
                                      </tr>
                                  ))
                              ) : requests.length === 0 ? (
                                  <tr>
                                      <td colSpan={4} className="px-10 py-32 text-center">
                                         <AlertCircle className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                                         <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.4em]">Security queue is clear</p>
                                      </td>
                                  </tr>
                              ) : (
                                  requests.map((request) => (
                                      <tr key={request.id} className="hover:bg-slate-50/30 transition-colors group">
                                          <td className="px-10 py-8">
                                              <div className="flex items-center gap-5">
                                                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[#0F172A] uppercase border border-slate-200 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-400 transition-all duration-500">
                                                      {(request.userName || request.userEmail)[0]}
                                                  </div>
                                                  <div>
                                                      <p className="text-[15px] font-black text-[#0F172A] tracking-tight group-hover:text-amber-600 transition-colors">{request.userName || 'Unknown Source'}</p>
                                                      <p className="text-[11px] text-slate-400 font-medium">{request.userEmail}</p>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-10 py-8">
                                              <p className="text-[14px] text-slate-500 font-medium max-w-md line-clamp-1 italic group-hover:text-[#0F172A] transition-colors">
                                                  &ldquo;{request.reason || 'No justification provided'}&rdquo;
                                              </p>
                                          </td>
                                          <td className="px-10 py-8">
                                              <div className="flex items-center gap-3 text-[12px] text-[#0F172A] font-black uppercase tracking-tighter">
                                                  <Calendar className="w-4 h-4 text-slate-300" />
                                                  <SafeDate date={request.createdAt} options={{ month: 'short', day: 'numeric', year: 'numeric' }} />
                                              </div>
                                          </td>
                                          <td className="px-10 py-8 text-right">
                                              <div className="flex items-center justify-end gap-6">
                                                  <span className={cn(
                                                      "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                                      request.status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                      request.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                                  )}>
                                                      {request.status}
                                                  </span>
                                                  {request.status === 'PENDING' && (
                                                      <button
                                                        onClick={() => {
                                                          setSelectedRequest(request);
                                                          generateRandomPassword();
                                                        }}
                                                        className="w-10 h-10 bg-[#0F172A] text-white rounded-xl hover:bg-amber-500 transition-all flex items-center justify-center shadow-lg shadow-[#0F172A]/10"
                                                      >
                                                          <ChevronRight className="w-5 h-5" />
                                                      </button>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Module - Ultra High Fidelity */}
        <AnimatePresence>
          {(selectedUser || selectedRequest) && (
            <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="bg-white border border-slate-100 rounded-[3rem] p-12 max-w-xl w-full shadow-2xl relative overflow-hidden"
              >
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-10">
                     <div className="w-16 h-16 rounded-[2rem] bg-[#0F172A]/5 text-[#0F172A] flex items-center justify-center shadow-inner">
                        <Key className="w-8 h-8" />
                     </div>
                     <div>
                        <h2 className="text-[28px] font-black text-[#0F172A] tracking-tighter uppercase leading-none">Identity <span className="text-amber-500 italic">Override</span></h2>
                        <p className="text-[13px] text-slate-400 font-medium mt-1 uppercase tracking-widest font-black">Security Authentication Protocol</p>
                     </div>
                  </div>

                   {/* Target Info */}
                  <div className="mb-10 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-40 transition-opacity" />
                      <div className="relative z-10 flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-[#0F172A] text-xl shadow-sm">
                              {(selectedUser?.name || selectedRequest?.userName || 'U')[0]}
                          </div>
                          <div>
                              <p className="text-[17px] font-black text-[#0F172A] tracking-tight uppercase italic">{selectedUser?.name || selectedRequest?.userName || 'Anonymous Entity'}</p>
                              <p className="text-[13px] text-slate-400 font-medium">{selectedUser?.email || selectedRequest?.userEmail}</p>
                          </div>
                      </div>
                  </div>

                  {/* Input Module */}
                  <div className="space-y-8">
                      <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Provisioned Credential Hash</label>
                          <div className="relative group">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new master credential..."
                                className="w-full pl-8 pr-20 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-amber-500 focus:bg-white font-mono tracking-widest text-[#0F172A] text-[15px] shadow-inner transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-amber-500 transition-colors"
                              >
                                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                              </button>
                          </div>
                          <button
                            onClick={generateRandomPassword}
                            className="mt-4 text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest flex items-center gap-3 transition-colors group/hash"
                          >
                             <RotateCcw className="w-4 h-4 group-hover/hash:rotate-180 transition-transform duration-500" /> Generate Secure Entropy
                          </button>
                      </div>

                       {/* Message Logic */}
                      <AnimatePresence>
                        {message && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "p-6 rounded-2xl flex items-center gap-4 border",
                              message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
                            )}
                          >
                            {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            <span className="text-[14px] font-black tracking-tight">{message.text}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Control Group */}
                      <div className="flex gap-4 pt-4">
                          {selectedUser ? (
                            <button
                              onClick={handleUpdatePassword}
                              disabled={updating || !newPassword || newPassword.length < 6}
                              className="flex-1 px-10 py-5 bg-[#0F172A] text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all shadow-xl shadow-[#0F172A]/10 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
                            >
                              {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5 stroke-[3]" />}
                              Confirm Override
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleProcessRequest(selectedRequest!.id, 'APPROVED')}
                                disabled={updating || !newPassword}
                                className="flex-1 px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/10 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
                              >
                                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5 stroke-[3]" />}
                                Grant Access
                              </button>
                              <button
                                onClick={() => handleProcessRequest(selectedRequest!.id, 'REJECTED')}
                                disabled={updating}
                                className="px-10 py-5 bg-white border border-slate-100 text-rose-500 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 transition-all active:scale-95"
                              >
                                 Reject
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => {
                              setSelectedUser(null);
                              setSelectedRequest(null);
                              setNewPassword('');
                              setMessage(null);
                            }}
                            disabled={updating}
                            className="px-8 py-5 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] hover:text-[#0F172A] transition-colors"
                          >
                             Cancel
                          </button>
                      </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

