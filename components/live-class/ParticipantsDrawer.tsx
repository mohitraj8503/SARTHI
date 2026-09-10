'use client';

import { useState } from 'react';
import { X, Users, Mic, MicOff, Video, VideoOff, Hand, MoreHorizontal, Search, Lock } from 'lucide-react';
import { useParticipants, useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { Participant, RemoteParticipant } from 'livekit-client';

interface ParticipantsDrawerProps {
  open: boolean;
  onClose: () => void;
  isHost: boolean;
  raisedHands: Set<string>;
  onMuteAll: () => void;
  onLowerHand: (identity: string) => void;
  onRemove: (identity: string, name: string) => void;
  roomLocked: boolean;
  onToggleLock: () => void;
}

/**
 * ParticipantsDrawer — lists all participants with host controls.
 *
 * - Pinned "You" row at top
 * - Search when >15 participants
 * - Host-only per-row actions: mute, remove, lower hand
 * - Host-only header: Mute all, Lock room
 */
export function ParticipantsDrawer({
  open, onClose, isHost, raisedHands, onMuteAll, onLowerHand, onRemove, roomLocked, onToggleLock,
}: ParticipantsDrawerProps) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [search, setSearch] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<{ identity: string; name: string } | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const total = participants.length;
  const showSearch = total > 15;

  const filtered = participants.filter((p) => {
    if (!search) return true;
    return (p.name || p.identity).toLowerCase().includes(search.toLowerCase());
  });

  // Put local participant first
  const sorted = [
    ...filtered.filter((p) => p.identity === localParticipant?.identity),
    ...filtered.filter((p) => p.identity !== localParticipant?.identity),
  ];

  const handleMute = async (participant: RemoteParticipant) => {
    try {
      // Send mute request via room API (teacher token has roomAdmin = true)
      await room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify({ type: 'mute_request', targetIdentity: participant.identity })),
        { reliable: true, topic: 'lc-events' }
      );
    } catch { /* non-fatal */ }
    setActionMenuId(null);
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden" onClick={onClose} />}

      <div className={`fixed right-0 top-0 bottom-0 z-40 w-full md:w-80 bg-slate-950 border-l border-white/8 flex flex-col
        transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-white">Participants</h2>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/8 text-slate-400">{total}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors" id="participants-close-btn">
            <X size={16} />
          </button>
        </div>

        {/* Host-only bulk actions */}
        {isHost && (
          <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
            <button
              onClick={onMuteAll}
              className="flex-1 text-xs py-1.5 px-3 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/8 transition-colors"
              id="mute-all-btn"
            >
              Mute all
            </button>
            <button
              onClick={onToggleLock}
              className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg border transition-colors ${
                roomLocked
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : 'border-white/10 text-slate-300 hover:text-white hover:bg-white/8'
              }`}
              id="lock-room-btn"
            >
              <Lock size={11} />
              {roomLocked ? 'Unlock' : 'Lock room'}
            </button>
          </div>
        )}

        {/* Search */}
        {showSearch && (
          <div className="px-4 py-2 border-b border-white/5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search participants…"
                className="w-full bg-slate-900 border border-white/10 text-white text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-600"
              />
            </div>
          </div>
        )}

        {/* Participant list */}
        <div className="flex-1 overflow-y-auto py-2">
          {sorted.map((p) => {
            const isLocal = p.identity === localParticipant?.identity;
            const isMicMuted = !p.isMicrophoneEnabled;
            const isCamOff = !p.isCameraEnabled;
            const hasHand = raisedHands.has(p.identity);
            const name = p.name || p.identity;
            const isTeacher = (() => {
              try { return JSON.parse(p.metadata || '{}').isTeacher; } catch { return false; }
            })();

            return (
              <div
                key={p.identity}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/4 group transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>

                {/* Name + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-white truncate">{name}</span>
                    {isLocal && <span className="text-xs text-slate-500">(You)</span>}
                    {isTeacher && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Host</span>}
                  </div>
                </div>

                {/* Status icons */}
                <div className="flex items-center gap-1.5 text-slate-500">
                  {hasHand && <span title="Hand raised">✋</span>}
                  {isMicMuted ? <MicOff size={13} className="text-slate-600" /> : <Mic size={13} className="text-green-500" />}
                  {isCamOff ? <VideoOff size={13} className="text-slate-600" /> : <Video size={13} className="text-green-500" />}
                </div>

                {/* Host actions */}
                {isHost && !isLocal && (
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuId(actionMenuId === p.identity ? null : p.identity)}
                      className="p-1 rounded-lg text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
                      id={`participant-menu-${p.identity}`}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                    {actionMenuId === p.identity && (
                      <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 min-w-[160px] z-50">
                        {hasHand && (
                          <MenuItem onClick={() => { onLowerHand(p.identity); setActionMenuId(null); }}>
                            ✋ Lower hand
                          </MenuItem>
                        )}
                        <MenuItem onClick={() => { handleMute(p as RemoteParticipant); }}>
                          {isMicMuted ? <><Mic size={13} /> Unmute</> : <><MicOff size={13} /> Mute</>}
                        </MenuItem>
                        <MenuItem
                          onClick={() => { setConfirmRemove({ identity: p.identity, name }); setActionMenuId(null); }}
                          variant="danger"
                        >
                          Remove
                        </MenuItem>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Remove confirmation dialog */}
        {confirmRemove && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 max-w-xs w-full">
              <h3 className="text-sm font-semibold text-white mb-2">Remove {confirmRemove.name}?</h3>
              <p className="text-xs text-slate-400 mb-4">They will be removed from this class. They can rejoin unless the room is locked.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmRemove(null)} className="flex-1 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-sm transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => { onRemove(confirmRemove.identity, confirmRemove.name); setConfirmRemove(null); }}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function MenuItem({ children, onClick, variant = 'default' }: {
  children: React.ReactNode; onClick: () => void; variant?: 'default' | 'danger';
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
        variant === 'danger'
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-slate-300 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}
