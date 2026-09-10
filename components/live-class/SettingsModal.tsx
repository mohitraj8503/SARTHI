'use client';

import { useState } from 'react';
import { X, Volume2 } from 'lucide-react';
import { MediaDeviceMenu } from '@livekit/components-react';

interface SettingsModalProps {
  onClose: () => void;
}

type Tab = 'audio' | 'video' | 'general';

/**
 * SettingsModal — Audio / Video / General tabs.
 * Device changes apply live (via MediaDeviceMenu from LK).
 * Uses LK's MediaDeviceMenu which hooks into the room's device selection.
 */
export function SettingsModal({ onClose }: SettingsModalProps) {
  const [tab, setTab] = useState<Tab>('audio');
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [mirrorVideo, setMirrorVideo] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-950 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-sm font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors" id="settings-close-btn">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {(['audio', 'video', 'general'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/8'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-5 min-h-[280px]">
          {tab === 'audio' && (
            <div className="space-y-5">
              <SettingsRow label="Microphone">
                <MediaDeviceMenu
                  kind="audioinput"
                  className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"
                />
              </SettingsRow>
              <SettingsRow label="Speaker">
                <MediaDeviceMenu
                  kind="audiooutput"
                  className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"
                />
              </SettingsRow>
              <SettingsRow label="Test speaker">
                <button
                  onClick={() => {
                    const ctx = new AudioContext();
                    const osc = ctx.createOscillator();
                    osc.connect(ctx.destination);
                    osc.start();
                    setTimeout(() => { osc.stop(); ctx.close(); }, 300);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/8 text-sm transition-colors"
                >
                  <Volume2 size={14} /> Play test sound
                </button>
              </SettingsRow>
              <ToggleRow
                label="Noise suppression"
                description="Reduces background noise from your microphone"
                checked={noiseSuppression}
                onChange={setNoiseSuppression}
                id="noise-suppression-toggle"
              />
            </div>
          )}

          {tab === 'video' && (
            <div className="space-y-5">
              <SettingsRow label="Camera">
                <MediaDeviceMenu
                  kind="videoinput"
                  className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none"
                />
              </SettingsRow>
              <ToggleRow
                label="Mirror my video"
                description="Shows your camera mirrored — only affects your own view"
                checked={mirrorVideo}
                onChange={setMirrorVideo}
                id="mirror-video-toggle"
              />
            </div>
          )}

          {tab === 'general' && (
            <div className="space-y-5">
              <ToggleRow
                label="Chat message sound"
                description="Play a sound when a new chat message arrives"
                checked={chatNotifications}
                onChange={setChatNotifications}
                id="chat-notifications-toggle"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-white/8">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            id="settings-done-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, id }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void; id: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-white">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-600' : 'bg-slate-700'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
