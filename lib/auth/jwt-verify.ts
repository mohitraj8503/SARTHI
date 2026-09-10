import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { validateSession } from './session';

function getSecret() {
  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret) return null;
  return new TextEncoder().encode(jwtSecret);
}

export interface JWTPayload {
  userId: string;
  role: string;
  sessionId: string;
}

export async function verifyAuthToken(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = request.cookies.get('tt_session')?.value;
    const secret = getSecret();

    if (!token || !secret) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);
    const jwtPayload = payload as unknown as JWTPayload;
    if (!jwtPayload?.sessionId || !jwtPayload?.userId) {
      return null;
    }

    const session = await validateSession(jwtPayload.sessionId);
    if (!session || session.userId !== jwtPayload.userId) {
      return null;
    }

    return {
      userId: session.userId,
      role: session.user?.role || jwtPayload.role,
      sessionId: session.id,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
