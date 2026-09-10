'use client';

import { useState, useEffect } from 'react';
import {
  Radio, StopCircle, PlayCircle, Users,
  MessageSquare, Eye, ExternalLink, ArrowLeft,
  CheckCircle2, AlertCircle, Loader2, Sparkles,
  Calendar, Clock, Video, Share2, Globe,
  Plus, BarChart2, ThumbsUp, Send, X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Seminar {
  id: string;
  title: string;
  description: string;
  isLive: boolean;
  date: string;
  scheduledAt: string;
  startTime: string;
  duration: number;
  youtubeStreamUrl?: string;
  youtubeBroadcastId?: string;
  startedAt?: string | Date | null;
  endedAt?: string | Date | null;
  _count: { registrations: number };
}

export default function SeminarManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [streamUrl, setStreamUrl] = useState('');
  
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
  const [showPollForm, setShowPollForm] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: seminar, isLoading, error } = useQuery<Seminar>({
    queryKey: ['admin-seminar', id],
    queryFn: async () => {
      const res = await fetch(`/api/seminars/${id}`);
      if (!res.ok) throw new Error('Failed to fetch seminar');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: qaData, refetch: refetchQA } = useQuery({
    queryKey: ['seminar-qa', id],
    queryFn: async () => {
      const res = await fetch(`/api/seminars/qa?seminarId=${id}`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 3000,
    enabled: !!id,
  });

  const updateSeminarMutation = useMutation({
    mutationFn: async (updatedData: Partial<Seminar>) => {
      const res = await fetch(`/api/seminars/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-seminar', id], data);
      addToast({ 
        message: data.isLive ? '🚀 Seminar is now LIVE!' : 'Broadcast ended', 
        type: 'success' 
      });
    },
  });

  const createPollMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/seminars/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seminarId: id,
          question: newPoll.question,
          options: newPoll.options.filter(o => o.trim()),
        }),
      });
      if (!res.ok) throw new Error('Failed to create poll');
      return res.json();
    },
    onSuccess: () => {
      setShowPollForm(false);
      setNewPoll({ question: '', options: ['', ''] });
      addToast({ message: 'Poll created!', type: 'success' });
    },
  });

  const answerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const res = await fetch('/api/seminars/qa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer, action: 'ANSWER' }),
      });
      if (!res.ok) throw new Error('Failed to answer');
      return res.json();
    },
    onSuccess: () => refetchQA(),
  });

  if (isLoading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-[#1C2B4A]" />
    </div>
  );

  if (error || !seminar) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4 opacity-20" />
      <h2 className="text-2xl font-bold text-[#1A3C2E]">Seminar not found</h2>
      <Link href="/admin/seminars" className="mt-4 text-blue-600 font-bold hover:underline">Return to list</Link>
    </div>
  );

  const isLive = seminar.isLive;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3 bg-white border border-[#E2E8F4] rounded-2xl text-[#7A8FAF] hover:text-[#1C2B4A]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[#E8B84B] mb-1">
              <Radio className={cn("w-3.5 h-3.5", isLive && "animate-pulse text-red-500")} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {isLive ? 'SYSTEM LIVE' : 'OFFLINE'}
              </span>
            </div>
            <h1 className="text-[28px] font-bold text-[#1C2B4A] tracking-tight leading-tight">{seminar.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href={`/seminars/${id}/live`} target="_blank" className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[11px] font-bold uppercase hover:bg-blue-100">
            <Globe className="w-4 h-4" /> Live Page
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#1C2B4A] rounded-[40px] p-10 text-white relative overflow-hidden ring-4 ring-white shadow-2xl">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Live Status</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-[32px] font-black tracking-tighter">{isLive ? 'ACTIVE' : 'INACTIVE'}</h2>
                  {isLive && <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />}
                </div>
              </div>
              <div className="flex flex-col justify-center px-6 border-l border-white/10">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Current Time</p>
                <p className="text-[18px] font-mono font-bold tracking-widest">{currentTime.toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-white/60 text-[10px] font-black uppercase tracking-[0.1em]">YouTube Live Embed URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={streamUrl || seminar.youtubeStreamUrl || ''}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[14px] text-white outline-none focus:border-white/40 placeholder:text-white/20"
                  />
                  <button
                    onClick={() => updateSeminarMutation.mutate({ youtubeStreamUrl: streamUrl })}
                    disabled={updateSeminarMutation.isPending}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {!isLive ? (
                <button
                  onClick={() => {
                    if (!streamUrl && !seminar.youtubeStreamUrl) {
                      addToast({ message: 'Please add a YouTube Stream URL first!', type: 'error' });
                      return;
                    }
                    updateSeminarMutation.mutate({ isLive: true, startedAt: new Date().toISOString() });
                  }}
                  disabled={updateSeminarMutation.isPending}
                  className="flex items-center justify-center gap-3 py-5 bg-red-600 text-white rounded-[24px] text-[13px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/40"
                >
                  {updateSeminarMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-6 h-6" />}
                  Go Live Now
                </button>
              ) : (
                <button
                  onClick={() => updateSeminarMutation.mutate({ isLive: false, endedAt: new Date().toISOString() })}
                  disabled={updateSeminarMutation.isPending}
                  className="flex items-center justify-center gap-3 py-5 bg-white text-red-600 rounded-[24px] text-[13px] font-black uppercase tracking-widest hover:bg-[#F8F9FC] transition-all shadow-xl"
                >
                  {updateSeminarMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <StopCircle className="w-6 h-6" />}
                  End Broadcast
                </button>
              )}
            </div>

            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F4] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-[12px] font-black text-[#1C2B4A] uppercase tracking-widest">Seminar Details</h3>
              </div>
              <div className="space-y-6">
                <DetailItem label="Scheduled Date" value={new Date(seminar.scheduledAt || seminar.date).toLocaleDateString()} />
                <DetailItem label="Time" value={new Date(seminar.scheduledAt || seminar.date).toLocaleTimeString()} />
                <DetailItem label="Duration" value={`${seminar.duration} mins`} />
              </div>
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-[#E2E8F4] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-4 h-4 text-green-600" />
                <h3 className="text-[12px] font-black text-[#1C2B4A] uppercase tracking-widest">Growth</h3>
              </div>
              <div className="space-y-6">
                <DetailItem label="Total Registrants" value={seminar._count.registrations.toString()} />
                <DetailItem label="Capacity" value="Unlimited" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[32px] border border-[#E2E8F4] overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#F0F2F8] bg-[#F8F9FC]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7A8FAF]" />
                <h3 className="text-[11px] font-black text-[#1C2B4A] uppercase tracking-widest">Live Q&A</h3>
              </div>
              <span className="text-[10px] text-gray-400">{(qaData || []).length} questions</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
              {(qaData || []).length === 0 ? (
                <div className="text-center py-8 opacity-40">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase">No questions yet</p>
                </div>
              ) : (
                (qaData || []).map((q: any) => (
                  <div key={q.id} className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-red-600 rounded text-white text-[10px] flex items-center justify-center">
                        {(q.userName || 'A')[0].toUpperCase()}
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">{q.userName || 'Anonymous'}</span>
                      <span className="text-[9px] text-gray-400 ml-auto flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {q.upvotes || 0}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-2">{q.question}</p>
                    {!q.isAnswered ? (
                      <button
                        onClick={() => answerMutation.mutate({ questionId: q.id, answer: 'Thank you for your question!' })}
                        className="text-[10px] font-bold text-green-600 uppercase"
                      >
                        + Mark Answered
                      </button>
                    ) : (
                      <div className="text-[10px] text-green-600 font-bold">✓ Answered</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-[#E2E8F4] overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#F0F2F8] bg-[#F8F9FC]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#7A8FAF]" />
                <h3 className="text-[11px] font-black text-[#1C2B4A] uppercase tracking-widest">Polls</h3>
              </div>
              <button
                onClick={() => setShowPollForm(!showPollForm)}
                className="text-[10px] font-bold text-blue-600 uppercase"
              >
                {showPollForm ? 'Cancel' : '+ Create'}
              </button>
            </div>
            <div className="p-5">
              {showPollForm ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                    placeholder="Poll question..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
                  />
                  {newPoll.options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...newPoll.options];
                        newOpts[idx] = e.target.value;
                        setNewPoll({ ...newPoll, options: newOpts });
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  ))}
                  <button
                    onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })}
                    className="text-[10px] font-bold text-gray-500"
                  >
                    + Add Option
                  </button>
                  <button
                    onClick={() => createPollMutation.mutate()}
                    disabled={createPollMutation.isPending || !newPoll.question}
                    className="w-full py-3 bg-[#1C2B4A] text-white rounded-xl text-[10px] font-bold uppercase"
                  >
                    {createPollMutation.isPending ? 'Creating...' : 'Launch Poll'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 opacity-40">
                  <BarChart2 className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase">No active polls</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black text-[#A8B8D8] uppercase tracking-widest">{label}</span>
      <span className="text-[13px] font-bold text-[#1C2B4A]">{value}</span>
    </div>
  );
}
