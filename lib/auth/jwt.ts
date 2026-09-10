import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

const isProduction = process.env.NODE_ENV === 'production';
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test';
const DEFAULT_DEV_SECRET = "fc60549ed4f4ab65a89b01ccf6e06543ba43bb4ec8abbe804884ca309796def4";
const JWT_SECRET = process.env.JWT_SECRET || (!isProduction || isBuildTime ? DEFAULT_DEV_SECRET : "");

if (isProduction && !isBuildTime && (!JWT_SECRET || JWT_SECRET.length < 32)) {
  console.error("❌ JWT_SECRET must be set and at least 32 characters in production!");
  throw new Error('JWT_SECRET must be set and at least 32 characters. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}
const secret = new TextEncoder().encode(JWT_SECRET || DEFAULT_DEV_SECRET);

export interface JWTPayload {
  userId: string;
  role: string;
  sessionId: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  onboarded?: boolean;
  emailVerified?: boolean;
  impersonatorId?: string;
  platformSegment?: 'MAIN' | 'JUNIOR' | 'PENDING';
  educationLevel?: string;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS512' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days for smooth long-term session retention
    path: '/',
    ...(isProd ? { domain: '.sarthi-woad.vercel.app' } : {}),
  };
  
  cookieStore.set('tt_session', token, options);
  cookieStore.set('user_session', token, options);
}

export async function removeAuthCookie() {
  const isProd = process.env.NODE_ENV === 'production';
  const c = await cookies();
  const names = ['tt_session', 'user_session', 'user_role', 'next-auth.session-token'];
  
  for (const name of names) {
    c.set(name, '', { maxAge: 0, path: '/' });
    if (isProd) {
      c.set(name, '', { maxAge: 0, path: '/', domain: '.sarthi-woad.vercel.app' });
    }
  }
}
