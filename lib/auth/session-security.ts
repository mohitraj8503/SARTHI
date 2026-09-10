import { prisma } from '@/lib/prisma';

/**
 * Session Security Improvements
 * Additional security measures for session management
 */

/**
 * Check if session is from a suspicious IP (changed location)
 * Logs warning if IP changes significantly between requests
 */
export async function validateSessionIP(sessionId: string, currentIP: string): Promise<boolean> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { ipAddress: true, userId: true }
    });

    if (!session) {
      return false;
    }

    // Check if IP has changed significantly
    if (session.ipAddress !== currentIP) {
      console.warn(`[SESSION SECURITY] IP changed for session ${sessionId}: ${session.ipAddress} -> ${currentIP}`);
      
      // Log security event
      await prisma.securityEvent.create({
        data: {
          userId: session.userId,
          type: 'SUSPICIOUS_ACTIVITY',
          description: `Session IP address changed from ${session.ipAddress} to ${currentIP}`,
          ipAddress: currentIP,
        }
      });

      // Invalidate session for security
      await prisma.session.update({
        where: { id: sessionId },
        data: { isValid: false }
      });

      return false;
    }

    return true;
  } catch (error) {
    console.error('[SESSION SECURITY] Error validating IP:', error);
    return false;
  }
}

/**
 * Detect if user agent has changed (potential session hijacking)
 */
export async function validateSessionUA(sessionId: string, currentUA: string): Promise<boolean> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { userAgent: true, userId: true }
    });

    if (!session) {
      return false;
    }

    // Check if user agent has changed significantly
    if (session.userAgent && session.userAgent !== currentUA) {
      console.warn(`[SESSION SECURITY] User agent changed for session ${sessionId}`);
      
      // Log security event
      await prisma.securityEvent.create({
        data: {
          userId: session.userId,
          type: 'SUSPICIOUS_ACTIVITY',
          description: `Session user agent changed`,
          userAgent: currentUA,
        }
      });

      // Invalidate session for security
      await prisma.session.update({
        where: { id: sessionId },
        data: { isValid: false }
      });

      return false;
    }

    return true;
  } catch (error) {
    console.error('[SESSION SECURITY] Error validating UA:', error);
    return false;
  }
}

/**
 * Force logout from all devices for a user
 */
export async function logoutAllDevices(userId: string): Promise<void> {
  try {
    // Invalidate all sessions for this user
    await prisma.session.updateMany({
      where: { userId, isValid: true },
      data: { isValid: false }
    });

    // Log security event
    await prisma.securityEvent.create({
      data: {
        userId,
        type: 'LOGOUT_ALL',
        description: 'User logged out from all devices',
      }
    });
  } catch (error) {
    console.error('[SESSION SECURITY] Error logging out all devices:', error);
  }
}

/**
 * Get active sessions for a user (for display in account settings)
 */
export async function getUserSessions(userId: string) {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId, isValid: true, expires: { gt: new Date() } },
      select: {
        id: true,
        deviceFingerprint: true,
        userAgent: true,
        ipAddress: true,
        lastActive: true,
        createdAt: true,
      },
      orderBy: { lastActive: 'desc' }
    });

    return sessions;
  } catch (error) {
    console.error('[SESSION SECURITY] Error getting user sessions:', error);
    return [];
  }
}

/**
 * Revoke a specific session by ID
 */
export async function revokeSpecificSession(sessionId: string): Promise<void> {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { isValid: false }
    });
  } catch (error) {
    console.error('[SESSION SECURITY] Error revoking session:', error);
  }
}

/**
 * Clean up expired sessions from database
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        OR: [
          { expires: { lt: new Date() } },
          { isValid: false }
        ]
      }
    });

    return result.count;
  } catch (error) {
    console.error('[SESSION SECURITY] Error cleaning up expired sessions:', error);
    return 0;
  }
}
