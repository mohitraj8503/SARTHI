'use client';

import { useEffect, useState, useCallback } from 'react';

export interface DevicePrefs {
  cameraId: string;
  micId: string;
  speakerId: string;
  cameraOn: boolean;
  micOn: boolean;
}

const STORAGE_KEY = 'sarthi:device-prefs';

const defaultPrefs: DevicePrefs = {
  cameraId: '',
  micId: '',
  speakerId: '',
  cameraOn: true,
  micOn: true,
};

/**
 * usePersistedDevicePrefs
 *
 * Persists the user's camera/mic selection and toggled states in localStorage.
 * Used to carry settings from Lobby to Room and across network reconnects.
 */
export function usePersistedDevicePrefs() {
  const [prefs, setPrefs] = useState<DevicePrefs>(() => {
    if (typeof window === 'undefined') return defaultPrefs;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultPrefs, ...JSON.parse(stored) } : defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  });

  const updatePrefs = useCallback((updated: Partial<DevicePrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...updated };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return { prefs, updatePrefs };
}
