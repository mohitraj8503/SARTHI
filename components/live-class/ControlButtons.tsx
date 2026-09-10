'use client';

/**
 * components/live-class/ControlButtons.tsx
 *
 * Individual control bar button components, each fully standalone.
 * All accept a standard { state, onClick, disabled, tooltip } prop set.
 * Must be rendered inside a <LiveKitRoom> context.
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  Hand, Smile, ChevronUp, Loader2,
} from 'lucide-react';
import {
  TrackToggle,
  MediaDeviceMenu,
  useLocalParticipant,
} from '@livekit/components-react';
import { usePersistedDevicePrefs } from './usePersistedDevicePrefs';
import { Track } from 'livekit-client';
import type { ClassEventPayload, ReactionEmoji, REACTION_EMOJIS } from './meeting-types';
import { REACTION_EMOJIS as EMOJIS } from './meeting-types';

// ─────────────────────────────────────────────────────────────────────────────
// Shared button base
// ─────────────────────────────────────────────────────────────────────────────
function BarButton({
  id, title, active, onClick, disabled, loading, children, variant = 'default', className = '',
}: {
  id: string; title: string; active?: boolean; onClick?: () => void;
  disabled?: boolean; loading?: boolean; children: React.ReactNode;
  variant?: 'default' | 'danger'; className?: string;
}) {
  return (
    <button
      id={id}
      title={title}
      onClick={onClick}
      disabled={disabled || loading}
      aria-pressed={active}
      className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed ${
        variant === 'danger'
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : active
          ? 'bg-white/15 text-white'
          : 'bg-transparent hover:bg-white/8 text-slate-300 hover:text-white'
      } ${className}`}
    >
      {loading ? <Loader2 size={20} className="animate-spin" /> : children}
    </button>
  );
}

function BarLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] leading-none hidden sm:block">{children}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.1 Mic Button
// ─────────────────────────────────────────────────────────────────────────────
export function MicButton({ hostMuted = false }: { hostMuted?: boolean }) {
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const { updatePrefs } = usePersistedDevicePrefs();
  const [pickerOpen, setPickerOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pickerOpen]);

  const handleDeviceSelect = async (deviceId: string) => {
    updatePrefs({ micId: deviceId });
    if (localParticipant && isMicrophoneEnabled) {
      await localParticipant.setMicrophoneEnabled(true, { deviceId });
    }
    setPickerOpen(false);
  };

  if (hostMuted) {
    return (
      <BarButton id="mic-btn" title="Host has muted you" disabled className="opacity-50 cursor-not-allowed">
        <div className="relative">
          <MicOff size={20} className="text-slate-500" />
          <span className="absolute -top-1 -right-1 text-[8px]">🔒</span>
        </div>
        <BarLabel>Muted</BarLabel>
      </BarButton>
    );
  }

  const toggleMic = async () => {
    if (!localParticipant) return;
    const nextState = !isMicrophoneEnabled;
    await localParticipant.setMicrophoneEnabled(nextState);
    updatePrefs({ micOn: nextState });
  };

  return (
    <div className="relative flex items-center" ref={ref}>
      <BarButton
        id="mic-btn"
        title={isMicrophoneEnabled ? 'Mute (Ctrl+D)' : 'Unmute (Ctrl+D)'}
        active={isMicrophoneEnabled}
        onClick={toggleMic}
        className={!isMicrophoneEnabled ? '!bg-red-600/90 !text-white hover:!bg-red-600' : ''}
      >
        {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        <BarLabel>{isMicrophoneEnabled ? 'Mute' : 'Unmute'}</BarLabel>
        {isMicrophoneEnabled && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-green-500 rounded-full" />
        )}
      </BarButton>

      {/* Device picker chevron */}
      <button
        onClick={() => setPickerOpen((v) => !v)}
        className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
        title="Select microphone"
        id="mic-picker-btn"
      >
        <ChevronUp size={12} />
      </button>

      {pickerOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <MediaDeviceMenu
            kind="audioinput"
            onActiveDeviceChange={handleDeviceSelect}
            className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl text-sm text-white min-w-[220px]"
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.2 Camera Button
// ─────────────────────────────────────────────────────────────────────────────
export function CameraButton() {
  const { isCameraEnabled, localParticipant } = useLocalParticipant();
  const { updatePrefs } = usePersistedDevicePrefs();
  const [pickerOpen, setPickerOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setPickerOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pickerOpen]);

  const handleDeviceSelect = async (deviceId: string) => {
    updatePrefs({ cameraId: deviceId });
    if (localParticipant && isCameraEnabled) {
      await localParticipant.setCameraEnabled(true, { deviceId });
    }
    setPickerOpen(false);
  };

  const toggleCamera = async () => {
    if (!localParticipant) return;
    const nextState = !isCameraEnabled;
    await localParticipant.setCameraEnabled(nextState);
    updatePrefs({ cameraOn: nextState });
  };

  return (
    <div className="relative flex items-center" ref={ref}>
      <BarButton
        id="camera-btn"
        title={isCameraEnabled ? 'Stop camera (Ctrl+E)' : 'Start camera (Ctrl+E)'}
        active={isCameraEnabled}
        onClick={toggleCamera}
        className={!isCameraEnabled ? '!bg-red-600/90 !text-white hover:!bg-red-600' : ''}
      >
        {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        <BarLabel>{isCameraEnabled ? 'Camera' : 'No Camera'}</BarLabel>
        {isCameraEnabled && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-green-500 rounded-full" />
        )}
      </BarButton>
      <button
        onClick={() => setPickerOpen((v) => !v)}
        className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
        title="Select camera"
        id="camera-picker-btn"
      >
        <ChevronUp size={12} />
      </button>
      {pickerOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <MediaDeviceMenu
            kind="videoinput"
            onActiveDeviceChange={handleDeviceSelect}
            className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl text-sm text-white min-w-[220px]"
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.3 Share Screen Button
// ─────────────────────────────────────────────────────────────────────────────
export function ShareScreenButton({ onlyHostCanShare = false }: { onlyHostCanShare?: boolean }) {
  const { isScreenShareEnabled, localParticipant } = useLocalParticipant();

  const toggleScreenShare = async () => {
    if (!localParticipant) return;
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled, { audio: true });
    } catch (e) {
      console.error('Failed to toggle screen share:', e);
    }
  };

  if (onlyHostCanShare) {
    return (
      <BarButton id="share-btn" title="Screen sharing restricted to host" disabled>
        <Monitor size={20} />
        <BarLabel>Share</BarLabel>
      </BarButton>
    );
  }

  return (
    <BarButton
      id="share-btn"
      title={isScreenShareEnabled ? 'Stop sharing' : 'Share screen'}
      active={isScreenShareEnabled}
      onClick={toggleScreenShare}
      className={isScreenShareEnabled ? '!text-indigo-400 !bg-indigo-500/20 border border-indigo-500/30' : ''}
    >
      {isScreenShareEnabled ? <MonitorOff size={20} /> : <Monitor size={20} />}
      <BarLabel>{isScreenShareEnabled ? 'Stop Share' : 'Share'}</BarLabel>
    </BarButton>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.4 Raise Hand Button
// ─────────────────────────────────────────────────────────────────────────────
interface RaiseHandButtonProps {
  raised: boolean;
  onToggle: () => void;
}
export function RaiseHandButton({ raised, onToggle }: RaiseHandButtonProps) {
  return (
    <BarButton
      id="raise-hand-btn"
      title={raised ? 'Lower hand' : 'Raise hand'}
      active={raised}
      onClick={onToggle}
      className={raised ? '!text-amber-400 !bg-amber-500/20 border border-amber-500/30 animate-pulse' : ''}
    >
      <Hand size={20} className={raised ? 'text-amber-400' : ''} />
      <BarLabel>{raised ? 'Lower Hand' : 'Raise Hand'}</BarLabel>
    </BarButton>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.5 Reactions Button
// ─────────────────────────────────────────────────────────────────────────────
interface ReactionsButtonProps {
  onReact: (emoji: ReactionEmoji) => void;
}
export function ReactionsButton({ onReact }: ReactionsButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const handle = (emoji: ReactionEmoji) => {
    onReact(emoji);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <BarButton id="reactions-btn" title="Send a reaction" onClick={() => setOpen((v) => !v)} active={open}>
        <Smile size={20} />
        <BarLabel>React</BarLabel>
      </BarButton>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl">
          <div className="flex gap-1">
            {(EMOJIS as readonly ReactionEmoji[]).map((emoji) => (
              <button
                key={emoji}
                onClick={() => handle(emoji)}
                className="text-2xl p-2 rounded-xl hover:bg-white/10 transition-colors"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
