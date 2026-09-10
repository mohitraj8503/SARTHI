export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'];
        const sessionRole = String(session.role || '').toUpperCase();
        const isSelf = session.userId === params.id;
        const isAdmin = adminRoles.includes(sessionRole);
        if (!isSelf && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const userId = params.id;

        // Transactional Reset
        await prisma.$transaction(async (tx) => {
            // 1. Reset Enrollments Progress
            // Deleting progress records
            await tx.progress.deleteMany({
                where: { userId }
            });

            // Resetting enrollment progress percentage
            await tx.enrollment.updateMany({
                where: { userId },
                data: {
                    progressPercentage: 0,
                    completedAt: null,
                    lastAccessedAt: null
                }
            });

            // 2. Reset Quiz Submissions
            await tx.quizSubmission.deleteMany({
                where: { userId }
            });

            // 3. Reset Points / Gamification
            await tx.user.update({
                where: { id: userId },
                data: {
                    totalPoints: 0,
                    grade: 'Beginner', // Reset grade
                }
            });

            // 4. Reset Notifications (mark all unread or delete?)
            // Maybe just delete old ones
            await tx.notification.deleteMany({
                where: { userId }
            });
        });

        // Re-fetch fresh stats (optional, but good for confirmation)
        const freshUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { totalPoints: true, grade: true }
        });

        return NextResponse.json({
            success: true,
            message: 'Profile reset successfully',
            stats: freshUser
        });

    } catch (error) {
        console.error('Profile reset error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
