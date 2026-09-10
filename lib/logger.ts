import { prisma } from './prisma';

/**
 * System-wide error logger for production auditing
 */
export async function logError(type: string, payload: any) {
  console.error(`[ERROR: ${type}]`, payload);
  
  try {
    await prisma.platformActivity.create({
      data: {
        type: `ERROR_${type}`,
        userId: payload?.userId || 'system',
        data: JSON.stringify({
          ...payload,
          timestamp: new Date().toISOString(),
          error: payload?.error instanceof Error ? payload.error.message : payload?.error
        })
      }
    });
  } catch (err) {
    console.error('Failed to log error to database:', err);
  }
}

/**
 * Log general platform activity
 */
export async function logPlatformActivity(arg1: any, arg2?: any) {
  const type = typeof arg1 === 'string' ? arg1 : arg1?.type || 'ACTIVITY';
  const payload = arg2 || arg1;
  
  console.log(`[ACTIVITY: ${type}]`, payload);
  
  try {
    await prisma.platformActivity.create({
      data: {
        type,
        userId: payload?.userId || 'system',
        data: JSON.stringify(payload)
      }
    });
  } catch (err) {
    console.error('Failed to log activity to database:', err);
  }
}

/**
 * Log security related events
 */
export async function logSecurityEvent(arg1: any, arg2?: any) {
  const type = typeof arg1 === 'string' ? arg1 : arg1?.type || 'SECURITY_EVENT';
  const payload = arg2 || arg1;

  console.warn(`[SECURITY: ${type}]`, payload);
  
  try {
    await prisma.securityEvent.create({
      data: {
        eventType: type,
        userId: payload?.userId,
        ipAddress: payload?.ipAddress || payload?.metadata?.ip || 'unknown',
        userAgent: payload?.userAgent || 'unknown',
        details: JSON.stringify(payload),
        status: payload?.status || 'LOGGED',
        severity: payload?.severity || 'LOW'
      }
    });
  } catch (err) {
    // Fallback
    try {
      await prisma.platformActivity.create({
        data: {
          type: `SECURITY_${type}`,
          userId: payload?.userId || 'system',
          data: JSON.stringify(payload)
        }
      });
    } catch(e) {
      console.error('Failed to log security event:', err);
    }
  }
}

/**
 * Generic logger utility
 */
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta || '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta || '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta || '');
  }
};
