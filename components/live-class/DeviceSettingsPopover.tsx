'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface DeviceSettingsPopoverProps {
  selectedCamera: string;
  selectedMic: string;
  selectedSpeaker?: string;
  onCameraChange: (deviceId: string) => void;
  onMicChange: (deviceId: string) => void;
  onSpeakerChange?: (deviceId: string) => void;
  onClose: () => void;
}

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: string;
}

/**
 * DeviceSettingsPopover
 *
 * Floating popover listing all available camera / microphone / speaker devices.
 * Selecting a device calls the change callback immediately for live-switch.
 * Closes on outside click or the ✕ button.
 */
export function DeviceSettingsPopover({
  selectedCamera,
  selectedMic,
  selectedSpeaker,
  onCameraChange,
  onMicChange,
  onSpeakerChange,
  onClose,
}: DeviceSettingsPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [deviceErrors, setDeviceErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setCameras(devices.filter((d) => d.kind === 'videoinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0,4)}`, kind: d.kind })));
      setMics(devices.filter((d) => d.kind === 'audioinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0,4)}`, kind: d.kind })));
      setSpeakers(devices.filter((d) => d.kind === 'audiooutput').map(d => ({ deviceId: d.deviceId, label: d.label || `Speaker ${d.deviceId.slice(0,4)}`, kind: d.kind })));
    }).catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleDeviceChange = async (
    kind: 'camera' | 'mic' | 'speaker',
    deviceId: string
  ) => {
    setDeviceErrors((prev) => ({ ...prev, [kind]: '' }));
    try {
      if (kind === 'camera') {
        await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } });
        onCameraChange(deviceId);
      } else if (kind === 'mic') {
        await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } } });
        onMicChange(deviceId);
      } else if (kind === 'speaker') {
        onSpeakerChange?.(deviceId);
      }
    } catch {
      setDeviceErrors((prev) => ({ ...prev, [kind]: 'Could not access this device.' }));
    }
  };

  return (
    <div
      ref={ref}
      className="absolute top-10 right-0 z-50 w-72 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Device Settings</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Camera */}
      <DeviceRow
        label="Camera"
        devices={cameras}
        selected={selectedCamera}
        onChange={(id) => handleDeviceChange('camera', id)}
        error={deviceErrors.camera}
      />

      {/* Microphone */}
      <DeviceRow
        label="Microphone"
        devices={mics}
        selected={selectedMic}
        onChange={(id) => handleDeviceChange('mic', id)}
        error={deviceErrors.mic}
      />

      {/* Speaker (only if devices found and setSinkId is supported) */}
      {speakers.length > 0 && (
        <DeviceRow
          label="Speaker"
          devices={speakers}
          selected={selectedSpeaker || ''}
          onChange={(id) => handleDeviceChange('speaker', id)}
          error={deviceErrors.speaker}
        />
      )}
    </div>
  );
}

function DeviceRow({
  label,
  devices,
  selected,
  onChange,
  error,
}: {
  label: string;
  devices: MediaDeviceInfo[];
  selected: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</label>
      <div className="relative">
        <select
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-800 border border-white/10 text-white text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500/50 transition-colors"
        >
          {devices.length === 0 ? (
            <option value="">No devices found</option>
          ) : (
            devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))
          )}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
