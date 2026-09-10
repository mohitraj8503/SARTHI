export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true, image: true, role: true } },
        assignedTo: { select: { name: true, email: true } },
        messages: {
          include: {
            user: { select: { name: true, image: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Access control: Admin/Support or Ticket Owner
    if (user.role !== 'ADMIN' && user.role !== 'SUPPORT' && ticket.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('[Ticket Detail API]', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only Admin/Support can update status/assignment
  // Actually users might be able to 'CLOSE' their own ticket? Let's allow that.

  try {
    const body = await request.json();
    const { status, priority, assignedToId } = body;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isAdminOrSupport = user.role === 'ADMIN' || user.role === 'SUPPORT';
    const isOwner = ticket.userId === user.id;

    if (!isAdminOrSupport && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data: any = {};

    if (status) {
      // Owner can only close
      if (isOwner && !isAdminOrSupport && status !== 'CLOSED') {
        return NextResponse.json({ error: 'You can only close tickets' }, { status: 403 });
      }
      data.status = status;
    }

    if (isAdminOrSupport) {
      if (priority) data.priority = priority;
      if (assignedToId) data.assignedToId = assignedToId;
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('[Update Ticket API]', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
