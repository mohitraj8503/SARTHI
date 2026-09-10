'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, Mail, Link as LinkIcon, Calendar, Check, X, Search, Filter, 
  ExternalLink, ChevronRight, MoreVertical, ShieldCheck, PenTool,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminBlogWriters() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // all | pending | approved | rejected

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog-writers?status=${filter}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/blog-writers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote: `Application ${status}` }),
      });
      if (res.ok) {
        if (filter !== 'all') {
          setApplications(prev => prev.filter(app => app.id !== id));
        } else {
          setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }, [filter]);

  return (
    <div className="p-8 max-w-screen-2xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 uppercase text-[10px] font-black tracking-[4px] mb-2 px-3 py-1 bg-amber-100 rounded-full w-fit border border-amber-200">
             <PenTool className="w-3.5 h-3.5 text-amber-700" /> Fellowship Management
          </div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tighter">Blog Writer <span className="text-slate-400">Applications</span></h1>
          <p className="text-slate-600 text-[15px] font-medium">Review and verify community members for the SARTHI technical writing fellowship.</p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 rounded-[18px] border border-slate-200 shadow-sm">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              className={cn(
                "px-5 py-2 rounded-[14px] text-[11px] font-black uppercase tracking-widest transition-all",
                filter === s 
                  ? "bg-white text-slate-900 shadow-md border border-slate-200" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
              )}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      <section className="rounded-[24px] border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">
          Review each writing sample, verify topical fit, and decide whether the applicant should join the SARTHI publishing fellowship.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          This queue is designed to keep moderation decisions visible even while data is still loading, so the admin workspace never collapses into an empty shell.
        </p>
      </section>

      {/* Table Container */}
      <div className="bg-white border border-[#E2E8F4] rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#1C2B4A]/5 transition-all duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-[#E2E8F4]">
                <th className="p-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[2.5px]">Applicant Credentials</th>
                <th className="p-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[2.5px]">Specializations</th>
                <th className="p-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[2.5px]">Submission Link</th>
                <th className="p-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[2.5px]">Engagement Date</th>
                <th className="p-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[2.5px]">Current State</th>
                <th className="p-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[2.5px] text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[80px]">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded-full w-full" />
                    </td>
                  </tr>
                ))
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4 py-20">
                       <AlertCircle className="w-12 h-12 text-slate-400" />
                       <span className="text-[12px] font-black uppercase tracking-[4px] text-slate-900">No Applications Found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1C2B4A] text-white flex items-center justify-center font-black text-xs uppercase">
                           {app.fullName?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[#1C2B4A] font-bold text-[15px]">{app.fullName}</span>
                          <span className="text-[#64748B] text-[13px] font-medium">{app.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {(app.categories || '').split(',').filter(Boolean).map((cat: string) => (
                          <span key={cat} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-[#475569] text-[9px] font-black uppercase border border-slate-200 tracking-wider">
                            {cat.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-6">
                      {app.portfolioUrl ? (
                        <a href={app.portfolioUrl} target="_blank" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-[12px] font-bold uppercase tracking-widest transition-colors">
                          Review Work <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-6 text-[#64748B] text-[13px] font-medium uppercase tracking-tight">
                      {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        app.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                        app.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                        'bg-amber-50 text-amber-600 border-amber-200'
                      )}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        {app.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(app.id, 'approved')}
                              className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                              title="Approve Applicant"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                              title="Reject Applicant"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <Link href={`/admin/blog-writers/${app.id}`} className="w-10 h-10 rounded-xl bg-[#1C2B4A] text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-[#1C2B4A]/10">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

