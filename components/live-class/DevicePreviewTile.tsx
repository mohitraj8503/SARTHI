'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Video, VideoOff, Mic, MicOff, Settings, AlertTriangle, RefreshCw } from 'lucide-react';
import { DeviceSettingsPopover } from './DeviceSettingsPopover';
import { usePersistedDevicePrefs } from './usePersistedDevicePrefs';

type DeviceErrorKind = 'permission-denied' | 'not-found' | 'generic' | null;

interface DevicePreviewTileProps {
  cameraOn: boolean;
  micOn: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  userName: string;
  avatarUrl?: string | null;
  /** Reports up the actual error type so parent can show appropriate guidance */
  onDeviceError?: (kind: DeviceErrorKind) => void;
}

/**
 * DevicePreviewTile
 *
 * Shows the user's local camera feed (mirrored) before joining.
 * Includes mic/camera toggle buttons, a live audio level bar, and a Settings gear.
 * Does NOT transmit audio/video to other participants — purely local preview.
 */
export function DevicePreviewTile({
  cameraOn,
  micOn,
  onToggleCamera,
  onToggleMic,
  userName,
  avatarUrl,
  onDeviceError,
}: DevicePreviewTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);
  const audioIndicatorRef = useRef<HTMLDivElement>(null);

  const { prefs, updatePrefs } = usePersistedDevicePrefs();
  const [deviceError, setDeviceError] = useState<DeviceErrorKind>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(prefs.cameraId);
  const [selectedMic, setSelectedMic] = useState(prefs.micId);

  // Sync state toggles from lobby to state
  useEffect(() => {
    updatePrefs({ cameraOn, micOn });
  }, [cameraOn, micOn]);

  const handleCameraChange = (id: string) => {
    setSelectedCamera(id);
    updatePrefs({ cameraId: id });
  };

  const handleMicChange = (id: string) => {
    setSelectedMic(id);
    updatePrefs({ micId: id });
  };

  // ── Audio level meter ─────────────────────────────────────────────────────
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const stopAnalyser = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = 0;
    }
    try {
      analyserRef.current?.disconnect();
    } catch {}
    try {
      audioCtxRef.current?.close().catch(() => {});
    } catch {}
    analyserRef.current = null;
    audioCtxRef.current = null;
    if (audioIndicatorRef.current) {
      audioIndicatorRef.current.style.width = '0%';
    }
  }, []);

  const startAnalyser = useCallback((stream: MediaStream) => {
    try {
      stopAnalyser();
      if (!stream.getAudioTracks().some(t => t.enabled)) return;

      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const percent = Math.min(100, (avg / 80) * 100);
        if (audioIndicatorRef.current) {
          audioIndicatorRef.current.style.width = `${percent}%`;
        }
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    } catch { /* non-fatal */ }
  }, [stopAnalyser]);

  // ── Device acquisition ────────────────────────────────────────────────────
  const startPreview = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
      };
      
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        if (err.name === 'OverconstrainedError' || err.name === 'NotFoundError') {
          // Fallback to any available device if specific device fails
          console.warn('[DevicePreviewTile] Exact device not found, falling back to defaults');
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } else {
          throw err;
        }
      }

      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      stream.getVideoTracks().forEach((t) => { t.enabled = cameraOn; });
      stream.getAudioTracks().forEach((t) => { t.enabled = micOn; });

      setDeviceError(null);
      onDeviceError?.(null);
      if (micOn) startAnalyser(stream);
    } catch (err: any) {
      console.error('[DevicePreviewTile] getUserMedia failed:', err);
      const name = err?.name || '';
      const kind: DeviceErrorKind =
        name === 'NotAllowedError' || name === 'PermissionDeniedError' ? 'permission-denied'
        : name === 'NotFoundError' || name === 'DevicesNotFoundError' ? 'not-found'
        : 'generic';
      setDeviceError(kind);
      onDeviceError?.(kind);
    }
  }, [selectedCamera, selectedMic, cameraOn, micOn, startAnalyser, onDeviceError]);

  const stopPreview = useCallback(() => {
    stopAnalyser();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [stopAnalyser]);

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
      if (micOn) startAnalyser(streamRef.current);
      else stopAnalyser();
    }
  }, [micOn, startAnalyser, stopAnalyser]);

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-800 shadow-2xl border border-white/8 select-none">

      {/* Video feed */}
      {cameraOn && !deviceError ? (
        <video
          ref={(node) => {
            videoRef.current = node;
            if (node && streamRef.current && node.srcObject !== streamRef.current) {
              node.srcObject = streamRef.current;
              node.play().catch((err) => {
                if (err.name !== 'AbortError') console.warn('[DevicePreviewTile] preview play error:', err);
              });
            }
          }}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain bg-black"
          style={{ transform: 'scaleX(-1)' }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-800">
          {deviceError === 'permission-denied' ? (
            <div className="flex flex-col items-center gap-2 text-center px-6">
              <AlertTriangle size={32} className="text-amber-400" />
              <p className="text-sm text-slate-300 font-medium">Camera access needed</p>
              <button
                onClick={startPreview}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors"
              >
                <RefreshCw size={12} /> Allow camera
              </button>
            </div>
          ) : deviceError === 'not-found' ? (
            <div className="flex flex-col items-center gap-2">
              <VideoOff size={32} className="text-slate-500" />
              <p className="text-xs text-slate-500">No camera detected</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-2xl font-bold text-white">
                  {initials}
                </div>
              )}
              <span className="text-sm text-slate-400">{userName}</span>
            </div>
          )}
        </div>
      )}

      {/* "You" label */}
      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/50 text-xs text-white backdrop-blur-sm">
        You
      </div>

      {/* Settings gear */}
      <div className="absolute top-3 right-3">
        <button
          id="device-settings-btn"
          onClick={() => setSettingsOpen((v) => !v)}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
          title="Device settings"
        >
          <Settings size={16} />
        </button>
        {settingsOpen && (
          <DeviceSettingsPopover
            selectedCamera={selectedCamera}
            selectedMic={selectedMic}
            onCameraChange={handleCameraChange}
            onMicChange={handleMicChange}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </div>

      {/* Control buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-3">
        {/* Mic toggle + level meter */}
        <div className="flex flex-col items-center gap-1">
          <button
            id="prejoin-toggle-mic"
            onClick={onToggleMic}
            title={micOn ? 'Mute microphone' : 'Unmute microphone'}
            className={`p-3 rounded-full transition-all duration-150 backdrop-blur-sm border ${
              micOn
                ? 'bg-white/15 border-white/25 hover:bg-white/25 text-white'
                : 'bg-red-600 border-red-500 hover:bg-red-700 text-white'
            }`}
          >
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          {/* Live audio level bar */}
          {micOn && (
            <div className="w-8 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                ref={audioIndicatorRef}
                className="h-full bg-green-400 rounded-full transition-all duration-75"
                style={{ width: '0%' }}
              />
            </div>
          )}
        </div>

        {/* Camera toggle */}
        <button
          id="prejoin-toggle-camera"
          onClick={onToggleCamera}
          title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
          className={`p-3 rounded-full transition-all duration-150 backdrop-blur-sm border ${
            cameraOn
              ? 'bg-white/15 border-white/25 hover:bg-white/25 text-white'
              : 'bg-red-600 border-red-500 hover:bg-red-700 text-white'
          }`}
        >
          {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>
      </div>
    </div>
  );
}
