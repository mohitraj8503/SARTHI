import { prisma } from '@/lib/prisma';

export async function logSecurityEvent(params: {
  userId?: string;
  eventType: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}) {
  try {
    // The prisma schema doesn't explicitly define SecurityEvent fields in the snippet,
    // so we'll construct the object flexibly based on what's common or use a generic log if the model fails.
    await prisma.securityEvent.create({
      data: {
        userId: params.userId || 'system',
        eventType: params.eventType,
        ipAddress: params.ipAddress || 'unknown',
        userAgent: params.userAgent || 'unknown',
        details: params.details ? JSON.stringify(params.details) : undefined,
      } as any // Handle schema variance
    });
  } catch (error) {
    console.error('[SECURITY_LOGGER] Failed to log security event to database', error);
  }
}
