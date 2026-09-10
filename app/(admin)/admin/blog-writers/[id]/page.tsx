'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, User, Mail, Link as LinkIcon, Calendar,
  Check, X, AlertCircle, Loader2, ExternalLink, GraduationCap, MapPin, Globe
} from 'lucide-react';
import Link from 'next/link';

export default function AdminWriterReview() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApplication = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/blog-writers/${id}`);
      const data = await res.json();
      const item = data.application;
      if (item) {
        setApp(item);
        setAdminNote(item.adminNote || '');
      }
    } catch (err) {
      console.error('Failed to fetch writer application:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleAction = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/blog-writers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote }),
      });
      if (res.ok) {
        router.push('/admin/blog-writers');
      }
    } catch (err) {
       console.error('Failed to update application status:', err);
    } finally {
       setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-4 text-center px-8">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4A017]" />
        <h1 className="text-xl font-black uppercase tracking-widest text-white">Loading Writer Application</h1>
        <p className="max-w-md text-sm text-white/50">
          Fetching the candidate profile, writing sample, and review notes so the admin view can render safely.
        </p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-6 text-white/40">
        <AlertCircle className="w-20 h-20" />
        <h1 className="text-2xl font-black uppercase tracking-widest">Application Not Found</h1>
        <p className="text-white/30 text-center max-w-xl">
          The writer application you&apos;re looking for may have been removed or is temporarily unavailable.
        </p>
        <Link href="/admin/blog-writers" className="text-[#D4A017] hover:underline font-bold text-xs uppercase tracking-widest mt-6 inline-block">Back to Management →</Link>
      </div>
    );
  }

  return (
    <div className="p-8 pb-40 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link href="/admin/blog-writers" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-10 text-[11px] font-black uppercase tracking-widest">
        <ChevronLeft className="w-4 h-4" /> Back to Management
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        <div className="space-y-12">
          {/* Main Review Area */}
          <section className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden p-8 md:p-12">
             <header className="mb-12">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-[#D4A017] shadow-xl overflow-hidden">
                        {app.fullName?.[0]}
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-none uppercase tracking-tight mb-3">
                            {app.fullName}
                        </h1>
                        <div className="flex items-center gap-4 text-white/40 text-[11px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {app.email}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                
                {/* Categories */}
                <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
                    {app.categories?.map((cat: string) => (
                        <span key={cat} className="px-5 py-2 rounded-xl bg-[#D4A017]/10 text-[#D4A017] text-[10px] font-black uppercase tracking-widest border border-[#D4A017]/20">
                            {cat}
                        </span>
                    ))}
                </div>
             </header>

             {/* Content Metadata */}
             <div className="flex flex-col gap-12 text-white">
                <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Portfolio / Online Presence</h3>
                    {app.portfolioUrl ? (
                         <a 
                            href={app.portfolioUrl} 
                            target="_blank" 
                            className="inline-flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:border-[#D4A017]/40 hover:bg-white/10 transition-all group"
                         >
                            <Globe className="w-5 h-5 text-[#D4A017] opacity-60 group-hover:opacity-100 transition-opacity" />
                            <span className="text-sm font-bold text-white/80">{app.portfolioUrl}</span>
                            <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                         </a>
                    ) : (
                        <p className="text-white/20 text-sm italic">No portfolio provided</p>
                    )}
                </div>

                <div className="h-px bg-white/5 w-full" />

                <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Writing Sample Contents</h3>
                    <div className="bg-white/[0.02] p-8 rounded-[32px] border border-white/5 text-sm md:text-base leading-relaxed text-white/60 font-medium font-serif whitespace-pre-wrap">
                        {app.writingSample}
                    </div>
                </div>
             </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <aside className="space-y-8 h-fit lg:sticky lg:top-8">
          {/* Current Status */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white/20">Application Status</h4>
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${app.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : app.status === 'rejected' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'}`} />
                <span className="text-white font-black text-sm uppercase tracking-widest">{app.status}</span>
            </div>
          </div>

          {/* Admin Note Input */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-white/20">Decision Remarks</h4>
            <textarea 
                rows={5} 
                value={adminNote} 
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Explain the decision or provide guidance for the applicant..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-white text-[13px] font-medium placeholder:text-white/10 focus:outline-none focus:border-[#D4A017]/40 transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col gap-3">
              <button 
                onClick={() => handleAction('approved')}
                disabled={updating || app.status === 'approved'}
                className="w-full py-4 rounded-xl bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-30"
              >
                 <Check className="w-4 h-4" /> Approve Writer
              </button>
              <button 
                onClick={() => handleAction('rejected')}
                disabled={updating || app.status === 'rejected'}
                className="w-full py-4 rounded-xl bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/10 flex items-center justify-center gap-2 disabled:opacity-30"
              >
                 <X className="w-4 h-4" /> Reject Applicant
              </button>
          </div>
          
          <div className="p-4 rounded-2xl bg-[#D4A017]/5 border border-[#D4A017]/10 flex gap-4">
              <AlertCircle className="w-10 h-10 text-[#D4A017] opacity-40 shrink-0" />
              <p className="text-[10px] text-white/40 font-medium leading-relaxed">
                  Approving will automatically upgrade this user&apos;s role to <span className="text-[#D4A017]">BLOG_WRITER</span> and notify them via email.
              </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
