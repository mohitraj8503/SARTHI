'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Loader2, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import { startQuickLive } from '@/lib/teacher/start-quick-live';

/**
 * SARTHI Meet — Go Live Button
 * Creates a LiveKit room and redirects the teacher to the classroom.
 * No external accounts (Microsoft/Google) needed.
 */
export default function GoLiveButton() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'ready' | 'connecting' | 'error'>('ready');

  const handleGoLive = async () => {
    try {
      setLoading(true);
      setStatus('connecting');

      const { roomId } = await startQuickLive();
      router.push(`/teacher/live/${roomId}`);

    } catch (err: any) {
      console.error('❌ Go Live failed:', err);
      setStatus('error');
      addToast(err?.message || 'Failed to start live class', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handleGoLive}
      className={cn(
        "w-full py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group",
        loading
          ? 'bg-slate-200 text-slate-500 cursor-wait'
          : 'bg-red-600 text-white shadow-red-600/30 hover:bg-red-700'
      )}
    >
      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Video className="w-5 h-5 group-hover:scale-125 transition-transform" />
      )}
      <span className="relative z-10">
        {loading ? 'Initiating Class...' : '🔴 Start Quick Live'}
      </span>
    </button>
  );
}

