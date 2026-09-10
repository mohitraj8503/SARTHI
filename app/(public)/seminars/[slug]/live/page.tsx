'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, Radio, Loader2, ShieldCheck, Minimize2, Maximize2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';
import { JoinLiveClass } from '@/components/live-class/JoinLiveClass';
import { LiveClassRoom } from '@/components/live-class/LiveClassRoom';

export default function LiveSeminarPage() {
  const params = useParams();
  const id = (params?.slug as string) || '';
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isStartingBroadcast, setIsStartingBroadcast] = useState(false);
  const [isEndingBroadcast, setIsEndingBroadcast] = useState(false);

  // ── 1. Live Presence Heartbeat ───────────────────────────────────────────────
  useEffect(() => {
    if (!id || !user) return;

    const sendHeartbeat = async () => {
      try {
        await fetch(`/api/seminars/${id}/live`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'HEARTBEAT' }),
        });
      } catch (err) {
        console.error('Heartbeat failed', err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 45000);
    return () => clearInterval(interval);
  }, [id, user]);

  // ── 2. Fetch Seminar Metadata ────────────────────────────────────────────────
  const { data: seminar, isLoading: isSeminarLoading, refetch: refetchSeminar } = useQuery({
    queryKey: ['seminar', id],
    queryFn: async () => {
      const res = await fetch(`/api/seminars/${id}`);
      if (!res.ok) throw new Error('Failed to fetch seminar metadata');
      return res.json();
    },
    refetchInterval: 10000,
    enabled: !!id,
  });

  const isHost = user?.id === seminar?.instructorId || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // ── 3. Host Broadcast Actions ────────────────────────────────────────────────
  const startBroadcast = async () => {
    if (!seminar?.id) return;
    setIsStartingBroadcast(true);
    try {
      const res = await fetch(`/api/admin/seminars/${seminar.id}/go-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to start broadcast');
      queryClient.invalidateQueries({ queryKey: ['seminar', id] });
      refetchSeminar();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to start broadcast');
    } finally {
      setIsStartingBroadcast(false);
    }
  };

  const endBroadcast = async () => {
    if (!seminar?.id) return;
    if (!confirm('Are you sure you want to end the broadcast? This cannot be undone.')) return;
    setIsEndingBroadcast(true);
    try {
      const res = await fetch(`/api/admin/seminars/${seminar.id}/end-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to end broadcast');
      queryClient.invalidateQueries({ queryKey: ['seminar', id] });
      refetchSeminar();
      router.push(`/teacher/seminars`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to end broadcast');
    } finally {
      setIsEndingBroadcast(false);
    }
  };

  if (isSeminarLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] gap-12 font-sans">
        <div className="relative">
          <div className="w-24 h-24 border border-white/5 rounded-[2.5rem]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <p className="text-white text-[10px] font-black uppercase tracking-[0.6em]">Loading Seminar...</p>
      </div>
    );
  }

  if (!seminar) return null;

  // ── 4. Standby View if Seminar is Offline ────────────────────────────────────
  if (seminar.status !== 'LIVE') {
    return (
      <div className="flex flex-col h-screen bg-[#050505] text-white font-sans">
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <span className="font-bold text-white text-sm">
            sarthi<span className="text-zinc-400 font-normal ml-1">live</span>
          </span>
          <span className="text-xs text-zinc-400 font-medium">{seminar.title} (Offline)</span>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center text-center max-w-md bg-[#111] p-8 rounded-2xl border border-white/10 shadow-2xl">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
              <Radio className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>

            {isHost ? (
              <>
                <h2 className="text-xl font-bold mb-2">Initialize Seminar Broadcast</h2>
                <p className="text-xs text-zinc-400 mb-6">
                  Click below to start the live broadcast and allow registered attendees to connect.
                </p>
                <button
                  onClick={startBroadcast}
                  disabled={isStartingBroadcast}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2"
                >
                  {isStartingBroadcast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
                  {isStartingBroadcast ? 'Starting…' : 'Start Broadcast'}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2">Standby Mode</h2>
                <p className="text-xs text-zinc-400">
                  The host has not started the broadcast yet. Please hold on — stream will connect automatically when live.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── 5. In-Room View once Joined ──────────────────────────────────────────────
  if (hasJoined && livekitToken && serverUrl) {
    return (
      <LiveClassRoom
        token={livekitToken}
        serverUrl={serverUrl}
        liveClassId={seminar.id}
        isHost={isHost}
        onEndClass={isHost ? endBroadcast : undefined}
        onLeave={() => router.push(`/seminars/${seminar.slug || seminar.id}`)}
      />
    );
  }

  // ── 6. Pre-Join Lobby ────────────────────────────────────────────────────────
  return (
    <JoinLiveClass
      liveClassId={seminar.id}
      title={seminar.title}
      role={isHost ? 'teacher' : 'student'}
      userName={user?.name || user?.email || 'Guest Student'}
      avatarUrl={user?.avatar_url || undefined}
      onJoin={(token, url) => {
        setLivekitToken(token);
        setServerUrl(url);
        setHasJoined(true);
      }}
    />
  );
}
