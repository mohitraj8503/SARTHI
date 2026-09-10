/**
 * Standard Classroom Event Types
 */
export enum ClassroomEventType {
  CLASS_CREATED = 'class.created',
  CLASS_UPDATED = 'class.updated',
  CLASS_LIVE = 'class.live',
  CLASS_ENDED = 'class.ended',
  STUDENT_JOINED = 'student.joined',
  STUDENT_LEFT = 'student.left',
  RECORDING_STARTED = 'recording.started',
  RECORDING_READY = 'recording.ready',
  ASSIGNMENT_SHARED = 'assignment.shared',
  POLL_STARTED = 'poll.started',
}

/**
 * Standard Session States
 */
export enum SessionState {
  SCHEDULED = 'scheduled',
  STARTING = 'starting',
  LIVE = 'live',
  ENDING = 'ending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ClassroomEventPayload {
  lessonId: string;
  courseId?: string;
  roomName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
