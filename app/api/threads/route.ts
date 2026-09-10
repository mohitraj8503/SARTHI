export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
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

        // Auto-sync: Ensure threads exist for all enrolled course instructors
        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId: userId,
                status: 'active',
            },
            include: {
                course: {
                    select: {
                        instructorId: true,
                    },
                },
            },
        });

        const instructorIds = [...new Set(enrollments.map(e => e.course.instructorId))];

        // For each instructor, check if we have a DM thread
        for (const instructorId of instructorIds) {
            if (instructorId === userId) continue; // Don't create thread with self

            const existingThread = await prisma.thread.findFirst({
                where: {
                    type: 'DM',
                    AND: [
                        { members: { some: { userId: userId } } },
                        { members: { some: { userId: instructorId } } },
                    ],
                },
            });

            if (!existingThread) {
                await prisma.thread.create({
                    data: {
                        type: 'DM',
                        members: {
                            create: [
                                { userId: userId, role: 'STUDENT' }, // Assuming role field exists or just string
                                { userId: instructorId, role: 'TEACHER' },
                            ],
                        },
                        messages: {
                            create: {
                                senderId: instructorId,
                                content: "Welcome to the course! Feel free to ask any questions here.",
                                createdAt: new Date(),
                            }
                        }
                    },
                });
            }
        }

        // Get threads for the user with unread count
        const threads = await prisma.thread.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                avatar_url: true,
                                role: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                isRead: false,
                                senderId: { not: userId }
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Format threads for frontend
        const formattedThreads = threads.map((thread) => {
            const otherMembers = thread.members.filter((m) => m.userId !== userId);
            const otherMember = otherMembers[0]?.user; // For DM, simpler logic
            const lastMessage = thread.messages[0];

            return {
                id: thread.id,
                type: thread.type,
                updatedAt: thread.updatedAt,
                name: thread.type === 'DM' ? otherMember?.name || 'Unknown User' : 'Group Chat',
                avatar: thread.type === 'DM' ? otherMember?.avatar_url || otherMember?.image : null,
                otherUserId: otherMember?.id,
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    senderId: lastMessage.senderId,
                    isRead: lastMessage.isRead,
                } : null,
                unreadCount: thread._count.messages,
            };
        });

        return NextResponse.json(formattedThreads);
    } catch (error) {
        console.error('Error fetching threads:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

