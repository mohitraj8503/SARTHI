export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { createSession } from '@/lib/auth/session';
import { signJWT } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Admin Session using centralized auth
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    // 2. Get Target User ID
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Target User ID required' }, { status: 400 });
    }

    // 3. Fetch Target User
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    };

    const response = NextResponse.json({
      success: true,
      message: `Impersonating ${targetUser.name}`,
      redirectUrl: targetUser.role === 'INSTRUCTOR' ? '/teacher/dashboard' : '/dashboard',
    });

    // Backup current session to allow exiting impersonation
    const currentToken = req.cookies.get('tt_session')?.value;
    if (currentToken) {
      response.cookies.set('tt_mentor_backup_session', currentToken, cookieOptions);
    }

    const session = await createSession(targetUser.id, targetUser.role, targetUser.email, targetUser.name ?? undefined);
    const token = await signJWT({
      userId: targetUser.id,
      role: targetUser.role,
      sessionId: session.id,
      email: targetUser.email,
      name: targetUser.name ?? undefined,
      impersonatorId: user.id,
    });

    response.cookies.set('tt_session', token, cookieOptions);

    // Audit log and Notification for impersonation (critical security event)
    import('@/lib/admin/notifications').then(({ createAdminNotification }) => {
      createAdminNotification({
        title: 'User Impersonation Started 🛡️',
        body: `Admin ${user.name || user.email} started impersonating ${targetUser.name} (${targetUser.email})`,
        type: 'SECURITY',
        source: 'system',
        severity: 'critical',
        meta: { 
          adminId: user.id, 
          targetUserId: targetUser.id,
          adminEmail: user.email,
          targetEmail: targetUser.email
        }
      });
    }).catch(() => {}); 

    return response;
  } catch (error: any) {
    console.error('Impersonation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

