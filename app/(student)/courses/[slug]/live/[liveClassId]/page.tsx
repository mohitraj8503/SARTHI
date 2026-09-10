'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PreJoinLobby } from '@/components/live-class/PreJoinLobby';
import { MeetingRoom } from '@/components/live-class/MeetingRoom';
import type { ClassMeta } from '@/components/live-class/meeting-types';

/**
 * /courses/[courseId]/live/[liveClassId]
 *
 * Student live class page using the full new meeting UI.
 * PreJoinLobby (which handles SCHEDULED/ENDED/CANCELLED states) → MeetingRoom.
 */
export default function StudentLiveClassPage() {
  const { slug: courseId, liveClassId } = useParams<{ slug: string; liveClassId: string }>();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<ClassMeta | null>(null);
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [userName, setUserName] = useState('Student');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [phase, setPhase] = useState<'prejoin' | 'room'>('prejoin');
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!liveClassId || !courseId) return;
    Promise.all([
      fetch(`/api/courses/${courseId}/live-classes/${liveClassId}`).then((r) => r.json()),
      fetch('/api/user/me').then((r) => r.json()).catch(() => ({})),
    ])
      .then(([classData, userData]) => {
        if (!classData?.liveClass) {
          setFetchError('Live class not found or you are not enrolled.');
          return;
        }
        const lc = classData.liveClass;
        setMeta({
          id: lc.id,
          title: lc.title,
          description: lc.description,
          teacherName: lc.teacher?.name || lc.course?.teacher?.name || 'Instructor',
          teacherAvatar: null,
          scheduledAt: lc.scheduledAt,
          liveKitStatus: lc.liveKitStatus,
          courseId,
          participantCount: lc.participantCount,
          recording: lc.recording,
        });
        if (userData?.name) setUserName(userData.name);
        if (userData?.avatarUrl) setAvatarUrl(userData.avatarUrl);
      })
      .catch(() => setFetchError('Could not load class info. Please refresh.'))
      .finally(() => setLoading(false));
  }, [liveClassId, courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (fetchError || !meta) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-xl font-bold text-white mb-2">Could not load class</h1>
          <p className="text-slate-400 text-sm">{fetchError || 'Something went wrong.'}</p>
          <a href={`/courses/${courseId}`} className="mt-4 inline-block text-indigo-400 hover:underline text-sm">
            Back to course
          </a>
        </div>
      </div>
    );
  }

  if (phase === 'prejoin') {
    return (
      <PreJoinLobby
        classMeta={meta}
        role="student"
        userName={userName}
        avatarUrl={avatarUrl}
        onJoin={(tok, url) => {
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
      classMeta={meta}
      role="student"
      userName={userName}
      startedAt={null}
    />
  );
}
