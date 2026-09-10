export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';
import { cacheData } from '@/lib/redis';

// Helper to calculate percentage change
function calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('tt_session')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyJWT(token);
        if (!payload || !payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const session = await validateSession(payload.sessionId);
        if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { role: true }
        });

        const role = String(user?.role || '').toUpperCase();
        if (!['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch data with Cache (TTL 60 seconds)
        const data = await cacheData('admin:dashboard:course-completions', async () => {
            const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

            const [totalActiveEnrollments, completedEnrollments, lastMonthEnrollments, lastMonthCompleted] = await Promise.all([
                prisma.enrollment.count({ where: { status: 'active' } }),
                prisma.enrollment.count({
                    where: {
                        status: 'active',
                        OR: [
                            { progressPercentage: 100 },
                            { completedAt: { not: null } }
                        ]
                    }
                }),
                prisma.enrollment.count({
                    where: {
                        status: 'active',
                        createdAt: { lt: thisMonthStart }
                    }
                }),
                prisma.enrollment.count({
                    where: {
                        status: 'active',
                        OR: [{ progressPercentage: 100 }, { completedAt: { not: null } }],
                        createdAt: { lt: thisMonthStart }
                    }
                })
            ]);

            const completionRatePct = totalActiveEnrollments > 0
                ? Math.round((completedEnrollments / totalActiveEnrollments) * 100)
                : 0;

            const lastMonthCompletionRate = lastMonthEnrollments > 0
                ? Math.round((lastMonthCompleted / lastMonthEnrollments) * 100)
                : 0;

            const completionRateChangePct = calculateChange(completionRatePct, lastMonthCompletionRate);

            return {
                completionRatePct,
                completionRateChangePct
            };
        }, 60);

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });

    } catch (error) {
        console.error('[Admin Course Completions API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch completions' }, { status: 500 });
    }
}

