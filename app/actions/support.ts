'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  return { id: session.userId, role: session.role };
}

export async function getSupportTickets() {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    return tickets.map(t => ({
      id: t.id,
      subject: t.subject,
      description: t.description,
      category: t.category,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
      lastUpdate: t.updatedAt
    }));
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return [];
  }
}

