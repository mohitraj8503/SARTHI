// Dashboard-specific event types for real-time updates
export const DASHBOARD_EVENTS = {
  LESSON_COMPLETED: 'dashboard.lesson.completed',
  QUIZ_SUBMITTED: 'dashboard.quiz.submitted',
  SESSION_RECORDED: 'dashboard.session.recorded',
  ASSIGNMENT_SUBMITTED: 'dashboard.assignment.submitted',
  STREAK_UPDATED: 'dashboard.streak.updated',
  NOTIFICATION_CREATED: 'dashboard.notification.created',
  PROGRESS_UPDATED: 'dashboard.progress.updated',
  ACHIEVEMENT_UNLOCKED: 'dashboard.achievement.unlocked',
} as const;

export type DashboardEventType = typeof DASHBOARD_EVENTS[keyof typeof DASHBOARD_EVENTS];

export interface DashboardEventData {
  userId: string;
  type: DashboardEventType;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Event payload for SSE broadcasts
export interface DashboardSSEPayload {
  type: DashboardEventType;
  data: Record<string, unknown>;
  timestamp: string;
}
