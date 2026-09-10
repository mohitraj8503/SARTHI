'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PreJoinLobby } from '@/components/live-class/PreJoinLobby';
import { MeetingRoom } from '@/components/live-class/MeetingRoom';
import type { ClassMeta } from '@/components/live-class/meeting-types';

/**
 * /teacher/live-class/[liveClassId]
 *
 * Teacher in-class view using the full new meeting UI.
 * PreJoinLobby → MeetingRoom (which owns PostCallSummary routing).
 */
export default function TeacherLiveClassRoomPage() {
  const { liveClassId } = useParams<{ liveClassId: string }>();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<ClassMeta | null>(null);
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [userName, setUserName] = useState('Instructor');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<'prejoin' | 'room'>('prejoin');

  useEffect(() => {
    if (!liveClassId) return;
    Promise.all([
      fetch(`/api/teacher/live-classes/${liveClassId}`).then((r) => r.json()),
      fetch('/api/user/me').then((r) => r.json()).catch(() => ({})),
    ])
      .then(([classData, userData]) => {
        if (classData?.liveClass) {
          const lc = classData.liveClass;
          setMeta({
            id: lc.id,
            title: lc.title,
            description: lc.description,
            teacherName: userData?.name || 'Instructor',
            teacherAvatar: userData?.avatarUrl || null,
            scheduledAt: lc.scheduledAt,
            liveKitStatus: lc.liveKitStatus,
            courseId: lc.courseId,
            recording: lc.recording,
          });
        }
        if (userData?.name) setUserName(userData.name);
        if (userData?.avatarUrl) setAvatarUrl(userData.avatarUrl);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [liveClassId]);

  if (loading) {
    return (
      <div className="flex-1 h-full w-full bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
      </div>
    );
  }

  if (phase === 'prejoin') {
    return (
      <PreJoinLobby
        classMeta={meta || {
          id: liveClassId,
          title: 'Live Class',
          teacherName: userName,
          scheduledAt: null,
          liveKitStatus: 'SCHEDULED',
          courseId: '',
        }}
        role="teacher"
        userName={userName}
        avatarUrl={avatarUrl}
        onJoin={async (tok, url) => {
          try {
            await fetch('/api/live-class/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ liveClassId }),
            });
          } catch (e) {
            console.error('Failed to mark class as started server-side:', e);
          }
          setToken(tok);
          setServerUrl(url);
          setPhase('room');
        }}
      />
    );
  }

  return (
    <MeetingRoom
      token={token}
      serverUrl={serverUrl}
      classMeta={meta!}
      role="teacher"
      userName={userName}
      startedAt={null}
    />
  );
}
