export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message, isInternal } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    const isAdminOrSupport = user.role === 'ADMIN' || user.role === 'SUPPORT';

    if (!isAdminOrSupport && ticket.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only staff can leave internal notes
    if (isInternal && !isAdminOrSupport) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        userId: user.id,
        message,
        isInternal: isInternal || false,
      },
    });

    // If user replies, re-open ticket if it was resolved
    if (!isAdminOrSupport && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')) {
      await prisma.supportTicket.update({
        where: { id: params.id },
        data: { status: 'OPEN' },
      });
    }

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('[Ticket Message API]', error);
    return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
  }
}
