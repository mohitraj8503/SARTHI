'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Video, VideoOff, Mic, MicOff, Users, ArrowRight, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface JoinLiveClassProps {
  liveClassId: string;
  title: string;
  role: 'teacher' | 'student';
  /** Scheduled start time — used for countdown if class hasn't started yet */
  scheduledAt?: string | null;
  userName: string;
  avatarUrl?: string;
  onJoin: (token: string, serverUrl: string) => void;
}

type DeviceError = 'permission-denied' | 'not-found' | 'generic' | null;

/**
 * JoinLiveClass
 *
 * Pre-join screen: camera/mic preview, device selection, and a "Join Class" button.
 *
 * UX improvements (E):
 *  - Distinguishes permission-denied vs no-device vs generic errors
 *  - Shows "Retry camera access" button when browser blocked access
 *  - Allows joining without camera/mic (audio-only / view-only)
 */
export function JoinLiveClass({
  liveClassId,
  title,
  role,
  scheduledAt,
  userName,
  avatarUrl,
  onJoin,
}: JoinLiveClassProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceErrorType, setDeviceErrorType] = useState<DeviceError>(null);

  // ── Device preview ──────────────────────────────────────────────────────────
  const startPreview = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      // Log track states for diagnostic reasons
      stream.getTracks().forEach((track) => {
        console.log(`[JoinLiveClass] Track ${track.kind} created, readyState: ${track.readyState}, enabled: ${track.enabled}`);
      });

      // Apply initial toggled states immediately
      stream.getVideoTracks().forEach((t) => { t.enabled = cameraOn; });
      stream.getAudioTracks().forEach((t) => { t.enabled = micOn; });

      setDeviceErrorType(null);
    } catch (err: any) {
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setDeviceErrorType('permission-denied');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setDeviceErrorType('not-found');
      } else {
        setDeviceErrorType('generic');
      }
    }
  }, [onJoin]); // Decoupled from cameraOn / micOn

  const stopPreview = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    startPreview();
    return stopPreview;
  }, [startPreview, stopPreview]);

  // Keep individual tracks enabled/disabled when toggles change
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => { t.enabled = cameraOn; });
    }
  }, [cameraOn]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => { t.enabled = micOn; });
    }
  }, [micOn]);

  const toggleCamera = () => {
    setCameraOn((v) => !v);
  };

  const toggleMic = () => {
    setMicOn((v) => !v);
  };

  const retryCamera = () => {
    setDeviceErrorType(null);
    startPreview();
  };

  // ── Join handler ────────────────────────────────────────────────────────────
  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    stopPreview();

    try {
      const res = await fetch('/api/live-class/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveClassId, seminarId: liveClassId }),
      });

      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || 'Failed to get access token');
      onJoin(data.token, data.serverUrl);
    } catch (err: any) {
      setError(err.message || 'Could not join the class. Please try again.');
      setJoining(false);
      startPreview();
    }
  };

  // ── Device error message ────────────────────────────────────────────────────
  const DeviceErrorBanner = () => {
    if (!deviceErrorType) return null;
    const info =
      deviceErrorType === 'permission-denied'
        ? {
            msg: 'Camera/microphone access was denied by your browser.',
            action: 'Allow access in your browser settings, then click Retry.',
            showRetry: true,
          }
        : deviceErrorType === 'not-found'
        ? {
            msg: 'No camera or microphone found on this device.',
            action: 'You can still join as a viewer without audio/video.',
            showRetry: false,
          }
        : {
            msg: 'Could not access camera/microphone.',
            action: 'You can still join — or click Retry to try again.',
            showRetry: true,
          };

    return (
      <div className="flex flex-col gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p>{info.msg}</p>
            <p className="text-amber-300/70 text-xs mt-0.5">{info.action}</p>
          </div>
        </div>
        {info.showRetry && (
          <button
            id="retry-camera-btn"
            onClick={retryCamera}
            className="flex items-center gap-1.5 self-start text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors"
          >
            <RefreshCw size={12} />
            Retry camera access
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 items-center">
        {/* ── Camera preview ──────────────────────────────────────────────── */}
        <div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          {cameraOn && !deviceErrorType ? (
            <video
              ref={(node) => {
                videoRef.current = node;
                if (node && streamRef.current && node.srcObject !== streamRef.current) {
                  node.srcObject = streamRef.current;
                  node.play().catch((err) => {
                    if (err.name !== 'AbortError') console.warn('[JoinLiveClass] preview play error:', err);
                  });
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain bg-black scale-x-[-1]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                {avatarUrl
                  ? <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                  : userName.charAt(0).toUpperCase()
                }
              </div>
              <span className="text-sm">{userName}</span>
            </div>
          )}

          {/* Device toggles */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
            <button
              onClick={toggleCamera}
              id="join-toggle-camera"
              className={`p-3 rounded-full transition-all duration-200 backdrop-blur-sm border ${
                cameraOn ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 'bg-red-600 border-red-500 hover:bg-red-700 text-white'
              }`}
              title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button
              onClick={toggleMic}
              id="join-toggle-mic"
              className={`p-3 rounded-full transition-all duration-200 backdrop-blur-sm border ${
                micOn ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 'bg-red-600 border-red-500 hover:bg-red-700 text-white'
              }`}
              title={micOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
          </div>
        </div>

        {/* ── Join panel ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <div>
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
              {role === 'teacher' ? 'Instructor' : 'Student'}
            </span>
            <h1 className="text-2xl font-bold text-white leading-tight mt-2">{title}</h1>
            <p className="text-slate-400 text-sm mt-1">
              Joining as <strong className="text-white">{userName}</strong>
            </p>
          </div>

          {/* Device status pills */}
          <div className="flex gap-2 flex-wrap">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border ${cameraOn && !deviceErrorType ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {cameraOn && !deviceErrorType ? <Video size={12} /> : <VideoOff size={12} />}
              Camera {cameraOn && !deviceErrorType ? 'On' : 'Off'}
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border ${micOn && !deviceErrorType ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {micOn && !deviceErrorType ? <Mic size={12} /> : <MicOff size={12} />}
              Mic {micOn && !deviceErrorType ? 'On' : 'Off'}
            </div>
          </div>

          <DeviceErrorBanner />

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            id="join-class-btn"
            onClick={handleJoin}
            disabled={joining}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-base bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {joining ? (
              <><Loader2 size={18} className="animate-spin" />Joining…</>
            ) : (
              <><Users size={18} />Join Class<ArrowRight size={16} /></>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            By joining you agree to SARTHI's live class recording policy.
          </p>
        </div>
      </div>
    </div>
  );
}
