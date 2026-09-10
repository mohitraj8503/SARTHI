'use client';

import { useState, useCallback } from 'react';
import {
  Users, ArrowRight, Loader2, Clock, Calendar, AlertCircle,
  CheckCircle2, Lock, VideoOff,
} from 'lucide-react';
import { DevicePreviewTile } from './DevicePreviewTile';
import { PermissionDenied } from './ErrorStates';
import type { ClassMeta, ParticipantRole } from './meeting-types';
import { usePersistedDevicePrefs } from './usePersistedDevicePrefs';

interface PreJoinLobbyProps {
  classMeta: ClassMeta;
  role: ParticipantRole;
  userName: string;
  avatarUrl?: string | null;
  /** Called with livekit token + serverUrl once successfully fetched */
  onJoin: (token: string, serverUrl: string) => void;
}

/**
 * PreJoinLobby
 *
 * Full pre-join experience:
 *  - Camera/mic preview via DevicePreviewTile
 *  - Class info card with scheduled time, host, participant count
 *  - Join / Start Class button with all loading + error states
 *  - Handles: class not started, cancelled, ended, permission denied
 */
export function PreJoinLobby({ classMeta, role, userName, avatarUrl, onJoin }: PreJoinLobbyProps) {
  const { prefs } = usePersistedDevicePrefs();
  const [cameraOn, setCameraOn] = useState(prefs.cameraOn);
  const [micOn, setMicOn] = useState(prefs.micOn);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [deviceErrorKind, setDeviceErrorKind] = useState<'permission-denied' | 'not-found' | 'generic' | null>(null);

  // Browser API support check
  const browserSupported =
    typeof window !== 'undefined' &&
    typeof window.RTCPeerConnection !== 'undefined' &&
    typeof navigator.mediaDevices !== 'undefined';

  const handleJoin = useCallback(async () => {
    setJoining(true);
    setJoinError(null);
    try {
      const res = await fetch('/api/live-class/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveClassId: classMeta.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || 'Failed to get access token');
      onJoin(data.token, data.serverUrl);
    } catch (err: any) {
      setJoinError(err.message || 'Could not join the class. Please try again.');
      setJoining(false);
    }
  }, [classMeta.id, onJoin]);

  if (!browserSupported) {
    return (
      <div className="flex-1 h-full w-full bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-white mb-3">Unsupported Browser</h1>
          <p className="text-slate-400 text-sm">Please use Chrome, Edge, or Safari (latest version) to join this class.</p>
        </div>
      </div>
    );
  }

  // If permission was denied at OS/browser level, show full explanation
  if (deviceErrorKind === 'permission-denied') {
    return <PermissionDenied onRetry={() => setDeviceErrorKind(null)} />;
  }

  const status = classMeta.liveKitStatus;
  const isLive = status === 'LIVE';
  const isCancelled = status === 'CANCELLED';
  const isEnded = status === 'ENDED';
  const isScheduled = !isLive && !isCancelled && !isEnded;
  const isTeacher = role === 'teacher';

  return (
    <div className="flex-1 h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-xs text-slate-500 uppercase tracking-wider">SARTHI</p>
        <h1 className="text-sm font-semibold text-white truncate mt-0.5">{classMeta.title}</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 w-full">
        <div className="w-full max-w-7xl grid md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_420px] gap-8 items-stretch">

          {/* Left: Preview tile */}
          <DevicePreviewTile
            cameraOn={cameraOn}
            micOn={micOn}
            onToggleCamera={() => setCameraOn((v) => !v)}
            onToggleMic={() => setMicOn((v) => !v)}
            userName={userName}
            avatarUrl={avatarUrl}
            onDeviceError={setDeviceErrorKind}
          />

          {/* Right: Info card + controls */}
          <div className="flex flex-col gap-5">

            {/* Class info card */}
            <div className="bg-slate-900/80 backdrop-blur-sm border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    isLive      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : isCancelled ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : isEnded   ? 'bg-slate-600/30 text-slate-400 border-slate-600/30'
                    :              'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {isLive && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" /></span>}
                    {isLive ? 'Live Now' : isCancelled ? 'Cancelled' : isEnded ? 'Ended' : 'Scheduled'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white leading-tight">{classMeta.title}</h2>
              </div>

              {/* Host */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {classMeta.teacherAvatar
                    ? <img src={classMeta.teacherAvatar} alt={classMeta.teacherName} className="w-full h-full rounded-full object-cover" />
                    : classMeta.teacherName?.charAt(0).toUpperCase()
                  }
                </div>
                <div>
                  <p className="text-xs text-slate-500">Host</p>
                  <p className="text-sm font-medium text-white">{classMeta.teacherName}</p>
                </div>
              </div>

              {/* Scheduled time */}
              {classMeta.scheduledAt && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={13} />
                  {new Date(classMeta.scheduledAt).toLocaleString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              )}

              {/* Participant count */}
              {isLive && classMeta.participantCount != null && classMeta.participantCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Users size={13} />
                  {classMeta.participantCount} already in class
                </div>
              )}

              {/* Status-specific messages */}
              {isCancelled && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  This class has been cancelled by the instructor.
                </div>
              )}

              {isEnded && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2 p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-400 text-xs">
                    <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                    This class has ended.
                    {classMeta.recording?.recordingStatus === 'READY'
                      ? ' The recording is available below.'
                      : ' The recording will be available shortly.'}
                  </div>
                  {classMeta.recording?.recordingStatus === 'READY' && classMeta.recording.driveFileId && (
                    <a
                      href={`/api/live-class-recordings/${classMeta.id}/stream`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm hover:bg-indigo-500/20 transition-colors"
                    >
                      View Recording
                    </a>
                  )}
                </div>
              )}

              {isScheduled && classMeta.scheduledAt && (
                <Countdown
                  scheduledAt={classMeta.scheduledAt}
                  onComplete={() => {
                    // Update state so buttons enable and status changes
                    if (classMeta) {
                      classMeta.liveKitStatus = 'LIVE';
                    }
                  }}
                />
              )}
            </div>

            {/* Device status pills */}
            <div className="flex gap-2 flex-wrap">
              <StatusPill on={cameraOn && deviceErrorKind !== 'permission-denied'} onIcon="Camera On" offIcon="Camera Off" />
              <StatusPill on={micOn && deviceErrorKind !== 'permission-denied'} onIcon="Mic On" offIcon="Mic Off" />
            </div>

            {/* Error banner */}
            {joinError && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{joinError} <button onClick={handleJoin} className="underline ml-1 hover:no-underline">Retry</button></span>
              </div>
            )}

            {/* No device warning */}
            {deviceErrorKind === 'not-found' && (
              <div className="flex items-start gap-2 p-3 bg-slate-700/30 border border-slate-600/30 rounded-xl text-slate-400 text-xs">
                <VideoOff size={14} className="shrink-0 mt-0.5" />
                No camera or microphone found. You'll join as a viewer.
              </div>
            )}

            {/* Join / Start button */}
            {!isCancelled && !isEnded && (
              isTeacher ? (
                // Teacher: always enabled (they control class start)
                <ActionButton
                  id="start-class-btn"
                  onClick={handleJoin}
                  loading={joining}
                  loadingLabel="Joining…"
                  label={isLive ? 'Rejoin Class' : 'Start Class'}
                  icon={isLive ? <ArrowRight size={18} /> : <Lock size={18} />}
                  variant="primary"
                />
              ) : isLive ? (
                <ActionButton
                  id="join-class-btn"
                  onClick={handleJoin}
                  loading={joining}
                  loadingLabel="Joining…"
                  label="Join Class"
                  icon={<ArrowRight size={18} />}
                  variant="primary"
                />
              ) : (
                // Student: class not started yet
                <ActionButton
                  id="notify-btn"
                  onClick={() => {}}
                  loading={false}
                  loadingLabel=""
                  label="Notify me when it starts"
                  icon={<Clock size={16} />}
                  variant="secondary"
                />
              )
            )}

            <p className="text-center text-xs text-slate-600">
              By joining you agree to SARTHI's{' '}
              <a href="/privacy" target="_blank" className="underline hover:no-underline">recording policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusPill({ on, onIcon, offIcon }: { on: boolean; onIcon: string; offIcon: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border ${
      on ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-green-400' : 'bg-red-400'}`} />
      {on ? onIcon : offIcon}
    </div>
  );
}

function ActionButton({
  id, onClick, loading, loadingLabel, label, icon, variant, disabled,
}: {
  id: string; onClick: () => void; loading: boolean;
  loadingLabel: string; label: string; icon: React.ReactNode;
  variant: 'primary' | 'secondary'; disabled?: boolean;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
        variant === 'primary'
          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20'
          : 'border border-white/10 text-slate-300 hover:text-white hover:border-white/20 bg-white/5'
      }`}
    >
      {loading ? <><Loader2 size={18} className="animate-spin" />{loadingLabel}</> : <>{icon}{label}</>}
    </button>
  );
}

function Countdown({ scheduledAt, onComplete }: { scheduledAt: string; onComplete?: () => void }) {
  const [, forceUpdate] = useState(0);
  const diff = new Date(scheduledAt).getTime() - Date.now();

  // re-render every second
  useEffect(() => {
    const t = setInterval(() => {
      forceUpdate((v) => v + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (diff <= 0 && onComplete) {
      onComplete();
    }
  }, [diff, onComplete]);

  if (diff <= 0) return <p className="text-xs text-slate-400 text-center">Starting soon…</p>;

  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  const display = h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;

  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <p className="text-xs text-slate-500">Starts in</p>
      <p className="text-2xl font-mono font-bold text-white tabular-nums tracking-wide">{display}</p>
    </div>
  );
}
