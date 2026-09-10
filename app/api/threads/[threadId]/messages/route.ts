export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';

// GET Messages
export async function GET(request: NextRequest, props: { params: Promise<{ threadId: string }> }) {
    const params = await props.params;
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

        const { threadId } = params;

        // Check if user is member of thread
        const membership = await prisma.threadMember.findUnique({
            where: {
                threadId_userId: {
                    threadId,
                    userId: userId,
                },
            },
        });

        if (!membership) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // Get cursor for pagination
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');

        const messages = await prisma.message.findMany({
            where: {
                threadId,
            },
            take: 20,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
                createdAt: 'desc', // Recent first
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        avatar_url: true, // Consistent with schema
                    },
                },
            },
        });

        // Reverse messages to show oldest first in chat view (standard UX)
        // Or handle reversal in frontend. Frontend usually expects recent at bottom.
        // If we fetch desc, index 0 is newest. Frontend should reverse.

        return NextResponse.json({
            messages,
            nextCursor: messages.length === 20 ? messages[messages.length - 1].id : null,
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST Message (Send)
export async function POST(request: NextRequest, props: { params: Promise<{ threadId: string }> }) {
    const params = await props.params;
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

        const { threadId } = params;
        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ message: 'Message cannot be empty' }, { status: 400 });
        }

        // Check membership
        const membership = await prisma.threadMember.findUnique({
            where: {
                threadId_userId: {
                    threadId,
                    userId: userId,
                },
            },
        });

        if (!membership) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                threadId,
                senderId: userId,
                content: content.trim(),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        avatar_url: true,
                    },
                },
            },
        });

        // Update thread updatedAt
        await prisma.thread.update({
            where: { id: threadId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json(message);

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
