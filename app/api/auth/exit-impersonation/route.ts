import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const c = await cookies();
    const backupToken = c.get('tt_mentor_backup_session')?.value;
    const currentToken = c.get('tt_session')?.value;

    if (!backupToken) {
      return NextResponse.json({ error: 'No backup session found' }, { status: 400 });
    }

    // Verify backup token is valid
    const backupPayload = await verifyJWT(backupToken);
    if (!backupPayload) {
      // Backup token invalid, force logout
      c.set('tt_session', '', { maxAge: 0, path: '/' });
      c.set('tt_mentor_backup_session', '', { maxAge: 0, path: '/' });
      return NextResponse.json({ error: 'Backup session invalid' }, { status: 401 });
    }

    // Invalidate the impersonated session in DB and log exit action
    if (currentToken) {
      const currentPayload = await verifyJWT(currentToken);
      if (currentPayload && currentPayload.sessionId) {
        await prisma.session.update({
          where: { id: currentPayload.sessionId },
          data: { isValid: false }
        }).catch(() => {});
      }
      if (currentPayload && currentPayload.impersonatorId) {
        await prisma.auditLog.create({
          data: {
            actorId: backupPayload.userId,
            actorEmail: backupPayload.email || 'mentor@sarthi.in',
            action: 'MENTOR_EXIT_IMPERSONATION',
            entityType: 'User',
            entityId: currentPayload.userId,
            entityName: currentPayload.email || 'student',
            reason: `Mentor exited impersonation of student ${currentPayload.email}`,
          }
        });
      }
    }

    const isProd = process.env.NODE_ENV === 'production';
    
    // Restore the backup token as the main session
    c.set('tt_session', backupToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      ...(isProd ? { domain: '.sarthi-woad.vercel.app' } : {}),
    });

    // Delete the backup token
    c.set('tt_mentor_backup_session', '', {
      maxAge: 0,
      path: '/',
      ...(isProd ? { domain: '.sarthi-woad.vercel.app' } : {}),
    });

    const backupRole = (backupPayload.role || '').toUpperCase();
    const redirectUrl = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN'].includes(backupRole)
      ? '/admin/dashboard'
      : backupRole === 'MENTOR'
      ? '/mentor/dashboard'
      : '/teacher/dashboard';

    return NextResponse.json({ success: true, redirectUrl });
  } catch (error) {
    console.error('[exit-impersonation] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
