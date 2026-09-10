import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { performCheckIn } from '@/lib/services/internship.service';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if ((user as any).platformSegment !== 'MAIN') {
      return NextResponse.json({ error: 'Internship check-in is restricted to Main platform members.' }, { status: 403 });
    }

    const { memberId } = await req.json();
    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    const result = await performCheckIn(memberId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: error.message || 'Check-in failed' }, { status: 500 });
  }
}
