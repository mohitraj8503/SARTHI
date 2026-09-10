import { prisma } from '../prisma';
const prismaAny = prisma as any;
import { withResiliency } from '../resilient-db';
import { verifyJWT } from './jwt';
import { headers, cookies } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';

export async function createSession(userId: string, _userRole: string, _email?: string, _name?: string) {
  let ip = '127.0.0.1';
  let ua = '';
  
  try {
    const headerList = await headers();
    ip = headerList.get('x-forwarded-for') || '127.0.0.1';
    ua = headerList.get('user-agent') || '';
  } catch (error) {
    console.warn('[SESSION] Could not access request headers:', error);
  }

  // Parse user agent
  let deviceFingerprint = 'unknown-device';
  try {
    const parser = new UAParser(ua);
    const agent = parser.getResult();
    deviceFingerprint = `${agent.browser.name || 'unknown'}-${agent.os.name || 'unknown'}-${agent.device.model || 'desktop'}`;
  } catch (error) {
    console.warn('[SESSION] UA parsing failed:', error);
  }

  // Relaxed session management: Allow multiple active sessions for better UX across devices.
  // Only purge extremely old sessions (> 30 days) to keep DB clean.
  try {
    await prismaAny.session.deleteMany({
      where: { 
        userId, 
        OR: [
          { isValid: false },
          { expires: { lt: new Date() } }
        ]
      }
    });
  } catch (e) {
    console.warn('[SESSION] Failed to clean up old sessions');
  }

  // Create session in DB
  const sessionResult = await withResiliency(
    () => prisma.session.create({
      data: {
        userId,
        sessionToken: crypto.randomBytes(32).toString('hex'),
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
        ipAddress: ip,
        userAgent: ua,
        deviceFingerprint,
      },
    })
  );
  
  let session = sessionResult.data;

  if (!sessionResult.success || !session) {
    console.warn('[SESSION] DB session creation failed/timed out, using resilient fallback session');
    session = {
      id: `session_${crypto.randomBytes(16).toString('hex')}`,
      userId,
      sessionToken: crypto.randomBytes(32).toString('hex'),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      ipAddress: ip,
      userAgent: ua,
      deviceFingerprint,
    } as any;
  }

  // Log successful login
  try {
    await prisma.securityEvent.create({
      data: {
        userId,
        type: 'LOGIN_SUCCESS',
        ipAddress: ip,
        userAgent: ua,
        metadata: JSON.stringify({ sessionId: session.id, fingerprint: deviceFingerprint }),
      },
    });
  } catch (e) {
    console.warn('Failed to log security event:', e);
  }

  return session;
}

export async function validateSession(sessionId: string) {
  // CRISIS BYPASS REMOVED
  // if (sessionId === 'mock-session-active') { ... }

  // Guard against undefined or null sessionId
  if (!sessionId || typeof sessionId !== 'string') {
    console.warn('[SESSION] Invalid sessionId provided:', sessionId);
    return null;
  }

  // Use a lean query with resiliency and short-term caching to prevent app-wide hangs
  const sessionResult = await withResiliency(
    () => prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true
          }
        }
      },
    }),
    `session_validate_${sessionId.substring(0, 10)}` // 10s-30s cache via global config
  );
  
  const session = sessionResult.data;

  if (!sessionResult.success || !session || !session.isValid || (session.expires && session.expires < new Date())) {
    return null;
  }

  // Handle case where user doesn't exist (data inconsistency)
  if (!session.user) {
    console.warn('[SESSION] Session exists but user not found, invalidating session:', sessionId);
    // Invalidate the orphaned session
    try {
      await prisma.session.update({
        where: { id: sessionId },
        data: { isValid: false }
      });
    } catch (e) {
      console.error('[SESSION] Failed to invalidate orphaned session:', e);
    }
    return null;
  }

  if (session.user.status !== 'ACTIVE') {
    return null;
  }

  // Update last active (don't await to keep it fast)
  prismaAny.session.update({
    where: { id: sessionId },
    data: { lastActive: new Date() },
  }).catch(console.error);

  return session;
}

export async function revokeSession(sessionId: string) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { isValid: false },
  });

  // Also clear cookies with secure options
  (await cookies()).set('tt_session', '', { 
    maxAge: 0, 
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  (await cookies()).set('user_session', '', { 
    maxAge: 0, 
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tt_session')?.value || cookieStore.get('user_session')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) return null;

    // Optional DB validation with fast resilience fallback
    try {
      if (payload.sessionId && typeof payload.sessionId === 'string') {
        const dbSession = await withResiliency(
          () => prisma.session.findUnique({
            where: { id: payload.sessionId },
            select: { id: true, userId: true, isValid: true, expires: true }
          }),
          `session_${payload.sessionId.substring(0, 10)}`
        );
        
        if (dbSession.success && dbSession.data) {
          if (!dbSession.data.isValid || (dbSession.data.expires && new Date(dbSession.data.expires) < new Date())) {
            // Explicitly revoked/expired in DB
            return null;
          }
        }
      }
    } catch (dbErr) {
      console.warn('[SESSION] DB validation check bypassed due to DB timeout, relying on valid HS512 JWT:', dbErr);
    }

    // Cryptographic JWT token is valid and unexpired — preserve session seamlessly!
    return {
      id: payload.sessionId || `jwt-${payload.userId}`,
      userId: payload.userId,
      role: payload.role || 'STUDENT',
      email: payload.email,
      name: payload.name
    };
  } catch (_error) {
    return null;
  }
}
