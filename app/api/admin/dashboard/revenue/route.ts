export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';
import { cacheData } from '@/lib/redis';

// Helper to get IST date boundaries
function getISTDateBoundaries() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);

    const todayStart = new Date(istNow);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(istNow);
    todayEnd.setHours(23, 59, 59, 999);

    return {
        todayStartUTC: new Date(todayStart.getTime() - istOffset),
        todayEndUTC: new Date(todayEnd.getTime() - istOffset),
    };
}

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
        const data = await cacheData('admin:dashboard:revenue', async () => {
            const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);

            const [totalRevenueResult, thisMonthRevenueResult, lastMonthRevenueResult] = await Promise.all([
                prisma.transaction.aggregate({
                    _sum: { amount: true },
                    where: { status: 'succeeded' }
                }),
                prisma.transaction.aggregate({
                    _sum: { amount: true },
                    where: {
                        status: 'succeeded',
                        createdAt: { gte: thisMonthStart }
                    }
                }),
                prisma.transaction.aggregate({
                    _sum: { amount: true },
                    where: {
                        status: 'succeeded',
                        createdAt: { gte: lastMonthStart, lt: thisMonthStart }
                    }
                })
            ]);

            const totalRevenue = totalRevenueResult._sum.amount ?? 0;
            const thisMonthRevenue = thisMonthRevenueResult._sum.amount ?? 0;
            const lastMonthRevenue = lastMonthRevenueResult._sum.amount ?? 0;
            const revenueChangePct = calculateChange(thisMonthRevenue, lastMonthRevenue);

            return {
                totalRevenue,
                revenueChangePct
            };
        }, 60);

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });

    } catch (error) {
        console.error('[Admin Revenue API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch revenue' }, { status: 500 });
    }
}

