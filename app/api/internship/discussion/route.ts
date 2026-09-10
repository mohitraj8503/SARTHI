import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canAccessDiscussion } from '@/lib/auth/internshipAuthorization';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');
    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing assignmentId' }, { status: 400 });
    }

    // Central Auth validation
    const isAuthorized = await canAccessDiscussion(user, assignmentId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.internshipDiscussion.findMany({
      where: { assignmentId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId, message, parentId } = await req.json();
    if (!assignmentId || !message) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Central Auth validation
    const isAuthorized = await canAccessDiscussion(user, assignmentId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newMessage = await prisma.internshipDiscussion.create({
      data: {
        assignmentId,
        userId: user.id,
        userName: user.name || 'Anonymous Intern',
        message,
        parentId,
      },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}
