import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/live-class/admin/lock-room
 *
 * Host-only: Sets the lock state of the live class room in the database.
 * If true, any subsequent student token requests will be blocked.
 *
 * Body: { liveClassId, lock: boolean }
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { liveClassId, lock } = await req.json();
    if (!liveClassId || typeof lock !== 'boolean') {
      return NextResponse.json({ error: 'liveClassId and lock (boolean) required' }, { status: 400 });
    }

    const liveClass = await prisma.liveClass.findUnique({
      where: { id: liveClassId },
      select: { teacherId: true },
    });
    if (!liveClass) return NextResponse.json({ error: 'Live class not found' }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(user?.role || '');
    if (!isAdmin && liveClass.teacherId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.liveClass.update({
      where: { id: liveClassId },
      data: { isLocked: lock },
    });

    return NextResponse.json({ success: true, isLocked: lock });
  } catch (error: any) {
    console.error('[admin/lock-room]', error);
    return NextResponse.json({ error: 'Failed to update lock state', details: error?.message }, { status: 500 });
  }
}
