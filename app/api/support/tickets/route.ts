export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: List tickets
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  try {
    const whereClause: any = {};

    // User can only see their own tickets unless they are support staff/admin
    // Type casting because User model from authorized user might differ slightly from Prisma
    const role = (user as any).role;
    const userId = (user as any).id;

    if (role !== 'ADMIN' && role !== 'SUPPORT') {
      whereClause.userId = userId;
    }

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, image: true } },
        assignedTo: { select: { name: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('[Tickets API]', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

// POST: Create ticket
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subject, description, category, priority } = body;

    if (!subject || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = (user as any).id;

    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        description,
        category,
        priority: priority || 'MEDIUM',
        userId: userId,
        status: 'OPEN',
        messages: {
          create: {
            message: description,
            userId: userId,
          },
        },
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('[Create Ticket API]', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

