import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const messageId = params.id;

    const message = await prisma.inboxMessage.update({
      where: {
        id: messageId,
        recipientId: session.userId, // Ensure only recipient can mark as read
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json({ error: 'Failed to mark message as read' }, { status: 500 });
  }
}
