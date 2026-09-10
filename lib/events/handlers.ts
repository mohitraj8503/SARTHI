import { prisma } from '@/lib/prisma';
import { DASHBOARD_EVENTS, DashboardEventType } from './dashboard-events';
import { subDays } from 'date-fns';

// Event emitter for in-memory event distribution
type EventListener = (data: Record<string, unknown>) => void;
const listeners: Map<string, Set<EventListener>> = new Map();

export function subscribeToDashboard(userId: string, listener: EventListener) {
  const channel = `dashboard:${userId}`;
  if (!listeners.has(channel)) {
    listeners.set(channel, new Set());
  }
  listeners.get(channel)!.add(listener);

  return () => {
    listeners.get(channel)?.delete(listener);
  };
}

function publishEvent(userId: string, type: DashboardEventType, data: Record<string, unknown> = {}) {
  const channel = `dashboard:${userId}`;
  const payload = { type, data, timestamp: new Date().toISOString() };

  listeners.get(channel)?.forEach(listener => {
    try {
      listener(payload);
    } catch (error) {
      console.error(`Error in dashboard event listener for ${userId}:`, error);
    }
  });
}

// Notification generator based on events
async function generateNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  metadata?: Record<string, unknown>
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      meta: metadata ? JSON.stringify(metadata) : null,
    }
  });
}

// Handler: LESSON_COMPLETED
export async function handleLessonCompleted(
  userId: string,
  lessonId: string,
  courseId: string,
  lessonTitle: string
) {
  // Get total completed lessons for milestone check
  const totalCompleted = await prisma.progress.count({
    where: { userId, completed: true }
  });

  // Check for milestone notifications
  const milestoneThresholds = [10, 25, 50, 100, 250, 500];
  const milestoneReached = milestoneThresholds.find(t => totalCompleted % t === 0 && totalCompleted >= t);

  if (milestoneReached) {
    await generateNotification(
      userId,
      'success',
      'Lesson Milestone! 🎉',
      `You've completed ${totalCompleted} lessons! Keep up the great work!`,
      { milestone: milestoneReached, totalCompleted }
    );
  }

  // Emit real-time update
  publishEvent(userId, DASHBOARD_EVENTS.LESSON_COMPLETED, {
    lessonId,
    courseId,
    lessonTitle,
    totalCompleted
  });
}

// Handler: QUIZ_SUBMITTED
export async function handleQuizSubmitted(
  userId: string,
  quizId: string,
  courseId: string,
  score: number,
  passingScore: number
) {
  const passed = score >= passingScore;

  if (passed) {
    await generateNotification(
      userId,
      'success',
      'Quiz Passed! 🎉',
      `You scored ${score}% on your quiz. ${score >= 90 ? 'Outstanding!' : 'Great work!'}`,
      { quizId, score, passingScore }
    );
  } else {
    await generateNotification(
      userId,
      'warning',
      'Quiz Results',
      `You scored ${score}% on your quiz. Keep practicing to improve!`,
      { quizId, score, passingScore }
    );
  }

  // Emit real-time update
  publishEvent(userId, DASHBOARD_EVENTS.QUIZ_SUBMITTED, {
    quizId,
    courseId,
    score,
    passed
  });
}

// Handler: SESSION_RECORDED
export async function handleSessionRecorded(
  userId: string,
  courseId: string,
  durationMinutes: number
) {
  // Check for study streak milestones
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  const sessionDates = await prisma.learningSession.findMany({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo }
    },
    select: { createdAt: true }
  });

  const uniqueDays = new Set(sessionDates.map(s => s.createdAt.toDateString()));
  const currentStreak = calculateCurrentStreak(uniqueDays, today);

  const streakMilestones = [7, 14, 30, 60, 100, 365];
  const milestoneReached = streakMilestones.find(s => currentStreak === s);

  if (milestoneReached) {
    await generateNotification(
      userId,
      'success',
      `${milestoneReached} Day Streak! 🔥`,
      `You've studied for ${milestoneReached} consecutive days! You're on fire!`,
      { streak: milestoneReached }
    );

    publishEvent(userId, DASHBOARD_EVENTS.STREAK_UPDATED, {
      currentStreak,
      milestone: milestoneReached
    });
  }

  // Emit real-time update
  publishEvent(userId, DASHBOARD_EVENTS.SESSION_RECORDED, {
    courseId,
    durationMinutes,
    currentStreak
  });
}

// Helper: Calculate current streak from unique session days
function calculateCurrentStreak(uniqueDays: Set<string>, today: Date): number {
  const sortedDays = Array.from(uniqueDays).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  if (sortedDays.length === 0) return 0;

  let streak = 0;
  let checkDate = new Date(today);

  // Check if studied today or yesterday
  const todayStr = checkDate.toDateString();
  const yesterdayStr = subDays(checkDate, 1).toDateString();

  if (!sortedDays.includes(todayStr) && !sortedDays.includes(yesterdayStr)) {
    return 0;
  }

  checkDate = sortedDays.includes(todayStr) ? checkDate : subDays(checkDate, 1);

  while (sortedDays.includes(checkDate.toDateString())) {
    streak++;
    checkDate = subDays(checkDate, 1);
  }

  return streak;
}

// Handler: ASSIGNMENT_DUE_SOON
export async function handleAssignmentDueSoon(
  userId: string,
  assignmentId: string,
  assignmentTitle: string,
  courseTitle: string,
  dueDate: Date,
  daysUntilDue: number
) {
  if (daysUntilDue <= 3) {
    await generateNotification(
      userId,
      'urgent',
      'Assignment Due Soon! ⏰',
      `"${assignmentTitle}" in ${courseTitle} is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}. Better get started!`,
      { assignmentId, dueDate, daysUntilDue }
    );
  } else if (daysUntilDue <= 7) {
    await generateNotification(
      userId,
      'warning',
      'Upcoming Assignment',
      `"${assignmentTitle}" in ${courseTitle} is due in ${daysUntilDue} days.`,
      { assignmentId, dueDate, daysUntilDue }
    );
  }

  publishEvent(userId, DASHBOARD_EVENTS.NOTIFICATION_CREATED, {
    assignmentId,
    assignmentTitle,
    courseTitle
  });
}

// Handler: COURSE_COMPLETED
export async function handleCourseCompleted(
  userId: string,
  courseId: string,
  courseTitle: string
) {
  await generateNotification(
    userId,
    'success',
    'Course Completed! 🎓',
    `Congratulations! You've completed "${courseTitle}"!`,
    { courseId }
  );

  publishEvent(userId, DASHBOARD_EVENTS.PROGRESS_UPDATED, {
    courseId,
    completed: true
  });
}
