import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacherId = params.id;

    // Fetch logs where this teacher is the target
    const logs = await prisma.adminAuditLog.findMany({
      where: {
        OR: [
          { targetId: teacherId, targetType: 'TEACHER' },
          { targetId: teacherId, targetType: 'USER' },
          { adminId: teacherId } // Actions performed by the teacher themselves
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ success: true, logs });

  } catch (error) {
    console.error('[TEACHER_AUDIT_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
