export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';
import { createAdminNotification } from '@/lib/admin/notifications';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = request.cookies;
    const token = cookieStore.get('tt_session')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const session = await validateSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ message: 'Session expired' }, { status: 401 });
    }

    const userId = payload.userId;

    const { receiverId, content } = await request.json();

    // Validation
    if (!receiverId || !content) {
      return NextResponse.json(
        { message: 'Receiver ID and message content are required' },
        { status: 400 }
      );
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ message: 'Message content cannot be empty' }, { status: 400 });
    }

    if (receiverId === userId) {
      return NextResponse.json({ message: 'Cannot send message to yourself' }, { status: 400 });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true, email: true },
    });

    if (!receiver) {
      return NextResponse.json({ message: 'Receiver not found' }, { status: 404 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Check if sender is STUDENT and receiver is TEACHER or INSTRUCTOR
    if (message.sender.role === 'STUDENT' && message.receiver && (message.receiver.role === 'TEACHER' || message.receiver.role === 'INSTRUCTOR')) {
      await createAdminNotification({
        title: 'New Student Message',
        body: `Student ${message.sender.name} sent a message to ${message.receiver?.name}: "${content.trim()}"`,
        type: 'student_message',
        meta: {
          senderId: message.senderId,
          receiverId: message.receiverId,
          messageId: message.id,
        },
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

