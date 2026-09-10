import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { findSessionByAnyIdCached } from '@/lib/cache/session-cache';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    // Robust lookup using utility
    const sessionMatch = await findSessionByAnyIdCached(roomId);

    if (!sessionMatch) {
      return NextResponse.json({ success: true, messages: [] });
    }

    // Resolve LiveSession ID
    let liveSessionId: string | null = null;
    if (sessionMatch.type === 'liveSession') {
      liveSessionId = (sessionMatch.data as any).id;
    } else {
      const liveSession = await prisma.liveSession.findFirst({
        where: { 
          OR: [
            { lessonId: (sessionMatch.data as any).id },
            { roomId: roomId }
          ]
        },
        select: { id: true }
      });
      liveSessionId = liveSession?.id || null;
    }

    if (!liveSessionId) {
      return NextResponse.json({ success: true, messages: [] });
    }

    const messages = await prisma.liveSessionMessage.findMany({
      where: { sessionId: liveSessionId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, content, senderName, senderRole } = await req.json();

    if (!roomId || !content) {
      return NextResponse.json({ error: 'roomId and content are required' }, { status: 400 });
    }

    // Robust lookup using utility
    const sessionMatch = await findSessionByAnyId(roomId);

    if (!sessionMatch) {
      return NextResponse.json({ error: 'Live session not found' }, { status: 404 });
    }

    // Resolve LiveSession ID
    let liveSessionId: string | null = null;
    if (sessionMatch.type === 'liveSession') {
      liveSessionId = (sessionMatch.data as any).id;
    } else {
      const liveSession = await prisma.liveSession.findFirst({
        where: { 
          OR: [
            { lessonId: (sessionMatch.data as any).id },
            { roomId: roomId }
          ]
        },
        select: { id: true }
      });
      liveSessionId = liveSession?.id || null;
    }

    if (!liveSessionId) {
      return NextResponse.json({ error: 'Live session not found' }, { status: 404 });
    }

    // Determine role (teacher vs student) for UI formatting
    const finalRole = session.role === 'TEACHER' || session.role === 'ADMIN' ? 'teacher' : (senderRole || 'student');
    const finalName = senderName || session.name || 'User';

    const message = await prisma.liveSessionMessage.create({
      data: {
        sessionId: liveSessionId,
        senderId: session.userId,
        senderName: finalName,
        senderRole: finalRole,
        content: content
      }
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Error saving chat message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

