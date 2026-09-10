import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "./auth/jwt";
import { withResiliency } from "@/lib/resilient-db";

export type RoleCarrier = {
  role?: string | null;
} | null | undefined;

// High-speed memory cache to protect against DB connection limits (Hostinger/Shared)
const userCache = new Map<string, { data: any, expires: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * SHIELD: Invalidate a specific user's cache entry
 */
export function invalidateUserCache(token: string) {
  if (token) userCache.delete(token);
}

/**
 * SHIELD: Invalidate all session caches (Full memory flush on logout)
 */
export function clearAllUserCache() {
  userCache.clear();
}

/**
 * SHIELD: Invalidate the current session cache (Helper for API routes)
 */
export async function invalidateSessionCache() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tt_session')?.value || cookieStore.get('user_session')?.value;
  if (token) {
    userCache.delete(token);
  }
}

/**
 * getCurrentUser: Native MySQL-backed authentication helper
 */
export const getCurrentUser = cache(async () => {
  const isDev = process.env.NODE_ENV === 'development';
  const devAuthEnabled =
    process.env.DEV_AUTH_FALLBACK === '1' &&
    process.env.ALLOW_DEV_AUTH_FALLBACK === '1';

  // 1. JWT SESSION CHECK
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tt_session')?.value || cookieStore.get('user_session')?.value;
    
    if (!token) {
      return null;
    }

    if (token) {
      const payload = await verifyJWT(token);
      
      if (payload && payload.userId) {
        // SECURITY: Validate DB session status — only reject if session is explicitly marked invalid
        if (payload.sessionId) {
          const sessionCheck = await prisma.session.findUnique({
            where: { id: payload.sessionId },
            select: { isValid: true }
          }).catch(() => undefined);

          if (sessionCheck && sessionCheck.isValid === false) {
            userCache.delete(token);
            return null;
          }
        }

        // SHIELD: Check memory cache (session is confirmed valid)
        const cached = userCache.get(token);
        if (cached && cached.expires > Date.now()) {
          return cached.data;
        }

        // Build user from JWT payload as resilient default
        const userFromPayload = {
          id: payload.userId,
          role: (payload.role as string || 'STUDENT').toUpperCase(),
          name: (payload.name as string) || 'User',
          email: (payload.email as string) || '',
          avatar_url: (payload.avatar_url as string) || null,
          image: (payload.image as string) || (payload.avatar_url as string) || null,
          onboarded: true,
          status: 'ACTIVE',
          impersonatorId: payload.impersonatorId,
          platformSegment: (payload.platformSegment as any) || 'MAIN',
          educationLevel: payload.educationLevel || null,
        };

        // OPTIMIZATION: Try fetching fresh user from DB, fallback to userFromPayload on DB stutter
        try {
          const resiliencyResult = await withResiliency(() => prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
              id: true, email: true, name: true, role: true,
              onboarded: true, status: true, avatar_url: true, image: true,
              blogAccessStatus: true, avatar_version: true,
              requiresPasswordChange: true, onboardingStatus: true,
              platformSegment: true, educationLevel: true,
              teacher: { select: { teacherId: true } }
            }
          }), `auth_db_user_${payload.userId}`);

          let dbUser = resiliencyResult.data;

          if (!dbUser && payload.email) {
            const emailResult = await withResiliency(() => prisma.user.findUnique({
              where: { email: payload.email },
              select: {
                id: true, email: true, name: true, role: true,
                onboarded: true, status: true, avatar_url: true, image: true,
                blogAccessStatus: true, avatar_version: true,
                requiresPasswordChange: true, onboardingStatus: true,
                platformSegment: true, educationLevel: true,
                teacher: { select: { teacherId: true } }
              }
            }), `auth_db_email_${payload.email}`);
            dbUser = emailResult.data;
          }

          if (dbUser) {
            const user = {
              id: dbUser.id,
              role: dbUser.role ? dbUser.role.toUpperCase() : 'STUDENT',
              name: dbUser.name || 'User',
              email: dbUser.email,
              onboarded: dbUser.onboarded,
              avatar_url: dbUser.avatar_url,
              image: dbUser.image,
              avatar_version: dbUser.avatar_version || 0,
              teacherId: dbUser.teacher?.teacherId,
              requiresPasswordChange: dbUser.requiresPasswordChange,
              onboardingStatus: dbUser.onboardingStatus,
              status: dbUser.status,
              blogAccessStatus: dbUser.blogAccessStatus,
              impersonatorId: payload.impersonatorId,
              platformSegment: dbUser.platformSegment || 'MAIN',
              educationLevel: dbUser.educationLevel,
            };

            const result = {
              ...user,
              user: user,
              sessionId: payload.sessionId,
              loggedIn: true,
            };
            if (token) userCache.set(token, { data: result, expires: Date.now() + CACHE_TTL });
            return result;
          }
        } catch {
          // DB query failed or timed out, fallback to userFromPayload
        }

        const payloadResult = {
          ...userFromPayload,
          user: userFromPayload,
          sessionId: payload.sessionId,
          loggedIn: true,
        };
        if (token) userCache.set(token, { data: payloadResult, expires: Date.now() + CACHE_TTL });
        return payloadResult;
      }
    }
  } catch (err) {
    console.error("[auth] Session validation failed:", err);
  }

  return null;
});

export function isAdmin(user: RoleCarrier) {
  if (!user) return false;
  const role = (user.role ?? '').toUpperCase();
  return ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(role);
}

export function isManagement(user: RoleCarrier) {
  if (!user) return false;
  const role = (user.role ?? '').toUpperCase();
  return ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'TEACHER', 'INSTRUCTOR'].includes(role);
}

export function isBlogWriter(user: RoleCarrier) {
  if (!user) return false;
  const role = (user.role ?? '').toUpperCase();
  return ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'BLOG_WRITER'].includes(role);
}

/**
 * determineRole: Core Rule - Domain-based role assignment
 * @sarthi-woad.vercel.app -> TEACHER
 * anything else -> STUDENT
 */
export function determineRole(email: string): 'TEACHER' | 'STUDENT' | 'MENTOR' {
  const normalizedEmail = (email || '').toLowerCase();
  if (normalizedEmail === 'pm.enthuse@gmail.com') {
    return 'MENTOR';
  }
  if (normalizedEmail.endsWith('@sarthi-woad.vercel.app')) {
    return 'TEACHER';
  }
  return 'STUDENT';
}
