'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, User, Mail, Globe, PenTool } from 'lucide-react';

const CATEGORY_OPTIONS = ['Tech', 'AI & ML', 'Career', 'Web Dev', 'DevOps', 'Startup', 'Design'];

export default function BlogWriterForm() {
  const [form, setForm] = useState({
    fullName: '', email: '', portfolioUrl: '',
    writingSample: '', categories: [] as string[],
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/induction/blog-writer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.status === 409) {
          setStatus('duplicate');
          return;
      }

      if (!res.ok) throw new Error('Submission failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-8">
        <div className="w-24 h-24 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center border border-[#2D6A4F]/20">
            <CheckCircle2 className="w-12 h-12 text-[#2D6A4F]" />
        </div>
        <div className="space-y-4">
            <h3 className="text-3xl font-black text-[#1A3C2E] uppercase tracking-tighter">Application Received!</h3>
            <p className="text-[#5D705C] max-w-sm text-[16px] leading-relaxed font-medium mx-auto">
              We&apos;ve received your application. Our editorial team will review it and get back to you within 3–5 business days. Keep an eye on your inbox!
            </p>
        </div>
        <button 
          onClick={() => setStatus('idle')}
          className="px-10 py-4 rounded-[18px] bg-[#1A3C2E] text-white text-[13px] font-black uppercase tracking-widest hover:bg-[#2D6A4F] transition-all shadow-xl shadow-[#1A3C2E]/20"
        >
          Send Another Application
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-10 text-[#1A3C2E]" onSubmit={handleSubmit}>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3.5">
          <label className="text-[11px] font-black uppercase tracking-widest text-[#5D705C] flex items-center gap-2">
            <User className="w-4 h-4 text-[#2D6A4F]" /> Full Name *
          </label>
          <input 
            type="text" required placeholder="RAHUL SHARMA"
            className="w-full bg-[#1A3C2E]/[0.02] border border-[#E8E2D9] rounded-2xl px-6 py-4.5 text-[#1A3C2E] placeholder:text-[#5D705C]/30 focus:outline-none focus:border-[#2D6A4F] focus:shadow-[0_0_0_4px_rgba(45,106,79,0.06)] transition-all uppercase tracking-wider text-[14px] font-bold"
            value={form.fullName}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} 
          />
        </div>
        <div className="space-y-3.5">
          <label className="text-[11px] font-black uppercase tracking-widest text-[#5D705C] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#2D6A4F]" /> Email Address *
          </label>
          <input 
            type="email" required placeholder="rahul@sarthi-woad.vercel.app"
            className="w-full bg-[#1A3C2E]/[0.02] border border-[#E8E2D9] rounded-2xl px-6 py-4.5 text-[#1A3C2E] placeholder:text-[#5D705C]/30 focus:outline-none focus:border-[#2D6A4F] focus:shadow-[0_0_0_4px_rgba(45,106,79,0.06)] transition-all text-[14px] font-bold lowercase tracking-wider"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
          />
        </div>
      </div>

      <div className="space-y-3.5">
        <label className="text-[11px] font-black uppercase tracking-widest text-[#5D705C] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#2D6A4F]" /> Portfolio / LinkedIn URL
        </label>
        <input 
          type="url" placeholder="https://linkedin.com/in/rahulsharma"
          className="w-full bg-[#1A3C2E]/[0.02] border border-[#E8E2D9] rounded-2xl px-6 py-4.5 text-[#1A3C2E] placeholder:text-[#5D705C]/30 focus:outline-none focus:border-[#2D6A4F] focus:shadow-[0_0_0_4px_rgba(45,106,79,0.06)] transition-all text-[14px] font-bold lowercase tracking-wider"
          value={form.portfolioUrl}
          onChange={e => setForm(f => ({ ...f, portfolioUrl: e.target.value }))} 
        />
      </div>

      <div className="space-y-3.5">
        <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#5D705C] flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#2D6A4F]" /> Writing Sample *
            </label>
            <span className="text-[10px] font-bold text-[#E8B84B] uppercase tracking-widest px-3 py-1 bg-[#E8B84B]/5 rounded-full border border-[#E8B84B]/10">Min 200 Words</span>
        </div>
        <textarea 
          rows={6} required placeholder="Paste your tech sample or article link here..."
          className="w-full bg-[#1A3C2E]/[0.02] border border-[#E8E2D9] rounded-[28px] px-8 py-8 text-[#1A3C2E] placeholder:text-[#5D705C]/30 focus:outline-none focus:border-[#2D6A4F] focus:shadow-[0_0_0_4px_rgba(45,106,79,0.06)] transition-all text-[16px] font-medium leading-relaxed"
          value={form.writingSample}
          onChange={e => setForm(f => ({ ...f, writingSample: e.target.value }))} 
        />
      </div>

      <div className="space-y-5">
        <label className="text-[11px] font-black uppercase tracking-widest text-[#5D705C] block">Topics You&apos;d Like to Write About</label>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORY_OPTIONS.map(cat => (
            <button 
              type="button" key={cat}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all
                ${form.categories.includes(cat) 
                  ? 'bg-[#1A3C2E] text-white border-[#1A3C2E] shadow-xl shadow-[#1A3C2E]/20' 
                  : 'bg-white text-[#5D705C] border-[#E8E2D9] hover:border-[#1A3C2E] hover:text-[#1A3C2E]'}`}
              onClick={() => toggleCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-8 space-y-6">
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="w-full h-16 flex items-center justify-center gap-4 rounded-[22px] bg-[#1A3C2E] text-white text-[14px] font-black uppercase tracking-[2px] hover:bg-[#2D6A4F] transition-all hover:scale-[1.02] shadow-2xl shadow-[#1A3C2E]/20 disabled:opacity-50 disabled:scale-100 no-transform"
        >
          {status === 'loading' ? (
              <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
              <>Submit Application <ArrowRight className="w-5 h-5" /></>
          )}
        </button>

        {status === 'error' && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest border border-red-100">
                <AlertCircle className="w-4 h-4" />
                Something went wrong. Please try again.
            </div>
        )}
        {status === 'duplicate' && (
            <div className="p-4 rounded-xl bg-[#E8B84B]/5 text-[#E8B84B] flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest border border-[#E8B84B]/10">
                <AlertCircle className="w-4 h-4" />
                An application with this email already exists.
            </div>
        )}
      </div>
    </form>
  );
}

