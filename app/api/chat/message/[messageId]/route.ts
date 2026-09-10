import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth/session'

export async function DELETE(req: NextRequest, props: { params: Promise<{ messageId: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only teachers or admins can delete messages
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId }
    })

    if (!teacher && session.role !== 'TEACHER' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only teachers can moderate chat' }, { status: 403 })
    }

    await prisma.liveSessionMessage.update({
      where: { id: params.messageId },
      data: {
        isDeleted: true,
        content: 'Message deleted',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
