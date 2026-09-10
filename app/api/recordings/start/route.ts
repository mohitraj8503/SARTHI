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

    const { sessionId, courseId, instructorId, title } = await req.json()

    // 1. Get or create teacher profile id
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId },
    })
    
    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // 2. Start LiveKit composite recording
    const egressId = await livekit.startRoomRecording(sessionId)

    // 3. Create database recording record mapped to Prisma schema fields
    const recording = await prisma.recording.create({
      data: {
        title: title || `${sessionId} Recording`,
        sessionId,
        courseId,
        teacherId: teacher.id,
        egressId,
        status: 'processing',
      },
    })

    return NextResponse.json({ 
      success: true, 
      recordingId: recording.id,
      egressId: egressId
    })
  } catch (error: any) {
    console.error('Recording start error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to start recording' }, { status: 500 })
  }
}
