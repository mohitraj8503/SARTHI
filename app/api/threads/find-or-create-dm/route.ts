export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';

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

        const { otherUserId } = await request.json();

        if (!otherUserId) {
            return NextResponse.json({ message: 'Other User ID is required' }, { status: 400 });
        }

        // Check if DM thread already exists
        // Find a thread where type is DM and has both members
        const existingThreads = await prisma.thread.findMany({
            where: {
                type: 'DM',
                AND: [
                    {
                        members: {
                            some: {
                                userId: userId
                            }
                        }
                    },
                    {
                        members: {
                            some: {
                                userId: otherUserId
                            }
                        }
                    }
                ]
            }
        });

        if (existingThreads.length > 0) {
            return NextResponse.json({ threadId: existingThreads[0].id });
        }

        // Create new DM thread
        const newThread = await prisma.thread.create({
            data: {
                type: 'DM',
                members: {
                    create: [
                        { userId: userId },
                        { userId: otherUserId }
                    ]
                }
            }
        });

        return NextResponse.json({ threadId: newThread.id });

    } catch (error) {
        console.error('Error finding or creating DM:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

