export const dynamic = 'force-dynamic'
import { processScheduledReminders } from '@/lib/notifications/orchestrator'
import { NextResponse } from 'next/server'


export async function GET(req: Request) {
  // Security: verify cron secret
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    await processScheduledReminders()
    return NextResponse.json({ success: true, timestamp: new Date() })
  } catch (error: any) {
    console.error('[Cron] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

