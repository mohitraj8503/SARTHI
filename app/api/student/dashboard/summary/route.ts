export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardSummary, getStudentDashboardData } from '@/lib/services/dashboard';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const phase = searchParams.get('phase') || 'summary';

  try {
    if (phase === 'summary') {
      const summary = await getDashboardSummary(user.id, user);
      return NextResponse.json(summary);
    } else {
      const fullData = await getStudentDashboardData(user.id, user);
      return NextResponse.json(fullData);
    }
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
