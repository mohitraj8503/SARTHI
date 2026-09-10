'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useConnectionState, useLocalParticipant, useParticipants } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import {
  MicButton, CameraButton, ShareScreenButton, RaiseHandButton, ReactionsButton,
} from './ControlButtons';
import { MoreMenu } from './MoreMenu';
import { MessageSquare, Users, PhoneOff } from 'lucide-react';
import type { StageLayout, DrawerType, ReactionEmoji } from './meeting-types';

interface ControlBarProps {
  isHost: boolean;
  role: 'teacher' | 'student';
  drawerOpen: DrawerType;
  onDrawerToggle: (d: DrawerType) => void;
  unreadChatCount: number;
  layout: StageLayout;
  onLayoutChange: (l: StageLayout) => void;
  handRaised: boolean;
  onToggleHand: () => void;
  onReact: (emoji: ReactionEmoji) => void;
  onLeave: () => void;
  onlyHostCanShare: boolean;
  onToggleShareRestriction: () => void;
  hostMuted?: boolean;
  liveClassId: string;
}

/**
 * ControlBar
 *
 * Bottom control bar — full spec implementation.
 * Disabled (greyed, non-interactive) while reconnecting.
 * Mobile: only Mic, Camera, More, Leave shown inline; rest in More sheet (handled by MoreMenu).
 * Keyboard shortcuts: Ctrl+D (mic), Ctrl+E (camera), Ctrl+Shift+H (hand), Ctrl+Shift+C (chat), Esc (close drawers).
 */
export function ControlBar({
  isHost, role, drawerOpen, onDrawerToggle, unreadChatCount,
  layout, onLayoutChange, handRaised, onToggleHand, onReact,
  onLeave, onlyHostCanShare, onToggleShareRestriction, hostMuted,
  liveClassId,
}: ControlBarProps) {
  const state = useConnectionState();
  const isReconnecting = state === ConnectionState.Reconnecting;

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.hasAttribute('contenteditable'))
      ) {
        return;
      }
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'd') { e.preventDefault(); document.getElementById('mic-btn')?.click(); }
      if (ctrl && e.key === 'e') { e.preventDefault(); document.getElementById('camera-btn')?.click(); }
      if (ctrl && e.shiftKey && e.key === 'H') { e.preventDefault(); onToggleHand(); }
      if (ctrl && e.shiftKey && e.key === 'C') { e.preventDefault(); onDrawerToggle(drawerOpen === 'chat' ? null : 'chat'); }
      if (e.key === 'Escape') { onDrawerToggle(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen, onDrawerToggle, onToggleHand]);

  // ── Throttled reactions ──────────────────────────────────────────────────
  const lastReactAt = useRef(0);
  const handleReactThrottled = (emoji: ReactionEmoji) => {
    const now = Date.now();
    if (now - lastReactAt.current < 300) return;
    lastReactAt.current = now;
    onReact(emoji);
  };

  const barClass = `transition-opacity duration-200 ${isReconnecting ? 'opacity-40 pointer-events-none' : 'opacity-100'}`;

  return (
    <div className="flex-shrink-0 bg-slate-950/95 backdrop-blur-sm border-t border-white/5 px-4 py-2 z-20">
      <div className={`flex items-center justify-center gap-1 sm:gap-2 ${barClass}`}>

        {/* Mic */}
        <MicButton hostMuted={hostMuted} />

        {/* Camera */}
        <CameraButton />

        {/* Share Screen — hidden on mobile (in More) */}
        <div className="hidden sm:block">
          <ShareScreenButton onlyHostCanShare={onlyHostCanShare && !isHost} />
        </div>

        {/* Raise Hand — hidden on mobile (in More) */}
        <div className="hidden sm:block">
          <RaiseHandButton raised={handRaised} onToggle={onToggleHand} />
        </div>

        {/* Reactions — hidden on mobile */}
        <div className="hidden sm:block">
          <ReactionsButton onReact={handleReactThrottled} />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-white/10 mx-1" />

        {/* Chat */}
        <BarIconButton
          id="chat-btn"
          title="Chat (Ctrl+Shift+C)"
          active={drawerOpen === 'chat'}
          badge={unreadChatCount}
          onClick={() => onDrawerToggle(drawerOpen === 'chat' ? null : 'chat')}
          label="Chat"
        >
          <MessageSquare size={20} />
        </BarIconButton>

        {/* Participants */}
        <BarIconButton
          id="participants-btn"
          title="Participants"
          active={drawerOpen === 'participants'}
          onClick={() => onDrawerToggle(drawerOpen === 'participants' ? null : 'participants')}
          label="People"
          className="hidden sm:flex"
        >
          <Users size={20} />
        </BarIconButton>

        {/* More */}
        <MoreMenu
          layout={layout}
          onLayoutChange={onLayoutChange}
          isHost={isHost}
          onlyHostCanShare={onlyHostCanShare}
          onToggleShareRestriction={onToggleShareRestriction}
          onReportProblem={() => window.open('mailto:support@sarthi.in?subject=Meeting+Issue', '_blank')}
        />

        {/* Spacer */}
        <div className="flex-1 hidden sm:block" />

        {/* Leave / End */}
        <button
          id={isHost ? 'end-btn' : 'leave-btn'}
          onClick={onLeave}
          title={isHost ? 'End class' : 'Leave class'}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-semibold text-white transition-colors text-sm ${
            isHost
              ? 'bg-red-600 hover:bg-red-700'
              : 'border border-red-600/50 text-red-400 hover:bg-red-600/10'
          }`}
        >
          <PhoneOff size={20} />
          <span className="text-[10px] hidden sm:block">{isHost ? 'End' : 'Leave'}</span>
        </button>
      </div>
    </div>
  );
}

function BarIconButton({
  id, title, active, badge, onClick, label, children, className = '',
}: {
  id: string; title: string; active?: boolean; badge?: number;
  onClick: () => void; label: string; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      id={id}
      title={title}
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 ${
        active ? 'bg-white/15 text-white' : 'text-slate-300 hover:text-white hover:bg-white/8'
      } ${className}`}
    >
      {children}
      <span className="text-[10px] hidden sm:block">{label}</span>
      {badge != null && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] flex items-center justify-center font-bold">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}
