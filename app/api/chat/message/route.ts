import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, content, senderId } = await req.json()

    // Determine roles for database fields
    const senderRole = session.role === 'TEACHER' || session.role === 'ADMIN' ? 'teacher' : 'student'
    const senderName = session.name || 'Anonymous'

    const message = await prisma.liveSessionMessage.create({
      data: {
        content,
        sessionId: sessionId,
        senderId: senderId || session.userId,
        senderName: senderName,
        senderRole: senderRole,
      }
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Failed to save message:', error)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}
