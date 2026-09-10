// app/api/email-worker/route.ts
import { NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email/queue';

export async function POST(req: Request) {
    // Basic security: Check for an internal secret or CRON header
    // In production, you'd use a more robust check or Vercel's internal headers
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const result = await processEmailQueue();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// For manual triggers or simple GET-based cron
export async function GET(req: Request) {
    return POST(req);
}

