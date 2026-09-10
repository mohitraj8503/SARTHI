'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NetworkStatus() {
  const [online, setOnline] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic DB Health Check
    const checkDb = async () => {
      try {
        const res = await fetch('/api/setup/status', { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        setDbConnected(data.status === 'CONNECTED');
      } catch (e) {
        setDbConnected(false);
      }
    };

    checkDb();
    const interval = setInterval(checkDb, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

    if (online) return null; // Only show if offline, remove "Refining content" for DB issues

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-8 right-8 z-[100] flex items-center gap-2.5 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 backdrop-blur-xl border ${
        !online
          ? 'bg-red-950/80 text-red-200 border-red-500/30'
          : 'bg-[#1A3C2E]/80 text-[#D4956A] border-[#D4956A]/20'
      }`}
    >
      <div className="relative">
        {!online ? (
          <WifiOff className="w-3.5 h-3.5" />
        ) : (
          <div className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-pulse" />
        )}
      </div>
      {!online ? 'Internet Connection Lost' : 'Refining content...'}
    </div>
  );
}

