import { getIO } from '@/lib/realtime/socket-server';
import { AnomalyDetector, AnomalyType } from '@/lib/monitoring/anomaly-detector';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';

export enum IncidentSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  teacherId?: string;
  teacherName?: string;
  sessionId?: string;
  autoResolvable: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// In-memory store for active incidents (in production use Redis)
const activeIncidents = new Map<string, Incident>();

/**
 * IncidentResponseSystem
 * Central hub for operational alerts. Converts anomalies into
 * structured incidents and pushes them to the admin dashboard.
 */
export class IncidentResponseSystem {

  /**
   * Raise a new incident and push to all connected admins.
   */
  static raise(incident: Incident) {
    activeIncidents.set(incident.id, incident);

    const io = getIO();
    if (io) {
      io.to('admin_dashboard').emit('incident:new', incident);

      // For EMERGENCY level, also blast to role:admin room
      if (incident.severity === IncidentSeverity.EMERGENCY) {
        io.to('role:admin').emit('incident:emergency', {
          title: `🚨 EMERGENCY: ${incident.title}`,
          incident
        });
      }
    }

    console.warn(`[INCIDENT] [${incident.severity}] ${incident.title}`);
  }

  /**
   * Resolve an active incident.
   */
  static resolve(incidentId: string, resolvedBy: string) {
    const incident = activeIncidents.get(incidentId);
    if (!incident) return;

    incident.resolvedAt = new Date();
    incident.resolvedBy = resolvedBy;
    activeIncidents.set(incidentId, incident);

    const io = getIO();
    if (io) {
      io.to('admin_dashboard').emit('incident:resolved', { incidentId, resolvedBy });
    }
  }

  /**
   * Get all active (unresolved) incidents.
   */
  static getActive(): Incident[] {
    return Array.from(activeIncidents.values()).filter(i => !i.resolvedAt);
  }

  /**
   * Convert anomaly events into structured incidents.
   */
  static fromAnomalies(anomalies: ReturnType<typeof AnomalyDetector.analyzeSession> extends Promise<infer T> ? T : never) {
    (anomalies as any[]).forEach(anomaly => {
      const severityMap: Record<string, IncidentSeverity> = {
        LOW: IncidentSeverity.INFO,
        MEDIUM: IncidentSeverity.WARNING,
        HIGH: IncidentSeverity.CRITICAL,
        CRITICAL: IncidentSeverity.EMERGENCY,
      };

      const titleMap: Record<string, string> = {
        EMPTY_CLASSROOM: 'Empty Classroom Detected',
        RAPID_FIRE_SESSIONS: 'Suspicious Session Pattern',
        RECORDING_FAILURE_LOOP: 'Recording System Failure',
        AFTER_HOURS_CLASS: 'After-Hours Class Activity',
        STUDENT_MASS_DROPOUT: 'Mass Student Exit Detected',
        REPEATED_CONTENT_FLAGGING: 'Content Policy Violation',
        EXCESSIVE_MESSAGE_RATE: 'Abnormal Chat Activity',
      };

      IncidentResponseSystem.raise({
        id: anomaly.id,
        title: titleMap[anomaly.type] || anomaly.type,
        description: anomaly.description,
        severity: severityMap[anomaly.severity] || IncidentSeverity.WARNING,
        teacherId: anomaly.teacherId,
        teacherName: anomaly.teacherName,
        sessionId: anomaly.sessionId,
        autoResolvable: anomaly.severity === 'LOW',
        createdAt: anomaly.detectedAt,
      });
    });
  }
}
