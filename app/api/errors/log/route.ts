import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, stack, componentStack, timestamp, userAgent, url, userId } = body;

    console.error('[CLIENT_ERROR_LOG]', {
      timestamp: timestamp || new Date().toISOString(),
      url,
      userId,
      message,
      stack,
      componentStack,
      userAgent
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[CLIENT_ERROR_LOG_FAILED]', err);
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}
