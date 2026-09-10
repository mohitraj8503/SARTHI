import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';

/**
 * Admin Moderation API
 * Handles suspension and account locking for teachers.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teacherId, reason, action } = await req.json();

    if (!teacherId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { teacherApplication: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'SUSPEND') {
      await prisma.$transaction([
        // 1. Update User Status
        prisma.user.update({
          where: { id: teacherId },
          data: { status: 'SUSPENDED' }
        }),
        // 2. Update Application Status (if exists)
        ...(targetUser.teacherApplication ? [
          prisma.teacherApplication.update({
            where: { id: targetUser.teacherApplication.id },
            data: { status: 'SUSPENDED' }
          })
        ] : []),
        // 3. Optional: Revoke Sessions
        prisma.session.deleteMany({
          where: { userId: teacherId }
        })
      ]);

      await AuditLogger.log(
        AuditAction.TEACHER_SUSPENDED,
        session.userId,
        'USER',
        teacherId,
        { reason }
      );

      return NextResponse.json({ success: true, message: 'Teacher suspended and access revoked instantly.' });
    }

    if (action === 'ACTIVATE') {
        await prisma.user.update({
          where: { id: teacherId },
          data: { status: 'ACTIVE' }
        });
        
        return NextResponse.json({ success: true, message: 'Teacher reactivated.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[ADMIN_MOD_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
