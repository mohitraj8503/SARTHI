/**
 * Real-Time Event Broadcasting System for SARTHI LMS
 * 
 * This module handles event publishing via Redis pub/sub for real-time
 * dashboard updates across Admin, Teacher, and Student interfaces.
 */

// Redis import is handled dynamically to prevent Edge Runtime build errors
// import Redis from 'ioredis';

interface EventPublisher {
  publish: (channel: string, message: string) => Promise<number>;
  on: (event: 'error' | 'connect', callback: (value?: unknown) => void) => void;
  quit: () => Promise<void>;
}

interface PrismaLike {
  platformActivity: {
    create: (args: Record<string, unknown>) => Promise<unknown>;
  };
  activityLog: {
    create: (args: Record<string, unknown>) => Promise<unknown>;
  };
}

// Event types for the platform
export type EventType =
  | 'NEW_STUDENT_REGISTERED'
  | 'NEW_TEACHER_REGISTERED'
  | 'STUDENT_ENROLLED'
  | 'COURSE_CREATED'
  | 'PAYMENT_RECEIVED'
  | 'COURSE_COMPLETED'
  | 'NOTIFICATION_UPDATED'
  | 'TEACHER_UPDATED'
  | 'COURSE_UPDATED'
  | 'ENROLLMENT_CANCELLED';

// WebSocket room channels
export type RoomChannel =
  | 'admin-room'
  | `teacher-${string}`
  | `student-${string}`
  | `course-${string}`
  | 'global';

// Event payload structure
export interface SyncEvent {
  type: EventType;
  timestamp: string;
  payload: {
    entity: string;
    action: string;
    data: Record<string, unknown>;
  };
}

// Redis client for publishing events
let publisher: EventPublisher | null = null;

/**
 * Get or create the Redis publisher client
 */
function getPublisher(): EventPublisher | null {
  if (typeof (globalThis as Record<string, unknown>).EdgeRuntime === 'string') return null;

  if (!process.env.REDIS_URL) {
    console.warn('[Events] Redis not configured - events will not be broadcast');
    return null;
  }

  if (!publisher) {
    try {
       
      const RedisClass = require('ioredis') as new (
        url: string,
        options: Record<string, unknown>
      ) => EventPublisher;
      publisher = new RedisClass(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000,
      });

      publisher.on('error', (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[Events] Redis publisher error:', message);
      });

      publisher.on('connect', () => {
        console.log('[Events] Redis publisher connected');
      });
    } catch (error) {
      console.error('[Events] Failed to initialize Redis publisher:', error);
      return null;
    }
  }

  return publisher;
}

/**
 * Publish an event to a specific room/channel
 * This broadcasts the event to all connected clients subscribed to that room
 */
export async function publishEvent(
  channel: RoomChannel,
  event: SyncEvent
): Promise<boolean> {
  const redis = getPublisher();

  if (!redis) {
    console.warn(`[Events] Event not published - Redis not available: ${event.type}`);
    return false;
  }

  try {
    // Publish to the specific room channel
    await redis.publish(channel, JSON.stringify(event));

    // Also publish to global channel for system-wide events
    if (channel !== 'global') {
      await redis.publish('global', JSON.stringify(event));
    }

    console.log(`[Events] Published ${event.type} to ${channel}`);
    return true;
  } catch (error) {
    console.error(`[Events] Failed to publish event:`, error);
    return false;
  }
}

/**
 * Helper function to publish a student registration event
 */
export async function publishStudentRegistered(data: {
  studentId: string;
  name: string;
  email: string;
  courseEnrolled?: string;
}): Promise<boolean> {
  const event: SyncEvent = {
    type: 'NEW_STUDENT_REGISTERED',
    timestamp: new Date().toISOString(),
    payload: {
      entity: 'user',
      action: 'create',
      data,
    },
  };

  return publishEvent('admin-room', event);
}

/**
 * Helper function to publish a teacher registration event
 */
export async function publishTeacherRegistered(data: {
  teacherId: string;
  name: string;
  email: string;
}): Promise<boolean> {
  const event: SyncEvent = {
    type: 'NEW_TEACHER_REGISTERED',
    timestamp: new Date().toISOString(),
    payload: {
      entity: 'user',
      action: 'create',
      data,
    },
  };

  return publishEvent('admin-room', event);
}

/**
 * Helper function to publish a student enrollment event
 */
export async function publishStudentEnrolled(data: {
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  amount: number;
}): Promise<boolean> {
  const event: SyncEvent = {
    type: 'STUDENT_ENROLLED',
    timestamp: new Date().toISOString(),
    payload: {
      entity: 'enrollment',
      action: 'create',
      data,
    },
  };

  // Publish to admin room
  const adminResult = await publishEvent('admin-room', event);

  // Publish to specific teacher's room
  const teacherResult = await publishEvent(`teacher-${data.teacherId}`, event);

  // Publish to student's room
  const studentResult = await publishEvent(`student-${data.studentId}`, event);

  return adminResult || teacherResult || studentResult;
}

/**
 * Helper function to publish a course creation event
 */
export async function publishCourseCreated(data: {
  courseId: string;
  title: string;
  teacherId: string;
  teacherName: string;
  price: number;
  category: string;
}): Promise<boolean> {
  const event: SyncEvent = {
    type: 'COURSE_CREATED',
    timestamp: new Date().toISOString(),
    payload: {
      entity: 'course',
      action: 'create',
      data,
    },
  };

  // Publish to admin room
  const adminResult = await publishEvent('admin-room', event);

  // Publish to teacher's room
  const teacherResult = await publishEvent(`teacher-${data.teacherId}`, event);

  return adminResult || teacherResult;
}

/**
 * Helper function to publish a payment received event
 */
export async function publishPaymentReceived(data: {
  paymentId: string;
  amount: number;
  studentId: string;
  courseId: string;
  teacherId: string;
}): Promise<boolean> {
  const event: SyncEvent = {
    type: 'PAYMENT_RECEIVED',
    timestamp: new Date().toISOString(),
    payload: {
      entity: 'transaction',
      action: 'create',
      data,
    },
  };

  return publishEvent('admin-room', event);
}

/**
 * Helper function to publish a notification event
 */
export async function publishNotification(data: {
  userId: string;
  notificationId: string;
  title: string;
  message: string;
  type: string;
}): Promise<boolean> {
  const event: SyncEvent = {
    type: 'NOTIFICATION_UPDATED',
    timestamp: new Date().toISOString(),
    payload: {
      entity: 'notification',
      action: 'create',
      data,
    },
  };

  // Publish to specific user's room
  return publishEvent(`student-${data.userId}`, event);
}

export interface AnalyticsEvent {
  type: string;
  userId: string;
  courseId?: string;
  instructorId?: string;
  meta?: Record<string, unknown>;
  timestamp: Date;
}

export async function logEvent(event: AnalyticsEvent) {
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.platformActivity.create({
      data: {
        type: event.type,
        userId: event.userId,
        data: JSON.stringify({
          actorName: 'User',
          courseId: event.courseId,
          instructorId: event.instructorId,
          ...event.meta,
          timestamp: event.timestamp || new Date()
        }),
      }
    });
  } catch (error) {
    console.error('[Events] Failed to log analytics event:', error);
  }
}

/**
 * Log activity to the ActivityLog table (database)
 * This provides the data for the Recent Activity feed
 */
export async function logActivity(prisma: PrismaLike, data: {
  type: string;
  actorName: string;
  targetName?: string;
  userId?: string;
  severity?: 'info' | 'success' | 'warning' | 'critical';
  source?: 'students' | 'teachers' | 'courses' | 'system' | 'payments';
  action?: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
}): Promise<unknown> {
  try {
    // 1. Log to legacy PlatformActivity for backward compatibility
    await prisma.platformActivity.create({
      data: {
        type: data.type,
        userId: data.userId || null,
        data: JSON.stringify({
          actorName: data.actorName,
          targetName: data.targetName || null,
          metadata: data.metadata || {},
        }),
      },
    }).catch((e: unknown) => console.error('[Events] Legacy log failed:', e));

    // 2. Log to new ActivityLog for the Activity Feed & Dashboard
    const activity = await prisma.activityLog.create({
      data: {
        type: data.type,
        action: data.action || 'GENERIC',
        severity: data.severity || 'info',
        source: data.source || 'system',
        actorName: data.actorName,
        userId: data.userId || null,
        targetName: data.targetName || null,
        targetId: data.targetId || null,
        targetType: data.targetType || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        timestamp: new Date(),
      },
    });

    return activity;
  } catch (error) {
    console.error('[Events] Failed to log activity:', error);
    return null;
  }
}

/**
 * Clean up Redis connections on shutdown
 */
export async function cleanupEvents(): Promise<void> {
  if (publisher) {
    await publisher.quit();
    publisher = null;
    console.log('[Events] Redis publisher closed');
  }
}
