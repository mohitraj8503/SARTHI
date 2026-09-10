import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  // In production, you would want to secure this endpoint (e.g. via a secret key header)
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const now = new Date();
    
    // 1. Transition 'scheduled' sessions to 'pre_live' 15 minutes before start
    const preLiveThreshold = new Date(now.getTime() + 15 * 60000);
    const toPreLive = await prisma.liveSession.findMany({
      where: {
        status: 'scheduled',
        startTime: {
          lte: preLiveThreshold,
          gte: now
        }
      }
    });

    for (const session of toPreLive) {
      await prisma.liveSession.update({
        where: { id: session.id },
        data: { status: 'pre_live' }
      });
      // Future enhancement: Notify teacher/students
    }

    // 2. Transition 'pre_live' to 'no_show' if 30 mins past start and actualStart is null
    const noShowThreshold = new Date(now.getTime() - 30 * 60000);
    const toNoShow = await prisma.liveSession.findMany({
      where: {
        status: 'pre_live',
        startTime: {
          lt: noShowThreshold
        },
        actualStart: null
      }
    });

    for (const session of toNoShow) {
      await prisma.liveSession.update({
        where: { id: session.id },
        data: { 
          status: 'no_show',
          cancelledAt: now,
          cancelReason: 'Teacher No Show'
        }
      });
    }

    // 3. Auto-complete 'live' sessions that have far exceeded their end time (fallback)
    const autoCompleteThreshold = new Date(now.getTime() - 120 * 60000); // 2 hours past end
    const toComplete = await prisma.liveSession.findMany({
      where: {
        status: 'live',
        endTime: {
          lt: autoCompleteThreshold
        }
      }
    });

    for (const session of toComplete) {
      await prisma.liveSession.update({
        where: { id: session.id },
        data: { 
          status: 'completed',
          actualEnd: now 
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      processed: {
        toPreLive: toPreLive.length,
        toNoShow: toNoShow.length,
        toComplete: toComplete.length
      }
    });

  } catch (error) {
    console.error('[CRON_LIVE_SESSIONS]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

