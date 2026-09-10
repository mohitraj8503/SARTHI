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
        const data = await cacheData('admin:dashboard:active-students', async () => {
            const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

            const [activeStudents, lastMonthActiveStudents] = await Promise.all([
                prisma.user.count({
                    where: { role: 'STUDENT', status: 'ACTIVE' }
                }),
                prisma.user.count({
                    where: {
                        role: 'STUDENT',
                        status: 'ACTIVE',
                        createdAt: { lt: thisMonthStart }
                    }
                })
            ]);

            const activeStudentsChangePct = calculateChange(activeStudents, lastMonthActiveStudents);

            return {
                activeStudents,
                activeStudentsChangePct
            };
        }, 60);

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });

    } catch (error) {
        console.error('[Admin Active Students API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch active students' }, { status: 500 });
    }
}

