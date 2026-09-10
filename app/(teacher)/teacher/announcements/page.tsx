'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Search, Filter, MoreVertical, Trash2, Edit3, Send, Clock, Users, Book } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ToastProvider';

export default function AnnouncementsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['teacher-announcements'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/announcements');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/teacher/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-announcements'] });
      setIsCreating(false);
      addToast('Announcement published successfully!', 'success');
    },
    onError: (error) => {
      addToast('Failed to publish: ' + error.message, 'error');
    }
  });

  if (isLoading) return (
    <div className="p-10 animate-pulse space-y-8">
      <div className="h-10 w-48 bg-slate-100 rounded-lg" />
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-50 rounded-3xl" />)}
      </div>
    </div>
  );

  const announcements = announcementsData?.announcements || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Studio <span className="text-blue-600">Broadcast</span></h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Reach your students instantly</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create New
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <main className="lg:col-span-8 space-y-6">
          {isCreating && (
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createAnnouncement.mutate({
                  title: formData.get('title'),
                  message: formData.get('message'),
                  targetAudience: formData.get('audience'),
                });
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Title</label>
                  <input name="title" placeholder="e.g. New resources added to Module 2" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all font-medium" required />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                  <textarea name="message" placeholder="What would you like to say?" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all font-medium h-40" required />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                    <select name="audience" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all font-black uppercase tracking-wider">
                      <option value="all">All Students</option>
                      <option value="course">Specific Course Only</option>
                      <option value="active">Recently Active Students</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Broadcast</label>
                    <input type="datetime-local" name="scheduledFor" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-slate-900 transition-all font-medium" />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Channels</p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: 'app', label: 'In-App', active: true },
                      { id: 'email', label: 'Email Notification', active: true },
                      { id: 'push', label: 'Push (Mobile)', active: false },
                      { id: 'sms', label: 'SMS (Urgent)', active: false },
                    ].map(channel => (
                      <div key={channel.id} className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                        <div className={cn("w-3 h-3 rounded-full", channel.active ? "bg-blue-600" : "bg-slate-300")} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{channel.label}</span>
                      </div>
                    ))}
                  </div>
                </div>


                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={createAnnouncement.isPending} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    {createAnnouncement.isPending ? 'Publishing...' : <><Send className="w-4 h-4" /> Publish Now</>}
                  </button>
                  <button type="button" onClick={() => setIsCreating(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="bg-white p-20 rounded-[40px] border border-dashed border-slate-200 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Megaphone className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No Broadcasts Yet</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">Keep your students updated by sending your first announcement.</p>
              </div>
            ) : (
              announcements.map((ann: any) => (
                <div key={ann.id} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-500 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{ann.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            {format(new Date(ann.createdAt), 'MMM d, yyyy')}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                            ann.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          )}>
                            {ann.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                      <MoreVertical className="w-5 h-5 text-slate-300" />
                    </button>
                  </div>
                  
                  <p className="text-slate-600 leading-relaxed font-medium mb-6">
                    {ann.content}
                  </p>

                  <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                       <Users className="w-4 h-4 text-slate-300" />
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target: {ann.targetAudience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Book className="w-4 h-4 text-slate-300" />
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Course Wide</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <aside className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4">Effective Broadcasting</h3>
                <ul className="space-y-4">
                  {[
                    "Keep titles short & punchy",
                    "Add clear call-to-actions",
                    "Mention specific modules",
                    "Use emojis for engagement 🚀"
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
           </div>

           <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Quick Filters</h3>
              <div className="space-y-2">
                {['All Broadcasts', 'Published', 'Scheduled', 'Drafts'].map((f) => (
                  <button key={f} className="w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                    {f}
                  </button>
                ))}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

