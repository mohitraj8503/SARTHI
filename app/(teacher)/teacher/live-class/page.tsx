'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  Radio,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface LiveClass {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string | null;
  liveKitStatus: string | null;
  status: string;
  roomName: string | null;
  courseId: string;
  course?: { title: string };
  createdAt: string;
  recording?: {
    recordingStatus: string;
    driveFileId: string | null;
    driveViewUrl: string | null;
    durationSec: number | null;
    failureReason: string | null;
  } | null;
}

interface Course {
  id: string;
  title: string;
}

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  LIVE:      'bg-red-500/20 text-red-400 border-red-500/30',
  ENDED:     'bg-slate-500/20 text-slate-400 border-slate-500/30',
  CANCELLED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function TeacherLiveClassPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Create form state ───────────────────────────────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    courseId: '',
    title: '',
    description: '',
    scheduledAt: '',
  });

  // ── Fetch courses for the instructor ───────────────────────────────────────
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['teacher-courses'],
    queryFn: () => fetch('/api/teacher/courses').then((r) => r.json()).then((d) => d.courses || []),
  });

  // ── Fetch live classes ─────────────────────────────────────────────────────
  const { data: liveClasses = [], isLoading } = useQuery<LiveClass[]>({
    queryKey: ['teacher-live-classes'],
    queryFn: () =>
      fetch('/api/teacher/live-classes').then((r) => r.json()).then((d) => d.liveClasses || []),
    refetchInterval: 30_000,
  });

  // ── Retry upload mutation (for FAILED recordings) ──────────────────────────
  const retryMutation = useMutation({
    mutationFn: async (liveClassId: string) => {
      const res = await fetch('/api/live-class/retry-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveClassId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Retry failed');
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-live-classes'] }),
  });

  // ── Create mutation ────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      const res = await fetch('/api/live-class/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: payload.courseId,
          title: payload.title,
          description: payload.description || undefined,
          scheduledAt: payload.scheduledAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-live-classes'] });
      setShowCreateForm(false);
      setForm({ courseId: '', title: '', description: '', scheduledAt: '' });
    },
  });

  // ── Start class ────────────────────────────────────────────────────────────
  const startMutation = useMutation({
    mutationFn: async (liveClassId: string) => {
      const res = await fetch('/api/live-class/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveClassId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start');
      return data;
    },
    onSuccess: (_data, liveClassId) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-live-classes'] });
      router.push(`/teacher/live-class/${liveClassId}`);
    },
  });

  // ── End class ─────────────────────────────────────────────────────────────
  const endMutation = useMutation({
    mutationFn: async ({ liveClassId, courseId }: { liveClassId: string, courseId: string }) => {
      const res = await fetch('/api/live-class/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveClassId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to end');
      return data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-live-classes'] });
      router.push(`/teacher/courses/${courseId}`);
    },
  });

  const grouped = {
    live:      liveClasses.filter((c) => c.liveKitStatus === 'LIVE'),
    scheduled: liveClasses.filter((c) => c.liveKitStatus === 'SCHEDULED' || !c.liveKitStatus),
    ended:     liveClasses.filter((c) => c.liveKitStatus === 'ENDED'),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Live Classes
          </h1>
          <p className="text-slate-400 mt-1">Schedule, start, and manage your LiveKit-powered sessions</p>
        </div>
        <button
          id="create-live-class-btn"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus size={16} />
          Schedule Class
        </button>
      </div>

      {/* Create form modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-5">Schedule a Live Class</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5" htmlFor="form-course">Course</label>
                <select
                  id="form-course"
                  value={form.courseId}
                  onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a course…</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5" htmlFor="form-title">Class Title</label>
                <input
                  id="form-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Week 3: React Hooks Deep Dive"
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5" htmlFor="form-desc">Description (optional)</label>
                <textarea
                  id="form-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="What will students learn in this session?"
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5" htmlFor="form-scheduled">Scheduled Date & Time (optional)</label>
                <input
                  id="form-scheduled"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {createMutation.error && (
              <p className="mt-3 text-sm text-red-400">{(createMutation.error as Error).message}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-create-btn"
                onClick={() => createMutation.mutate(form)}
                disabled={!form.courseId || !form.title || createMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Calendar size={15} />}
                {createMutation.isPending ? 'Creating…' : 'Create Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live now */}
      {grouped.live.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Live Now
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.live.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                onJoin={() => router.push(`/teacher/live-class/${cls.id}`)}
                onEnd={() => endMutation.mutate({ liveClassId: cls.id, courseId: cls.courseId })}
                endingId={endMutation.isPending ? (endMutation.variables as any)?.liveClassId : null}
                onRetry={() => retryMutation.mutate(cls.id)}
                retryingId={retryMutation.isPending ? (retryMutation.variables as string) : null}
              />
            ))}
          </div>
        </section>
      )}

      {/* Scheduled */}
      {grouped.scheduled.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
            <Calendar size={14} />
            Scheduled
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.scheduled.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                onStart={() => startMutation.mutate(cls.id)}
                startingId={startMutation.isPending ? cls.id : null}
                onRetry={() => retryMutation.mutate(cls.id)}
                retryingId={retryMutation.isPending ? (retryMutation.variables as string) : null}
              />
            ))}
          </div>
        </section>
      )}

      {/* Ended */}
      {grouped.ended.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <CheckCircle2 size={14} />
            Past Classes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped.ended.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                onRetry={() => retryMutation.mutate(cls.id)}
                retryingId={retryMutation.isPending ? (retryMutation.variables as string) : null}
              />
            ))}
          </div>
        </section>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
        </div>
      )}

      {!isLoading && liveClasses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <Video size={36} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">No live classes yet</h3>
            <p className="text-slate-400 text-sm mt-1">Click "Schedule Class" to create your first LiveKit-powered live session.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ClassCard sub-component ────────────────────────────────────────────────────
function ClassCard({
  cls,
  onStart,
  onJoin,
  onEnd,
  onRetry,
  startingId,
  endingId,
  retryingId,
}: {
  cls: LiveClass;
  onStart?: () => void;
  onJoin?: () => void;
  onEnd?: () => void;
  onRetry?: () => void;
  startingId?: string | null;
  endingId?: string | null;
  retryingId?: string | null;
}) {
  const status = cls.liveKitStatus || cls.status;
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.SCHEDULED;

  return (
    <div className="bg-slate-900 border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/15 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyle} mb-2`}>
            {status === 'LIVE' && (
              <span className="relative flex h-1.5 w-1.5 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
              </span>
            )}
            {status}
          </span>
          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">{cls.title}</h3>
          {cls.course && (
            <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
              <BookOpen size={11} />
              {cls.course.title}
            </p>
          )}
        </div>
      </div>

      {cls.scheduledAt && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={12} />
          {format(new Date(cls.scheduledAt), 'MMM d, yyyy · h:mm a')}
        </div>
      )}

      {/* Recording status */}
      {cls.recording && (() => {
        const rec = cls.recording;
        const isReady = rec.recordingStatus === 'READY';
        const isFailed = rec.recordingStatus === 'FAILED';
        const isProcessing = !isReady && !isFailed;
        const isRetrying = retryingId === cls.id;

        return (
          <div className="flex flex-col gap-1.5">
            <div className={`text-xs px-2 py-1.5 rounded-lg border flex items-center gap-1.5 ${
              isReady   ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : isFailed ? 'bg-red-500/10 border-red-500/20 text-red-400'
              :             'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              {isReady ? <CheckCircle2 size={11} /> : <Radio size={11} className={isProcessing ? 'animate-pulse' : ''} />}
              <span className="flex-1">
                {isReady ? 'Recording ready'
                  : isFailed ? 'Recording failed'
                  : rec.recordingStatus === 'UPLOADING_TO_DRIVE' ? 'Uploading to Drive…'
                  : 'Processing…'}
              </span>
              {isReady && rec.driveViewUrl && (
                <a
                  href={rec.driveViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline ml-auto"
                >
                  View
                </a>
              )}
            </div>

            {/* E: Retry Upload button for FAILED recordings */}
            {isFailed && onRetry && (
              <button
                id={`retry-upload-${cls.id}`}
                onClick={onRetry}
                disabled={isRetrying}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-medium border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors disabled:opacity-50"
              >
                {isRetrying
                  ? <><Loader2 size={11} className="animate-spin" />Retrying…</>
                  : <>↺ Retry Drive Upload</>}
              </button>
            )}

            {/* Failure reason (truncated to first line) */}
            {isFailed && rec.failureReason && (
              <p
                className="text-xs text-red-400/60 truncate"
                title={rec.failureReason}
              >
                {rec.failureReason.split('\n')[0].substring(0, 80)}
              </p>
            )}
          </div>
        );
      })()}

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        {status === 'SCHEDULED' && onStart && (
          <button
            id={`start-class-${cls.id}`}
            onClick={onStart}
            disabled={startingId === cls.id}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-60"
          >
            {startingId === cls.id ? <Loader2 size={13} className="animate-spin" /> : <Radio size={13} />}
            {startingId === cls.id ? 'Starting…' : 'Start Class'}
          </button>
        )}
        {status === 'LIVE' && onJoin && (
          <button
            id={`join-class-${cls.id}`}
            onClick={onJoin}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
          >
            <ChevronRight size={13} />
            Rejoin Room
          </button>
        )}
        {status === 'LIVE' && onEnd && (
          <button
            id={`end-class-${cls.id}`}
            onClick={onEnd}
            disabled={endingId === cls.id}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-60"
          >
            {endingId === cls.id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
            {endingId === cls.id ? 'Ending…' : 'End Class'}
          </button>
        )}
      </div>
    </div>
  );
}
