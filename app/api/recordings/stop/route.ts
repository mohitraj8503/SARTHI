import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'
import { livekit } from '@/lib/livekit'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'TEACHER' && session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, duration } = await req.json()

    // 1. Fetch recording record from database to retrieve egressId
    const recording = await prisma.recording.findFirst({
      where: {
        sessionId: sessionId,
        status: 'processing'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (recording && recording.egressId) {
      try {
        const egressClient = livekit.getEgressClient()
        await egressClient.stopEgress(recording.egressId)
      } catch (err: any) {
        console.warn('LiveKit egress stop warning (it might already be stopping or stopped):', err)
      }

      // 2. Update database record with final metadata details
      await prisma.recording.update({
        where: { id: recording.id },
        data: {
          duration: duration ? Math.round(duration) : undefined,
          status: 'processing' // will transition to 'completed' via the LiveKit webhook
        }
      })
    } else {
      // In case we don't find it, we can fallback to update status based on sessionId
      await prisma.recording.updateMany({
        where: {
          sessionId: sessionId,
          status: 'processing'
        },
        data: {
          duration: duration ? Math.round(duration) : undefined,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Recording stop error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to stop recording' }, { status: 500 })
  }
}
