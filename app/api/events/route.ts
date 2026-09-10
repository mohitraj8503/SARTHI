export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { logEvent, AnalyticsEvent } from '@/lib/events';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Basic Auth Check (optional: depends on if public events like 'page_view' are allowed)
    // For specific student actions, we ideally verify the user.
    const session = await getCurrentUser();
    if (!session || !session.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { type, courseId, instructorId, meta } = body;
    const userId = session.id;

    if (!type) {
      return new NextResponse('Missing event type', { status: 400 });
    }

    const event: AnalyticsEvent = {
      type,
      userId: userId, // or from session.user.id
      courseId,
      instructorId,
      meta,
      timestamp: new Date(),
    };

    // Asynchronously log without blocking? 
    // For Vercel, we must await.
    await logEvent(event);

    return NextResponse.json({ success: true, eventId: 'evt_' + Date.now() }, { status: 202 });
  } catch (error) {
    console.error('[API] Events Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

