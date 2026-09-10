import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis';

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '0.0.0.0';
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function POST(request: Request) {
  try {
    const auth = await getSession();
    if (!auth?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseId, sessionId } = await request.json();
    if (!courseId || !sessionId) {
      return NextResponse.json({ error: 'courseId and sessionId are required' }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({ where: { userId: auth.userId }, select: { id: true } });
    const isPrivileged = !!teacher || auth.role === 'ADMIN' || auth.role === 'SUPER_ADMIN';

    if (!isPrivileged) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: auth.userId, courseId } },
        select: { status: true }
      });

      if (!enrollment || enrollment.status.toLowerCase() !== 'active') {
        return NextResponse.json({ success: false, eject: true, reason: 'enrollment_revoked' }, { status: 403 });
      }
    }

    const redis = getRedisClient();
    if (redis) {
      const liveBindingKey = `live:binding:${auth.userId}:${sessionId}`;
      const binding = await redis.get(liveBindingKey);
      const currentIpHash = sha256(getClientIp(request));
      const expectedBinding = sha256(`${auth.userId}:${sessionId}:${currentIpHash}`);

      if (binding && binding !== expectedBinding) {
        return NextResponse.json({ success: false, eject: true, reason: 'token_ip_mismatch' }, { status: 409 });
      }

      await redis.setex(`live:heartbeat:${auth.userId}:${sessionId}`, 360, String(Date.now()));
    }

    return NextResponse.json({ success: true, eject: false });
  } catch (error) {
    console.error('[LIVE_HEARTBEAT]', error);
    return NextResponse.json({ error: 'Heartbeat failed' }, { status: 500 });
  }
}
