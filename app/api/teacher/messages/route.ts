import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get('recipient_id');

    const messages = await prisma.inboxMessage.findMany({
      where: {
        OR: [
          { senderId: session.userId, recipientId: recipientId || undefined },
          { senderId: recipientId || undefined, recipientId: session.userId },
        ],
      },
      orderBy: { sentAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, image: true, avatar_url: true } },
        recipient: { select: { id: true, name: true, image: true, avatar_url: true } },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientId, courseId, subject, body: messageBody } = body;

    if (!recipientId || !subject || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message = await prisma.inboxMessage.create({
      data: {
        senderId: session.userId,
        recipientId,
        courseId,
        subject,
        body: messageBody,
      },
      include: {
        sender: { select: { id: true, name: true, image: true, avatar_url: true } },
        recipient: { select: { id: true, name: true, image: true, avatar_url: true } },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

