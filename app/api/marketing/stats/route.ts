import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getMarketingDashboardData } from '@/lib/services/marketing.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getMarketingDashboardData(user.id);
    if (!data) {
      return NextResponse.json({ success: false, error: 'Marketing profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('Error fetching marketing stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
