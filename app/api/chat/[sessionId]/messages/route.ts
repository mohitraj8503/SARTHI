import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function GET(req: NextRequest, props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await prisma.liveSessionMessage.findMany({
      where: {
        sessionId: params.sessionId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 100, // Last 100 messages
    })

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId || 'system',
      senderName: msg.senderName || 'System',
      senderAvatar: undefined,
      timestamp: msg.createdAt,
      messageType: 'TEXT',
      reactions: {},
      isEdited: msg.isEdited,
      isDeleted: msg.isDeleted,
      parentId: undefined,
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
