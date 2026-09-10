/**
 * components/live-class/meeting-types.ts
 * Shared types for the entire live-class meeting UI system.
 */

export type ParticipantRole = 'teacher' | 'student';
export type DrawerType = 'chat' | 'participants' | 'settings' | null;
export type StageLayout = 'speaker' | 'grid';
export type RecordingStatus = 'PROCESSING' | 'UPLOADING_TO_DRIVE' | 'READY' | 'FAILED' | 'NOT_STARTED';

export interface ClassMeta {
  id: string;
  title: string;
  description?: string | null;
  teacherName: string;
  teacherAvatar?: string | null;
  scheduledAt: string | null;
  liveKitStatus: string | null;
  courseId: string;
  participantCount?: number;
  recording?: {
    recordingStatus: RecordingStatus;
    driveFileId?: string | null;
    driveViewUrl?: string | null;
  } | null;
}

/** Data channel message protocol — topic: 'lc-events' */
export type ClassEventPayload =
  | { type: 'raise_hand';         identity: string; name: string; raised: boolean }
  | { type: 'remove_participant'; targetIdentity: string }
  | { type: 'mute_all' }
  | { type: 'chat_disabled';      disabled: boolean }
  | { type: 'lock_room';          locked: boolean }
  | { type: 'hand_lowered_by_host'; identity: string };

/** Data channel message protocol — topic: 'lc-reactions' */
export interface ReactionPayload {
  emoji: string;
  senderName: string;
  id: string;
}

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '👏', '🎉', '🙌'] as const;
export type ReactionEmoji = typeof REACTION_EMOJIS[number];
