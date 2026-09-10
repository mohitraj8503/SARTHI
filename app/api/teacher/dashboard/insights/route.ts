import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getInstructorInsights } from '@/lib/agent/insights';
import { cacheData } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = user.id;

    const insights = await cacheData(
      `dashboard:insights:${userId}`,
      async () => {
        return await getInstructorInsights(userId);
      },
      300 // 5 minutes cache for AI insights as they are expensive and don't change often
    );

    return NextResponse.json(insights, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('[Dashboard Insights] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

