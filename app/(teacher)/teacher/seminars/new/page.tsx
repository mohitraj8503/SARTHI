'use client';
 

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, Radio, Video, ArrowLeft, Image as ImageIcon, IndianRupee, Users, Layers, Tag, Upload } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function HostSeminarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customCategory, setCustomCategory] = useState('');

  const [seminar, setSeminar] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    scheduledAt: '',
    duration: '60',
    price: '0',
    maxAttendees: '500',
    category: 'Technology',
    level: 'Beginner',
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      addToast({ message: 'File too large. Max limit is 3MB.', type: 'error' });
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/blog-media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setSeminar(f => ({ ...f, thumbnailUrl: data.url }));
      addToast({ message: 'Thumbnail uploaded successfully!', type: 'success' });
    } catch (err: any) {
      addToast({ message: err.message || 'Failed to upload image', type: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seminar.title || !seminar.scheduledAt) {
      addToast({ message: 'Missing required fields', type: 'error' });
      return;
    }

    const finalCategory = seminar.category === 'Others' ? customCategory : seminar.category;
    if (seminar.category === 'Others' && !customCategory.trim()) {
      addToast({ message: 'Please specify your custom category', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/teacher/seminars/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...seminar,
          scheduledAt: seminar.scheduledAt ? new Date(seminar.scheduledAt).toISOString() : '',
          category: finalCategory,
          duration: Number(seminar.duration),
          price: Number(seminar.price),
          maxAttendees: Number(seminar.maxAttendees),
        }),
      });

      if (!res.ok) throw new Error('Failed to schedule seminar');

      addToast({ message: 'Seminar scheduled successfully', type: 'success' });
      router.push('/teacher/seminars');
    } catch (error: any) {
      addToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Directory Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-10 py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-4 bg-orange-500 rounded-full" />
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">LIVE ENGINE</span>
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 ml-4 bg-red-50 px-2.5 py-1 rounded-full">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> LiveKit Streaming
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                BROADCAST <span className="text-orange-500">SCHEDULER</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-3">
                Orchestrate high-impact live educational sessions for your students.
              </p>
            </div>

            <button
              onClick={() => router.back()}
              className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Seminars
            </button>
          </div>
        </div>
      </header>

      {/* Main 2-Column Content */}
      <main className="max-w-[1600px] mx-auto px-10 mt-12 grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-10">
        
        {/* LEFT: FORM */}
        <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] relative overflow-hidden group h-fit">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] pl-2">
                Seminar Topic
              </label>
              <input
                type="text"
                required
                value={seminar.title}
                onChange={(e) => setSeminar({ ...seminar, title: e.target.value })}
                className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
                placeholder="e.g. Future of AI in Education"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] pl-2 flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" /> Thumbnail Cover Image
              </label>
              <div 
                className="w-full relative aspect-[21/9] rounded-3xl border-2 border-dashed border-slate-200 hover:border-orange-500/50 bg-slate-50 hover:bg-orange-50/50 transition-all overflow-hidden flex items-center justify-center group/upload cursor-pointer shadow-inner" 
                onClick={() => fileInputRef.current?.click()}
              >
                  {seminar.thumbnailUrl ? (
                      <>
                        <img src={seminar.thumbnailUrl} alt="Cover" className="w-full h-full object-cover group-hover/upload:opacity-50 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-all">
                            <span className="bg-white/90 text-slate-900 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                                <Upload className="w-4 h-4" /> Change Image
                            </span>
                        </div>
                      </>
                  ) : (
                      <div className="text-center p-8">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 transition-transform">
                              {uploading ? <Loader2 className="w-6 h-6 text-orange-500 animate-spin" /> : <Upload className="w-6 h-6 text-slate-400 group-hover/upload:text-orange-500 transition-colors" />}
                          </div>
                          <p className="text-sm font-black text-slate-700">{uploading ? 'Uploading media...' : 'Click to Upload High-Res Cover'}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Max 3MB · 16:9 aspect ratio</p>
                      </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] pl-2">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={seminar.scheduledAt}
                  onChange={(e) => setSeminar({ ...seminar, scheduledAt: e.target.value })}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] pl-2 flex items-center gap-2">
                  <Video className="w-3.5 h-3.5" /> Duration (Minutes)
                </label>
                <input
                  type="number"
                  required
                  min="15"
                  value={seminar.duration}
                  onChange={(e) => setSeminar({ ...seminar, duration: e.target.value })}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] pl-2 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> Category
                </label>
                <select
                  value={seminar.category}
                  onChange={(e) => setSeminar({ ...seminar, category: e.target.value })}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none shadow-[0_2px_10px_rgba(15,23,42,0.02)] cursor-pointer appearance-none"
                >
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Personal Development">Personal Development</option>
                  <option value="Others">Others (Custom...)</option>
                </select>
                {seminar.category === 'Others' && (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-8 py-4 mt-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none shadow-sm animate-fade-in"
                    placeholder="Type your custom category..."
                  />
                )}
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] pl-2 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" /> Level
                </label>
                <select
                  value={seminar.level}
                  onChange={(e) => setSeminar({ ...seminar, level: e.target.value })}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none shadow-[0_2px_10px_rgba(15,23,42,0.02)] cursor-pointer appearance-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] pl-2 flex items-center gap-2">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> Seminar Charges (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={seminar.price}
                  onChange={(e) => setSeminar({ ...seminar, price: e.target.value })}
                  className="w-full px-8 py-6 bg-emerald-50 border border-emerald-200 rounded-2xl font-black text-emerald-900 placeholder:text-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] pl-2 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Maximum Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={seminar.maxAttendees}
                  onChange={(e) => setSeminar({ ...seminar, maxAttendees: e.target.value })}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] pl-2">
                Description
              </label>
              <textarea
                rows={4}
                value={seminar.description}
                onChange={(e) => setSeminar({ ...seminar, description: e.target.value })}
                className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-sm font-medium text-slate-700 placeholder:text-slate-300 resize-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none leading-relaxed shadow-[0_2px_10px_rgba(15,23,42,0.02)]"
                placeholder="What will be covered?"
              />
            </div>

            <div className="pt-8 flex flex-col md:flex-row gap-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-6 bg-white text-slate-500 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 hover:text-slate-900 border-2 border-slate-200 hover:border-slate-300 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-[2] py-6 bg-[#1B4332] text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-[#2D6A4F] hover:-translate-y-1 transition-all disabled:opacity-70 shadow-xl shadow-emerald-900/10"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Radio className="w-5 h-5" />
                )}
                Schedule Broadcast
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: LIVE PREVIEW CARD */}
        <aside className="sticky top-32 h-fit hidden lg:block">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 pl-4 flex items-center gap-2">
                <Video className="w-3.5 h-3.5" /> Live Preview
            </h3>
            
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.06)] overflow-hidden">
                <div className="relative w-full aspect-video bg-slate-50 rounded-[1.5rem] mb-6 overflow-hidden border border-slate-100">
                    {seminar.thumbnailUrl ? (
                        <img src={seminar.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3">
                            <ImageIcon className="w-12 h-12 text-slate-200" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Image</span>
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-500/20 flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 animate-pulse" /> LIVEKIT
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                        {seminar.category === 'Others' ? (customCategory || 'Custom Category') : seminar.category}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" /> {seminar.price === '0' || !seminar.price ? 'FREE' : seminar.price}
                    </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 line-clamp-2">
                    {seminar.title || 'Your Awesome Seminar Title'}
                </h3>
                
                <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-6">
                    {seminar.description || 'Description will appear here...'}
                </p>

                <div className="flex flex-col gap-3 pt-5 border-t border-slate-100">
                    <div className="flex items-center justify-between text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                <Users className="w-4 h-4 text-slate-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider">Capacity</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{seminar.maxAttendees}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                <Layers className="w-4 h-4 text-slate-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider">Level</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{seminar.level}</span>
                    </div>
                </div>
            </div>
        </aside>
      </main>
    </div>
  );
}

