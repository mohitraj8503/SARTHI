"use server";
import { prisma } from '@/lib/prisma';
import { getCurrentUser, IS_CONN_ERROR } from './index';

export async function getMessages() {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized', threads: [] };

    try {
        const threads = await prisma.thread.findMany({
            where: { members: { some: { userId: user.id } } },
            include: {
                members: {
                    include: {
                        user: { select: { id: true, name: true, image: true } }
                    }
                },
                messages: { take: 1, orderBy: { createdAt: 'desc' } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const formattedThreads = threads.map(thread => {
            const otherMember = thread.members.find(m => m.userId !== user.id)?.user;
            const lastMessage = thread.messages[0];
            return {
                id: thread.id,
                name: otherMember?.name || 'Group Chat',
                avatar: otherMember?.image,
                lastMessage: lastMessage?.content || 'No messages yet',
                time: lastMessage?.createdAt ? lastMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                unread: false,
                sender: lastMessage?.senderId === user.id ? 'You' : otherMember?.name,
                preview: lastMessage?.content || 'No messages yet'
            };
        });

        return { threads: formattedThreads };
    } catch (error) {
        if (IS_CONN_ERROR(error)) {
            console.error('SERVER_ERROR: DB connection failed in getMessages', error);
        }
        return { error: 'DB_CONNECTION_FAILED', threads: [] };
    }
}

export async function getNotifications() {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized', notifications: [] };

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return { notifications };
    } catch (error) {
        if (IS_CONN_ERROR(error)) {
            console.error('SERVER_ERROR: DB connection failed in getNotifications', error);
        }
        return { error: 'DB_CONNECTION_FAILED', notifications: [] };
    }
}

