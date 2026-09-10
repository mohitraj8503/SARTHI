"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Video, 
  Search, 
  Filter,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  fullName: string;
  email: string;
  domain: string;
  videoUrl: string;
  description: string;
  status: string;
  appliedAt: string;
}

export default function AdminCreatorInductionPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/induction/creator');
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'SELECTED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/induction/creator', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesFilter = filter === "ALL" || s.status === filter;
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Admin Live Control</p>
            </div>
            <h1 className="text-4xl font-extrabold text-emerald-950 tracking-tighter">CREATOR INDUCTION</h1>
            <p className="text-gray-500 font-medium mt-1">Review and manage elite program submissions.</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-emerald-950 text-white px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-emerald-950/20 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" />
                Secure Portal
             </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-emerald-500 transition-colors font-medium shadow-sm"
            />
          </div>
          <div className="flex gap-2 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
            {['ALL', 'PENDING', 'SELECTED', 'REJECTED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
                  filter === f ? "bg-emerald-950 text-white shadow-lg shadow-emerald-950/10" : "text-gray-400 hover:text-emerald-900"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-4 border-emerald-950 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Submissions...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-[3rem] p-24 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto">
                    <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-emerald-950">No Submissions Found</h3>
                <p className="text-gray-400 max-w-xs mx-auto">We couldn&apos;t find any creator applications matching your current criteria.</p>
              </div>
            ) : (
              filteredSubmissions.map((s) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-gray-100 rounded-[2.5rem] p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                  
                  <div className="flex flex-col lg:flex-row lg:items-center gap-10 relative z-10">
                    {/* User Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 font-extrabold text-lg">
                          {s.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-2xl font-extrabold text-emerald-950 tracking-tight">{s.fullName}</h3>
                          <p className="text-gray-500 font-medium">{s.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-gray-100">
                          {s.domain}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border",
                          s.status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-100" :
                          s.status === 'SELECTED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          "bg-red-50 text-red-600 border-red-100"
                        )}>
                          {s.status}
                        </span>
                        <span className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {new Date(s.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-4">
                      <a 
                        href={s.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white border border-gray-200 text-emerald-950 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-3 shadow-sm"
                      >
                        <Video className="w-5 h-5" />
                        View Video
                        <ExternalLink className="w-4 h-4 text-gray-300" />
                      </a>

                      {s.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(s.id, 'SELECTED')}
                            className="bg-emerald-950 text-white px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-950/20 flex items-center gap-3"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(s.id, 'REJECTED')}
                            className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-3 border border-red-100"
                          >
                            <XCircle className="w-5 h-5" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {s.description && (
                    <div className="mt-8 pt-8 border-t border-gray-50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Optional Description</p>
                        <p className="text-gray-600 font-medium leading-relaxed italic">&quot;{s.description}&quot;</p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
