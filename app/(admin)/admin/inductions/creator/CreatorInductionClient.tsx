'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Video, User, Mail, 
  ExternalLink, Search, Filter, ArrowLeft, Play,
  Calendar, Award, MessageSquare, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Submission {
  id: string;
  fullName: string;
  email: string;
  domain: string;
  videoUrl: string;
  videoTopic: string;
  description: string;
  status: 'PENDING' | 'SELECTED' | 'REJECTED';
  appliedAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export default function CreatorInductionClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SELECTED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');

  const filteredSubmissions = submissions.filter(s => {
    const matchesFilter = filter === 'ALL' || s.status === filter;
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || 
                         s.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = async (id: string, status: 'SELECTED' | 'REJECTED') => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/induction/creator', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (res.ok) {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        if (selectedSub?.id === id) {
          setSelectedSub({ ...selectedSub, status });
        }
      }
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/admin/inductions" className="flex items-center gap-2 text-gray-400 hover:text-brand-orange transition-colors mb-4 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
          </Link>
          <h1 className="text-4xl font-black text-brand-dark tracking-tighter uppercase font-outfit">
            Creator <span className="text-brand-orange">Submissions</span>
          </h1>
          <p className="text-gray-500 font-medium italic mt-1">Review and manage elite creator applications.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search creators..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange transition-all font-semibold text-sm w-[300px]"
            />
          </div>
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-brand-orange/5 focus:border-brand-orange transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <option value="ALL">ALL_STATUS</option>
            <option value="PENDING">PENDING</option>
            <option value="SELECTED">SELECTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Stats Quick Look */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pending Review', value: submissions.filter(s => s.status === 'PENDING').length, color: 'text-brand-orange', bg: 'bg-brand-orange/5' },
          { label: 'Total Selected', value: submissions.filter(s => s.status === 'SELECTED').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Rejected', value: submissions.filter(s => s.status === 'REJECTED').length, color: 'text-red-600', bg: 'bg-red-50' }
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-gray-50 flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-brand-dark tracking-tighter font-outfit">{stat.value}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </div>
            <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
              <Award size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-50 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Creator</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Domain</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Applied</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredSubmissions.length > 0 ? filteredSubmissions.map((sub) => (
                <motion.tr 
                  key={sub.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group border-b border-gray-50 hover:bg-gray-50/30 transition-all cursor-pointer"
                  onClick={() => setSelectedSub(sub)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange font-black">
                        {sub.fullName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-brand-dark text-sm tracking-tight">{sub.fullName}</div>
                        <div className="text-[11px] font-medium text-gray-400">{sub.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {sub.domain}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {sub.status === 'PENDING' && <Clock className="text-brand-orange" size={14} />}
                      {sub.status === 'SELECTED' && <CheckCircle2 className="text-emerald-500" size={14} />}
                      {sub.status === 'REJECTED' && <XCircle className="text-red-500" size={14} />}
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        sub.status === 'PENDING' ? "text-brand-orange" : 
                        sub.status === 'SELECTED' ? "text-emerald-600" : "text-red-600"
                      )}>
                        {sub.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-[11px] font-bold text-gray-400">
                      {new Date(sub.appliedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 rounded-xl bg-gray-100 text-gray-400 group-hover:bg-brand-dark group-hover:text-white transition-all active:scale-90">
                      <Play size={16} />
                    </button>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                        <AlertCircle size={40} />
                      </div>
                      <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[11px]">No submissions found</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSub(null)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-3xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-10 pt-10 pb-8 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-brand-orange text-white flex items-center justify-center text-2xl font-black">
                    {selectedSub.fullName[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-brand-dark tracking-tighter uppercase font-outfit">{selectedSub.fullName}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-[9px] font-black uppercase tracking-widest rounded-full">
                        {selectedSub.domain}
                      </span>
                      <span className="text-gray-300">•</span>
                      <div className="text-[11px] font-bold text-gray-400 italic">{selectedSub.email}</div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedSub(null)} className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
                  <ArrowLeft size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto px-10 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Video & Meta */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Video size={12} className="text-brand-orange" /> VIDEO_SUBMISSION
                    </h4>
                    <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl relative group">
                      <video 
                        src={selectedSub.videoUrl} 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">METADATA</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Applied_On</div>
                        <div className="text-sm font-bold text-brand-dark">{new Date(selectedSub.appliedAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current_Status</div>
                        <div className={cn(
                          "text-sm font-black uppercase tracking-widest",
                          selectedSub.status === 'PENDING' ? "text-brand-orange" : 
                          selectedSub.status === 'SELECTED' ? "text-emerald-600" : "text-red-600"
                        )}>
                          {selectedSub.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Vision & description */}
                <div className="space-y-10">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={12} className="text-brand-orange" /> PROJECT_DESCRIPTION
                    </h4>
                    <div className="p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm italic text-gray-600 leading-relaxed font-medium">
                      &quot;{selectedSub.description}&quot;
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SUBMISSION_DETAILS</h4>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Video Topic</span>
                           <span className="text-sm font-bold text-brand-dark">{selectedSub.videoTopic || 'N/A'}</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-10 py-10 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                {selectedSub.status !== 'REJECTED' && (
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedSub.id, 'REJECTED')}
                    className="px-8 py-5 rounded-2xl border border-red-100 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex-shrink-0"
                  >
                    {isUpdating ? 'SYNCING...' : 'REJECT_APPLICATION'}
                  </button>
                )}
                
                {selectedSub.status !== 'SELECTED' && (
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedSub.id, 'SELECTED')}
                    className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isUpdating ? 'FINALIZING...' : (
                      <>
                        <CheckCircle2 size={16} /> APPROVE_&_SEND_EMAIL
                      </>
                    )}
                  </button>
                )}

                {selectedSub.status === 'SELECTED' && (
                   <div className="flex-1 bg-emerald-50 text-emerald-700 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                      <CheckCircle2 size={16} /> CREATOR_SELECTED_&_NOTIFIED
                   </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
