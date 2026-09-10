'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Calendar, Download, Copy as CopyIcon, Edit2, Play, Trash2, Video, Clock, ArrowRight, MoreVertical, X, Users, Settings, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import CreateLiveSessionModal from './CreateLiveSessionModal';
import { downloadICS } from '@/lib/calendar';
import { cn } from '@/lib/utils';

export default function LiveSessionsPanel() {
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('upcoming');

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['teacher-sessions', search, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ search, status: filter === 'all' ? '' : filter });
      const res = await fetch(`/api/teacher/sessions?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/teacher/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (!res.ok) throw new Error('Failed to cancel session');
      return res.json();
    },
    onSuccess: () => {
      addToast('Session cancelled', 'success');
      queryClient.invalidateQueries({ queryKey: ['teacher-sessions'] });
    },
    onError: (err: any) => addToast(err.message, 'error')
  });

  const startMutation = useMutation({
    mutationFn: async (session: any) => {
      const [patchRes, liveStatusRes] = await Promise.all([
        fetch(`/api/teacher/sessions/${session.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'live' })
        }),
        fetch('/api/livekit/session/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: session.roomId || session.meetingLink,
            status: 'live',
            lessonId: session.lessonId || undefined,
          })
        })
      ]);

      if (!patchRes.ok) {
        const err = await patchRes.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to start session');
      }

      if (!liveStatusRes.ok) {
        const err = await liveStatusRes.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update live status');
      }

      return session;
    },
    onSuccess: (session: any) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-sessions'] });
      addToast('Session is live now', 'success');
      router.push(`/teacher/live/${session.roomId || session.meetingLink}`);
    },
    onError: (err: any) => addToast(err.message, 'error')
  });

  const copyInviteLink = (roomId: string) => {
    const link = `${window.location.origin}/join/${roomId}`;
    navigator.clipboard.writeText(link);
    addToast('Invite link copied!', 'success');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'live': return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      case 'scheduled': return 'bg-amber-500';
      case 'completed': return 'bg-emerald-500';
      case 'cancelled': return 'bg-slate-300';
      default: return 'bg-slate-300';
    }
  };

  if (isLoading) return <div className="h-64 bg-white rounded-[32px] border border-slate-100 animate-pulse" />;

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-[0_12px_38px_rgba(15,23,42,0.06)] overflow-hidden">
      <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">My Live Sessions</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Schedule & Broadcasts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search sessions..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ml-2 bg-transparent outline-none text-xs font-bold text-slate-700 w-40"
            />
          </div>
          <button 
            onClick={() => {
              setEditingSession(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
          >
            + Schedule Class
          </button>
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="px-8 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-6">
        {['upcoming', 'live', 'completed', 'all'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-all pb-2 border-b-2",
              filter === t ? "text-indigo-600 border-indigo-600" : "text-slate-400 border-transparent hover:text-slate-600"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-100">
        {sessions?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2">No Sessions Scheduled</h4>
            <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Create your first live class to start teaching and engaging with your students in real-time.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all"
              >
                Schedule Class
              </button>
              <button
                onClick={() => router.push('/teacher/courses/new')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider hover:bg-slate-200 transition-all"
              >
                Create Course
              </button>
            </div>
          </div>
        ) : (
          sessions?.map((session: any) => (
            <div key={session.id} className="p-6 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-start gap-4">
                <div className="relative mt-1">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
                  {session.status === 'live' && (
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-50" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 tracking-tight mb-1">{session.title}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(session.startTime), 'MMM d, h:mm a')}
                    </span>
                    {session.course?.title && (
                      <span className="flex items-center gap-1.5 uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5" />
                        {session.course.title.slice(0, 20)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5" />
                      {session._count?.attendance || 0} Attended
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {session.status === 'scheduled' && (
                  <>
                    <button 
                      onClick={() => copyInviteLink(session.roomId || session.meetingLink)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Copy Invite Link"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => downloadICS(session)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Export to Calendar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingSession(session);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      title="Edit Session"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        const { id, ...rest } = session;
                        setEditingSession({ ...rest, title: `${rest.title} (Copy)` });
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Duplicate Session"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => startMutation.mutate(session)}
                      disabled={startMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {startMutation.isPending ? 'Starting...' : 'Start'}
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm('Are you sure you want to cancel this session?')) {
                          cancelMutation.mutate(session.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Cancel Session"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}

                {session.status === 'live' && (
                  <button 
                    onClick={() => router.push(`/teacher/live/${session.roomId || session.meetingLink}`)}
                    className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 animate-pulse"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Rejoin Class
                  </button>
                )}

                {session.status === 'completed' && session.recordingUrl && (
                  <a 
                    href={session.recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                  >
                    View Recording
                  </a>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      <CreateLiveSessionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingSession(null);
        }} 
        editSession={editingSession}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['teacher-sessions'] })}
      />
    </div>
  );
}

