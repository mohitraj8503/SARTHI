import { prisma } from '@/lib/prisma';
import * as jose from 'jose';
import { verifyJWT } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/rate-limit';

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}



/**
 * Authenticates a teacher from the request headers or cookies
 * 
 * @param request - The incoming Request object
 * @returns Promise<string> - The teacher's user ID
 * @throws AuthenticationError | AuthorizationError
 */
export async function authenticateTeacher(request: Request): Promise<string> {
  // 1. Extract Token
  let token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    // Try cookies as fallback (for Next.js server actions/requests)
    const cookieHeader = request.headers.get('cookie');
    const cookies = cookieHeader?.split('; ').reduce((acc, row) => {
      const [key, val] = row.split('=');
      acc[key] = val;
      return acc;
    }, {} as Record<string, string>);
    
    token = cookies?.['tt_session'] || cookies?.['user_session'] || cookies?.['next-auth.session-token'];
  }
  
  if (!token) {
    throw new AuthenticationError('Missing authentication token');
  }
  
  // 2. Verify JWT
  const payload = await verifyJWT(token);
  
  if (!payload) {
    throw new AuthenticationError('Invalid or expired token');
  }
  
  const userId = payload.userId as string;

  // 3. Rate Limiting (Phase 8 Production Hardening)
  const rateLimit = await checkRateLimit(`teacher_api:${userId}`, 100, 60);
  if (!rateLimit.success) {
    console.error(`[SECURITY] Rate limit exceeded for teacher ${userId}`);
    throw new AuthorizationError('Too many requests. Please try again later.');
  }
  
  // 4. Role Validation
  let currentRole = payload.role;

  if (currentRole !== 'TEACHER' && currentRole !== 'INSTRUCTOR') {
    // Fallback: Check DB role if JWT is stale
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    if (dbUser && (dbUser.role === 'TEACHER' || dbUser.role === 'INSTRUCTOR' || dbUser.role === 'ADMIN')) {
      currentRole = dbUser.role;
    } else {
      console.warn(`[AUTH] Access denied. Role ${payload.role} is not authorized for teacher routes.`);
      throw new AuthorizationError('Teacher access required');
    }
  }
  
  // 5. Status Gatekeeping
  const teacher = await prisma.teacher.findUnique({
    where: { userId: userId },
    select: { status: true }
  });
  
  // Fallback: Check teacherApplication if Teacher profile not found
  const application = await prisma.teacherApplication.findUnique({
    where: { userId: userId },
    select: { status: true }
  });
  
  if (teacher && teacher.status?.toUpperCase() !== 'APPROVED' && teacher.status?.toUpperCase() !== 'VERIFIED') {
     console.warn(`[AUTH] Access blocked. Teacher profile status is ${teacher.status}`);
     throw new AuthorizationError('Teacher account is not yet approved');
  }

  if (!teacher && application && application.status !== 'APPROVED') {
    console.warn(`[AUTH] Access blocked. Teacher application status is ${application.status}`);
    throw new AuthorizationError('Teacher application is not yet approved');
  }
  
  return userId;
}

/**
 * Authenticates a student from the request
 */
export async function authenticateStudent(request: Request): Promise<string> {
  let token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    const cookieHeader = request.headers.get('cookie');
    const cookies = cookieHeader?.split('; ').reduce((acc, row) => {
      const [key, val] = row.split('=');
      acc[key] = val;
      return acc;
    }, {} as Record<string, string>);
    
    token = cookies?.['tt_session'] || cookies?.['user_session'] || cookies?.['next-auth.session-token'];
  }
  
  if (!token) {
    throw new AuthenticationError('Missing authentication token');
  }
  
  const payload = await verifyJWT(token);
  
  if (!payload) {
    throw new AuthenticationError('Invalid or expired token');
  }
  
  if (payload.role !== 'STUDENT' && payload.role !== 'USER') {
    throw new AuthorizationError('Student access required');
  }
  
  return payload.userId as string;
}
