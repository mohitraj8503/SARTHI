'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  LiveKitRoom, RoomAudioRenderer, useParticipants, useLocalParticipant,
  useSpeakingParticipants, useChat,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useDataChannel } from './useDataChannel';
import { toast } from 'react-hot-toast';
import { TopBar } from './TopBar';
import { MainStage } from './MainStage';
import { ThumbnailStrip } from './ThumbnailStrip';
import { ControlBar } from './ControlBar';
import { ChatDrawer } from './ChatDrawer';
import { ParticipantsDrawer } from './ParticipantsDrawer';
import { ReactionOverlay, useReactionSender } from './ReactionOverlay';
import { usePersistedDevicePrefs } from './usePersistedDevicePrefs';
import { ReconnectingBanner } from './ReconnectingBanner';
import { LeaveConfirmPopover, EndClassDialog } from './LeaveEndDialogs';
import { PostCallSummary } from './PostCallSummary';
import type { DrawerType, StageLayout, ClassMeta, ParticipantRole, ClassEventPayload, ReactionEmoji } from './meeting-types';

interface MeetingRoomProps {
  token: string;
  serverUrl: string;
  classMeta: ClassMeta;
  role: ParticipantRole;
  userName: string;
  /** startedAt from DB — used for elapsed timer */
  startedAt?: Date | null;
  egressFailed?: boolean;
}

/**
 * MeetingRoom — top-level meeting shell.
 *
 * Outer: provides the LiveKitRoom context.
 * Inner (MeetingRoomContent): all hooks + layout + state management.
 */
export function MeetingRoom(props: MeetingRoomProps) {
  const [phase, setPhase] = useState<'meeting' | 'left' | 'ended'>('meeting');
  const [removedByHost, setRemovedByHost] = useState(false);
  const [endedAt, setEndedAt] = useState<Date | null>(null);

  const handleRejoin = useCallback(() => setPhase('meeting'), []);

  const { prefs } = usePersistedDevicePrefs();

  if (phase !== 'meeting') {
    return (
      <PostCallSummary
        role={props.role}
        classTitle={props.classMeta.title}
        courseId={props.classMeta.courseId}
        liveClassId={props.classMeta.id}
        classStillLive={phase === 'left'} // class may still be live after student leaves
        removedByHost={removedByHost}
        durationMs={endedAt && props.startedAt ? endedAt.getTime() - props.startedAt.getTime() : undefined}
        recordingStatus={props.classMeta.recording?.recordingStatus as any}
        onRejoin={phase === 'left' ? handleRejoin : undefined}
      />
    );
  }

  return (
    <LiveKitRoom
      token={props.token}
      serverUrl={props.serverUrl}
      connect
      video={prefs.cameraOn}
      audio={prefs.micOn}
      options={{
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          videoSimulcastLayers: [
            { width: 320, height: 180, encoding: { maxBitrate: 150000, maxFramerate: 15 } },
            { width: 640, height: 360, encoding: { maxBitrate: 500000, maxFramerate: 24 } },
            { width: 1280, height: 720, encoding: { maxBitrate: 1500000, maxFramerate: 30 } }
          ]
        }
      }}
      onDisconnected={() => setPhase('left')}
      className="flex flex-col flex-1 w-full h-full bg-[#030712]"
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#030712' }}
    >
      <MeetingRoomContent
        {...props}
        onLeave={() => setPhase('left')}
        onEnd={() => { 
          if (props.role === 'teacher') {
            window.location.href = `/teacher/courses/${props.classMeta.courseId}`;
          } else {
            setEndedAt(new Date()); 
            setPhase('ended');
          }
        }}
        onRemovedByHost={() => { setRemovedByHost(true); setPhase('left'); }}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

// ── Inner component — has access to room hooks ─────────────────────────────────
interface ContentProps extends MeetingRoomProps {
  onLeave: () => void;
  onEnd: () => void;
  onRemovedByHost: () => void;
}

function MeetingRoomContent({
  classMeta, role, userName, startedAt, egressFailed,
  onLeave, onEnd, onRemovedByHost,
}: ContentProps) {
  const isHost = role === 'teacher';
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const { prefs } = usePersistedDevicePrefs();

  // Re-apply persisted camera/mic choices once local participant is active
  useEffect(() => {
    if (!localParticipant) return;
    
    const applyDevices = async () => {
      try {
        if (prefs.cameraOn) {
          await localParticipant.setCameraEnabled(true, {
            deviceId: prefs.cameraId || undefined,
          });
        } else {
          await localParticipant.setCameraEnabled(false);
        }

        if (prefs.micOn) {
          await localParticipant.setMicrophoneEnabled(true, {
            deviceId: prefs.micId || undefined,
          });
        } else {
          await localParticipant.setMicrophoneEnabled(false);
        }
      } catch (err) {
        console.error('[MeetingRoom] Failed to apply persisted devices on join:', err);
      }
    };

    applyDevices();
  }, [localParticipant, prefs.cameraId, prefs.micId, prefs.cameraOn, prefs.micOn]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState<DrawerType>(null);
  const [layout, setLayout] = useState<StageLayout>(() => {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem('lc-layout') as StageLayout) || 'speaker';
    }
    return 'speaker';
  });
  const [pinnedIdentity, setPinnedIdentity] = useState<string | null>(null);
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
  const [handRaised, setHandRaised] = useState(false);
  const [chatDisabled, setChatDisabled] = useState(false);
  const [roomLocked, setRoomLocked] = useState(false);
  const [onlyHostCanShare, setOnlyHostCanShare] = useState(false);
  const [hostMuted, setHostMuted] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);

  // ── Persist layout preference ────────────────────────────────────────────
  const handleLayoutChange = (l: StageLayout) => {
    setLayout(l);
    localStorage.setItem('lc-layout', l);
  };

  // ── Data channel — class events ─────────────────────────────────────────
  const { send: sendEvent } = useDataChannel<ClassEventPayload>('lc-events', (payload) => {
    if (payload.type === 'raise_hand') {
      setRaisedHands((prev) => {
        const next = new Set(prev);
        if (payload.raised) next.add(payload.identity);
        else next.delete(payload.identity);
        return next;
      });
      if (isHost && payload.raised) {
        toast(`✋ ${payload.name} raised their hand`, { duration: 4000, position: 'top-right' });
      }
    }

    if (payload.type === 'hand_lowered_by_host') {
      if (payload.identity === localParticipant?.identity) {
        setHandRaised(false);
        toast('The host lowered your hand.', { duration: 3000 });
      }
      setRaisedHands((prev) => { const n = new Set(prev); n.delete(payload.identity); return n; });
    }

    if (payload.type === 'remove_participant') {
      if (payload.targetIdentity === localParticipant?.identity) {
        onRemovedByHost();
      }
    }

    if (payload.type === 'mute_all' && !isHost) {
      toast('You were muted by the host.', { duration: 3000 });
      setHostMuted(true);
      setTimeout(() => setHostMuted(false), 100); // just trigger the visual, actual mute via LK
    }

    if (payload.type === 'chat_disabled') {
      setChatDisabled(payload.disabled);
      if (!isHost) toast(payload.disabled ? 'Chat has been disabled by the host.' : 'Chat has been re-enabled.', { duration: 3000 });
    }

    if (payload.type === 'lock_room') {
      setRoomLocked(payload.locked);
    }
  });

  const broadcast = useCallback((payload: ClassEventPayload) => {
    sendEvent(payload, { reliable: true });
  }, [sendEvent]);

  // ── Raise hand ───────────────────────────────────────────────────────────
  const toggleHand = useCallback(() => {
    const next = !handRaised;
    setHandRaised(next);
    setRaisedHands((prev) => { const n = new Set(prev); if (next) n.add(localParticipant?.identity || ''); else n.delete(localParticipant?.identity || ''); return n; });
    broadcast({ type: next ? 'raise_hand' : 'raise_hand', identity: localParticipant?.identity || '', name: localParticipant?.name || userName, raised: next });
  }, [handRaised, localParticipant, userName, broadcast]);

  // ── Host: lower hand of participant ────────────────────────────────────
  const lowerHand = useCallback((identity: string) => {
    setRaisedHands((prev) => { const n = new Set(prev); n.delete(identity); return n; });
    broadcast({ type: 'hand_lowered_by_host', identity });
  }, [broadcast]);

  // ── Host: remove participant ────────────────────────────────────────────
  const removeParticipant = useCallback(async (identity: string, name: string) => {
    broadcast({ type: 'remove_participant', targetIdentity: identity });
    try {
      await fetch('/api/live-class/admin/remove-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveClassId: classMeta.id, targetIdentity: identity }),
      });
      toast.success(`${name} has been removed.`);
    } catch (e) {
      console.error('Failed to remove participant server-side:', e);
    }
  }, [broadcast, classMeta.id]);

  // ── Host: mute all ─────────────────────────────────────────────────────
  const muteAll = useCallback(async () => {
    broadcast({ type: 'mute_all' });
    try {
      // Loop over participants and mute them server-side
      await Promise.all(
        participants
          .filter((p) => p.identity !== localParticipant?.identity)
          .map((p) =>
            fetch('/api/live-class/admin/mute-participant', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ liveClassId: classMeta.id, targetIdentity: p.identity }),
            })
          )
      );
      toast.success('All participants muted.', { duration: 2000 });
    } catch (e) {
      console.error('Failed to mute all server-side:', e);
    }
  }, [broadcast, participants, localParticipant, classMeta.id]);

  // ── Host: chat disable ─────────────────────────────────────────────────
  const toggleChatDisabled = useCallback((disabledVal?: boolean) => {
    const next = typeof disabledVal === 'boolean' ? disabledVal : !chatDisabled;
    setChatDisabled(next);
    broadcast({ type: 'chat_disabled', disabled: next });
  }, [chatDisabled, broadcast]);

  // ── Host: lock room ────────────────────────────────────────────────────
  const toggleRoomLocked = useCallback(async () => {
    const next = !roomLocked;
    setRoomLocked(next);
    broadcast({ type: 'lock_room', locked: next });
    try {
      await fetch('/api/live-class/admin/lock-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveClassId: classMeta.id, lock: next }),
      });
      toast(next ? '🔒 Room locked — no new joins.' : '🔓 Room unlocked.', { duration: 2000 });
    } catch (e) {
      console.error('Failed to lock room server-side:', e);
    }
  }, [roomLocked, broadcast, classMeta.id]);

  // ── Reactions ──────────────────────────────────────────────────────────
  const sendReaction = useReactionSender();
  const handleReact = useCallback((emoji: ReactionEmoji) => {
    sendReaction(emoji, localParticipant?.name || userName);
  }, [sendReaction, localParticipant, userName]);

  // ── Unread chat count ──────────────────────────────────────────────────
  const { chatMessages } = useChat();
  const prevMsgCount = useRef(0);
  useEffect(() => {
    if (drawerOpen !== 'chat' && chatMessages.length > prevMsgCount.current) {
      setUnreadChat((c) => c + (chatMessages.length - prevMsgCount.current));
    }
    prevMsgCount.current = chatMessages.length;
  }, [chatMessages, drawerOpen]);

  useEffect(() => {
    if (drawerOpen === 'chat') setUnreadChat(0);
  }, [drawerOpen]);

  // ── Drawer toggle ──────────────────────────────────────────────────────
  const handleDrawerToggle = useCallback((d: DrawerType) => {
    setDrawerOpen((current) => current === d ? null : d);
  }, []);

  // ── Leave / End ────────────────────────────────────────────────────────
  const handleLeaveAction = () => {
    if (isHost) { setShowEndDialog(true); }
    else { setShowLeaveConfirm(true); }
  };

  const handleConfirmLeave = async () => {
    setLeaving(true);
    onLeave();
  };

  const handleConfirmEnd = async () => {
    setLeaving(true);
    try {
      await fetch('/api/live-class/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveClassId: classMeta.id }),
      });
    } catch (e) {
      console.error('[MeetingRoom] end class failed', e);
    }
    setShowEndDialog(false);
    onEnd();
  };

  const speakers = useSpeakingParticipants();

  // ── Identify main-stage participant for strip exclusion ────────────────
  const mainStageIdentity = pinnedIdentity || (layout === 'speaker' ? (
    speakers.find((p) => p.identity !== localParticipant?.identity)?.identity
    || localParticipant?.identity
  ) : null);

  // ── Drawer-aware stage width ───────────────────────────────────────────
  const hasDrawer = !!drawerOpen;

  return (
    <div className="flex flex-col flex-1 w-full h-full relative bg-[#030712] text-white">
      {/* Top bar */}
      <TopBar
        classTitle={classMeta.title}
        isHost={isHost}
        participantCount={participants.length}
        onParticipantsClick={() => handleDrawerToggle('participants')}
        egressFailed={egressFailed}
        startedAt={startedAt}
      />

      {/* Main area: stage + drawer side by side on desktop */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Stage area */}
        <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${hasDrawer ? 'md:mr-80' : ''}`}>
          {/* Video stage */}
          <div className="relative flex-1 overflow-hidden">
            <MainStage
              layout={layout}
              onLayoutChange={handleLayoutChange}
              pinnedIdentity={pinnedIdentity}
              onPin={setPinnedIdentity}
              onUnpin={() => setPinnedIdentity(null)}
              raisedHands={raisedHands}
              isHost={isHost}
            />

            {/* Reconnecting banner — overlays stage only */}
            <ReconnectingBanner onRejoin={() => { setShowLeaveConfirm(false); onLeave(); }} />
          </div>

          {/* Thumbnail strip */}
          <ThumbnailStrip
            pinnedIdentity={pinnedIdentity}
            raisedHands={raisedHands}
            onPin={setPinnedIdentity}
            onUnpin={() => setPinnedIdentity(null)}
            mainStageIdentity={typeof mainStageIdentity === 'string' ? mainStageIdentity : null}
          />
        </div>

        {/* Chat drawer */}
        <ChatDrawer
          open={drawerOpen === 'chat'}
          onClose={() => setDrawerOpen(null)}
          isHost={isHost}
          chatDisabled={chatDisabled}
          onChatDisabledToggle={toggleChatDisabled}
        />

        {/* Participants drawer */}
        <ParticipantsDrawer
          open={drawerOpen === 'participants'}
          onClose={() => setDrawerOpen(null)}
          isHost={isHost}
          raisedHands={raisedHands}
          onMuteAll={muteAll}
          onLowerHand={lowerHand}
          onRemove={removeParticipant}
          roomLocked={roomLocked}
          onToggleLock={toggleRoomLocked}
        />
      </div>

      {/* Control bar */}
      <ControlBar
        isHost={isHost}
        role={role}
        drawerOpen={drawerOpen}
        onDrawerToggle={handleDrawerToggle}
        unreadChatCount={unreadChat}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        handRaised={handRaised}
        onToggleHand={toggleHand}
        onReact={handleReact}
        onLeave={handleLeaveAction}
        onlyHostCanShare={onlyHostCanShare}
        onToggleShareRestriction={() => setOnlyHostCanShare((v) => !v)}
        hostMuted={hostMuted}
        liveClassId={classMeta.id}
      />

      {/* Floating reaction overlay */}
      <ReactionOverlay />

      {/* Leave confirmation (student) */}
      {showLeaveConfirm && (
        <LeaveConfirmPopover
          onCancel={() => setShowLeaveConfirm(false)}
          onLeave={handleConfirmLeave}
          loading={leaving}
        />
      )}

      {/* End class dialog (teacher) */}
      {showEndDialog && (
        <EndClassDialog
          onCancel={() => setShowEndDialog(false)}
          onEndForAll={handleConfirmEnd}
          loading={leaving}
        />
      )}
    </div>
  );
}
