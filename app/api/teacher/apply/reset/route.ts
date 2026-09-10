import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth/get-user';
import { AuditLogger, AuditAction } from '@/lib/audit/logger';

export async function POST() {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const app = await prisma.teacherApplication.findUnique({
            where: { userId: user.id }
        });

        if (!app) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // State guard: only allow reset from REJECTED or CHANGES_REQUESTED
        if (app.status !== 'REJECTED' && app.status !== 'CHANGES_REQUESTED') {
            return NextResponse.json({ 
                error: 'Cannot reset application. Only rejected or revision-requested applications can be reset.' 
            }, { status: 400 });
        }

        const updatedApp = await prisma.teacherApplication.update({
            where: { userId: user.id },
            data: { 
                status: 'DRAFT',
                currentStep: 1
            }
        });

        // Audit Logging
        await AuditLogger.log(
            AuditAction.TEACHER_APPLICATION_RESET,
            user.id,
            'TEACHER_APPLICATION',
            app.id,
            { previousStatus: app.status }
        );

        return NextResponse.json({ success: true, application: updatedApp });
    } catch (error: any) {
        console.error('[TEACHER_APPLY_RESET]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
