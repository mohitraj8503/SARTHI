import { eventBus, RealtimeEvent } from '../event-bus';
import { ClassroomEventType, ClassroomEventPayload } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Premium Classroom Event Emitter
 * Centralizes all classroom-related realtime communications.
 */
export class ClassroomEmitter {
  /**
   * Emit a standardized classroom event
   */
  static emit(type: ClassroomEventType, payload: ClassroomEventPayload, actorId?: string) {
    const event: RealtimeEvent = {
      eventId: uuidv4(),
      version: '1.0',
      source: 'live-classroom-service',
      timestamp: new Date().toISOString(),
      type,
      metadata: {
        actorId,
        correlationId: uuidv4(),
      },
      payload: {
        entity: 'live_session',
        action: this.mapTypeToAction(type),
        id: payload.lessonId,
        after: payload,
      },
    };

    eventBus.emitEvent(event);
    console.log(`[ClassroomEmitter] Emitted ${type} for ${payload.lessonId}`);
  }

  private static mapTypeToAction(type: ClassroomEventType): 'CREATE' | 'UPDATE' | 'DELETE' {
    switch (type) {
      case ClassroomEventType.CLASS_CREATED:
        return 'CREATE';
      case ClassroomEventType.CLASS_ENDED:
        return 'DELETE';
      default:
        return 'UPDATE';
    }
  }

  /**
   * Notify students that a class has gone live
   */
  static notifyClassLive(lessonId: string, courseId: string, roomName: string, teacherId: string) {
    this.emit(ClassroomEventType.CLASS_LIVE, {
      lessonId,
      courseId,
      roomName,
      timestamp: new Date().toISOString(),
    }, teacherId);
  }

  /**
   * Notify recording status changes
   */
  static notifyRecordingStatus(lessonId: string, status: 'started' | 'ready', url?: string) {
    this.emit(
      status === 'started' ? ClassroomEventType.RECORDING_STARTED : ClassroomEventType.RECORDING_READY,
      {
        lessonId,
        roomName: '', // Not needed for recording
        timestamp: new Date().toISOString(),
        metadata: { url }
      }
    );
  }
}
