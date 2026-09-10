import { prisma } from '@/lib/prisma';
import { eventBus } from '@/lib/realtime/event-bus';
import crypto from 'crypto';

export enum AnomalyType {
  EMPTY_CLASSROOM = 'EMPTY_CLASSROOM',        // Class running with 0 students for >10min
  RAPID_FIRE_SESSIONS = 'RAPID_FIRE_SESSIONS', // >3 sessions started within 1 hour
  RECORDING_FAILURE_LOOP = 'RECORDING_FAILURE_LOOP', // Recording failed >3 times
  AFTER_HOURS_CLASS = 'AFTER_HOURS_CLASS',    // Class started between 11pm - 5am
  STUDENT_MASS_DROPOUT = 'STUDENT_MASS_DROPOUT', // >50% students left within 5 min
  REPEATED_CONTENT_FLAGGING = 'REPEATED_CONTENT_FLAGGING', // Course flagged >2 times
  EXCESSIVE_MESSAGE_RATE = 'EXCESSIVE_MESSAGE_RATE', // >100 messages/min in session
}

export interface AnomalyEvent {
  id: string;
  type: AnomalyType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  teacherId: string;
  teacherName: string;
  sessionId?: string;
  courseId?: string;
  description: string;
  detectedAt: Date;
  metadata: Record<string, any>;
}

const SEVERITY_MAP: Record<AnomalyType, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
  [AnomalyType.EMPTY_CLASSROOM]: 'MEDIUM',
  [AnomalyType.RAPID_FIRE_SESSIONS]: 'HIGH',
  [AnomalyType.RECORDING_FAILURE_LOOP]: 'LOW',
  [AnomalyType.AFTER_HOURS_CLASS]: 'LOW',
  [AnomalyType.STUDENT_MASS_DROPOUT]: 'HIGH',
  [AnomalyType.REPEATED_CONTENT_FLAGGING]: 'CRITICAL',
  [AnomalyType.EXCESSIVE_MESSAGE_RATE]: 'CRITICAL',
};

/**
 * AnomalyDetector
 * Server-side engine that analyzes teacher and classroom behavior
 * to flag suspicious patterns for admin review.
 */
export class AnomalyDetector {

  /**
   * Run all checks against a given live session.
   * Should be called periodically (every ~5 min) via a cron job or session event.
   */
  static async analyzeSession(sessionId: string): Promise<AnomalyEvent[]> {
    const anomalies: AnomalyEvent[] = [];

    try {
      const session = await prisma.liveSession.findUnique({
        where: { id: sessionId },
        include: {
          attendances: { select: { userId: true } },
          messages: { 
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 200
          },
          lesson: {
            include: {
              course: {
                include: {
                  instructor: { select: { id: true, name: true } }
                }
              }
            }
          }
        }
      });

      if (!session || session.status !== 'active') return [];

      const teacher = session.lesson?.course?.instructor;
      if (!teacher) return [];

      const elapsedMs = Date.now() - new Date(session.startTime).getTime();
      const elapsedMin = elapsedMs / 60000;

      // ─── CHECK 1: Empty Classroom ───────────────────────────────────
      if (elapsedMin > 10 && session.attendances.length === 0) {
        anomalies.push({
          id: crypto.randomUUID(),
          type: AnomalyType.EMPTY_CLASSROOM,
          severity: SEVERITY_MAP[AnomalyType.EMPTY_CLASSROOM],
          teacherId: teacher.id,
          teacherName: teacher.name || 'Unknown',
          sessionId: session.id,
          description: `Session running for ${Math.floor(elapsedMin)}min with 0 students.`,
          detectedAt: new Date(),
          metadata: { elapsedMin, roomName: session.roomName }
        });
      }

      // ─── CHECK 2: After-Hours Class ─────────────────────────────────
      const startHour = new Date(session.startTime).getHours();
      if (startHour >= 23 || startHour <= 5) {
        anomalies.push({
          id: crypto.randomUUID(),
          type: AnomalyType.AFTER_HOURS_CLASS,
          severity: SEVERITY_MAP[AnomalyType.AFTER_HOURS_CLASS],
          teacherId: teacher.id,
          teacherName: teacher.name || 'Unknown',
          sessionId: session.id,
          description: `Class started at ${startHour}:00 (after-hours window).`,
          detectedAt: new Date(),
          metadata: { startHour }
        });
      }

      // ─── CHECK 3: Excessive Message Rate ───────────────────────────
      if (session.messages.length >= 100) {
        const oldestMsg = session.messages[session.messages.length - 1];
        const msgWindowMs = Date.now() - new Date(oldestMsg.createdAt).getTime();
        const msgsPerMin = (session.messages.length / msgWindowMs) * 60000;

        if (msgsPerMin > 100) {
          anomalies.push({
            id: crypto.randomUUID(),
            type: AnomalyType.EXCESSIVE_MESSAGE_RATE,
            severity: SEVERITY_MAP[AnomalyType.EXCESSIVE_MESSAGE_RATE],
            teacherId: teacher.id,
            teacherName: teacher.name || 'Unknown',
            sessionId: session.id,
            description: `Unusual chat activity: ${Math.floor(msgsPerMin)} messages/min detected.`,
            detectedAt: new Date(),
            metadata: { msgsPerMin: Math.floor(msgsPerMin) }
          });
        }
      }

    } catch (err) {
      console.error('[ANOMALY_DETECTOR_ERROR]', err);
    }

    return anomalies;
  }

  /**
   * Check a teacher's overall behavior patterns (not session-specific).
   */
  static async analyzeTeacher(teacherId: string): Promise<AnomalyEvent[]> {
    const anomalies: AnomalyEvent[] = [];

    try {
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: { id: true, name: true }
      });
      if (!teacher) return [];

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // ─── CHECK: Rapid Fire Sessions ─────────────────────────────────
      const recentSessions = await prisma.liveSession.count({
        where: {
          lesson: { course: { instructorId: teacherId } },
          startTime: { gte: oneHourAgo }
        }
      });

      if (recentSessions > 3) {
        anomalies.push({
          id: crypto.randomUUID(),
          type: AnomalyType.RAPID_FIRE_SESSIONS,
          severity: SEVERITY_MAP[AnomalyType.RAPID_FIRE_SESSIONS],
          teacherId: teacher.id,
          teacherName: teacher.name || 'Unknown',
          description: `${recentSessions} sessions started within 1 hour by same instructor.`,
          detectedAt: new Date(),
          metadata: { recentSessions, windowHours: 1 }
        });
      }

    } catch (err) {
      console.error('[ANOMALY_DETECTOR_TEACHER_ERROR]', err);
    }

    return anomalies;
  }

  /**
   * Emit anomalies to the admin dashboard via EventBus.
   */
  static emitToAdmins(anomalies: AnomalyEvent[]) {
    anomalies.forEach(anomaly => {
      eventBus.emitEvent({
        eventId: anomaly.id,
        version: '1.0',
        source: 'anomaly-detector',
        timestamp: anomaly.detectedAt.toISOString(),
        type: `anomaly.${anomaly.type.toLowerCase()}`,
        metadata: { actorId: anomaly.teacherId },
        payload: {
          entity: 'anomaly',
          action: 'CREATE',
          id: anomaly.id,
          after: anomaly
        }
      });
    });
  }
}
