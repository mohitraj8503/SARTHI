export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// Helper to get IST date boundaries
function getISTDateBoundaries(range: 'week' | 'month') {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);

  let startDate: Date;
  const endDate = new Date(istNow);

  if (range === 'week') {
    // Last 7 days
    startDate = new Date(istNow);
    startDate.setDate(startDate.getDate() - 7);
  } else {
    // Current month
    startDate = new Date(istNow.getFullYear(), istNow.getMonth(), 1);
  }

  // Reset to start of day in IST
  startDate.setHours(0, 0, 0, 0);

  // Convert back to UTC
  return {
    startUTC: new Date(startDate.getTime() - istOffset),
    endUTC: new Date(endDate.getTime() - istOffset),
  };
}

// Helper to get day label
function getDayLabel(date: Date, range: 'week' | 'month'): string {
  if (range === 'week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  } else {
    return date.getDate().toString();
  }
}

// GET /api/admin/revenue-series - Returns revenue chart data
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get range from query params (default: week)
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get('range') === 'month' ? 'month' : 'week') as 'week' | 'month';

    const { startUTC, endUTC } = getISTDateBoundaries(range);

    // Query transactions grouped by day
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'succeeded',
        createdAt: {
          gte: startUTC,
          lte: endUTC
        }
      },
      select: {
        amount: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by day and sum amounts
    const dailyRevenue: Record<string, number> = {};

    // Initialize all days with 0
    const currentDate = new Date(startUTC);
    const end = new Date(endUTC);

    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyRevenue[dateKey] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sum up transactions by day
    transactions.forEach(tx => {
      const dateKey = tx.createdAt.toISOString().split('T')[0];
      if (dailyRevenue[dateKey] !== undefined) {
        dailyRevenue[dateKey] += tx.amount;
      }
    });

    // Convert to chart format
    const chartData = Object.entries(dailyRevenue).map(([dateStr, value]) => {
      const date = new Date(dateStr);
      return {
        label: getDayLabel(date, range),
        value: Math.round(value),
        rawDate: dateStr
      };
    });

    // Return with cache headers
    return NextResponse.json(chartData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('[Admin Revenue Series] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue series', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

