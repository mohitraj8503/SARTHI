export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { cacheData } from '@/lib/redis';

export async function GET(req: NextRequest) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') === 'week' ? 'week' : 'month';

        const cacheKey = `admin:dashboard:revenue-graph:${range}`;

        const chartData = await cacheData(cacheKey, async () => {
            const limit = range === 'week' ? 7 : 30;

            // Note column names use quotes to preserve casing in PostgreSQL
            const result = await prisma.$queryRaw<Array<{ raw_date: Date | string, total_amount: number }>>`
        SELECT DATE(createdAt) as raw_date, SUM(amount) as total_amount
        FROM transactions 
        WHERE status = 'succeeded' 
          AND createdAt >= DATE_SUB(CURDATE(), INTERVAL ${limit} DAY)
        GROUP BY DATE(createdAt)
        ORDER BY DATE(createdAt) ASC
      `;

            const days: Array<{ label: string; value: number; rawDate: string }> = [];
            const dataMap = new Map();

            result.forEach(row => {
                const d = new Date(row.raw_date);
                const key = d.toISOString().split('T')[0];
                dataMap.set(key, Number(row.total_amount) || 0);
            });

            const today = new Date();
            if (range === 'week') {
                const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(today.getDate() - i);
                    const key = d.toISOString().split('T')[0];
                    days.push({
                        label: weekdays[d.getDay()],
                        value: dataMap.get(key) || 0,
                        rawDate: key
                    });
                }
            } else {
                for (let i = 29; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(today.getDate() - i);
                    const key = d.toISOString().split('T')[0];
                    days.push({
                        label: d.getDate().toString(),
                        value: dataMap.get(key) || 0,
                        rawDate: key
                    });
                }
            }

            return days;
        }, 60);

        return ApiResponse.success(chartData);
    } catch (error: any) {
        return handleApiError(error);
    }
}

