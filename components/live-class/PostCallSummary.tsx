'use client';

import { CheckCircle2, Clock, Loader2, Users, ArrowLeft } from 'lucide-react';

interface PostCallSummaryProps {
  role: 'teacher' | 'student';
  classTitle: string;
  courseId: string;
  liveClassId: string;
  /** Whether class is still LIVE (show Rejoin for student) */
  classStillLive?: boolean;
  /** Teacher only */
  peakParticipants?: number;
  durationMs?: number;
  recordingStatus?: 'PROCESSING' | 'UPLOADING_TO_DRIVE' | 'READY' | 'FAILED' | 'NOT_STARTED';
  /** Whether removed by host */
  removedByHost?: boolean;
  onRejoin?: () => void;
}

/**
 * PostCallSummary
 *
 * Full-screen end-of-call card shown after leaving/ending the class.
 *
 * Student: "You left the class", optional rejoin button (if class still live), recording note.
 * Teacher: class duration, peak participant count, recording status with spinner.
 * Student removed: distinct "You were removed" message, no rejoin.
 */
export function PostCallSummary({
  role, classTitle, courseId, liveClassId, classStillLive,
  peakParticipants, durationMs, recordingStatus, removedByHost, onRejoin,
}: PostCallSummaryProps) {
  const isTeacher = role === 'teacher';

  if (removedByHost) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="text-4xl">🚫</div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">You were removed</h1>
          <p className="text-slate-400 text-sm">You were removed from this class by the host.</p>
        </div>
        <a
          href={`/courses/${courseId}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Return to course page
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-8 text-center gap-8">
      {/* Icon */}
      <div className="text-5xl">{isTeacher ? '🎓' : '👋'}</div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {isTeacher ? 'Class ended' : "You've left the class"}
        </h1>
        <p className="text-slate-400 text-sm">{classTitle}</p>
      </div>

      {/* Teacher stats card */}
      {isTeacher && (
        <div className="bg-slate-900/80 border border-white/8 rounded-2xl p-6 flex flex-col gap-4 w-full max-w-sm">
          {durationMs != null && (
            <StatRow icon={<Clock size={16} />} label="Duration" value={formatDuration(durationMs)} />
          )}
          {peakParticipants != null && (
            <StatRow icon={<Users size={16} />} label="Peak participants" value={String(peakParticipants)} />
          )}

          {/* Recording status */}
          <div className="flex items-start gap-3">
            <div className="text-slate-400 mt-0.5">
              {recordingStatus === 'READY' ? <CheckCircle2 size={16} className="text-green-400" /> : <Loader2 size={16} className="animate-spin text-indigo-400" />}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">Recording</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {recordingStatus === 'READY'
                  ? 'Available now'
                  : recordingStatus === 'FAILED'
                  ? 'Upload failed — retry from your dashboard'
                  : recordingStatus === 'UPLOADING_TO_DRIVE'
                  ? 'Uploading to Google Drive…'
                  : 'Processing your recording…'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Student: recording note */}
      {!isTeacher && (
        <p className="text-slate-500 text-sm max-w-xs">
          A recording will be posted to the course page once it's processed — usually within a few minutes.
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Rejoin (student only, if class still live) */}
        {!isTeacher && classStillLive && onRejoin && (
          <button
            id="rejoin-btn"
            onClick={onRejoin}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
          >
            Rejoin Class
          </button>
        )}

        {/* Return to course / dashboard */}
        <a
          id="return-btn"
          href={isTeacher ? '/teacher/live-class' : `/courses/${courseId}`}
          className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-sm font-medium transition-colors"
        >
          {isTeacher ? 'Return to dashboard' : 'Back to course'}
        </a>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function formatDuration(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
