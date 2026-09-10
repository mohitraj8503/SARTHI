export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    const seminarId = params.id;

    // Parallel fetch for live data
    const [questions, polls, chatMessages, viewerCount] = await Promise.all([
      prisma.seminarQuestion.findMany({
        where: { seminarId },
        orderBy: { upvotes: 'desc' },
        take: 50
      }),
      prisma.seminarPoll.findMany({
        where: { seminarId },
        include: {
          votes: user ? { where: { userId: user.id } } : false
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.seminarChatMessage.findMany({
        where: { seminarId },
        orderBy: { createdAt: 'asc' },
        take: 100 // Last 100 messages for initial load
      }),
      prisma.liveParticipant.count({
        where: { 
            seminarId,
            lastSeen: { gte: new Date(Date.now() - 60000) } // Active in last 60s
        }
      })
    ]);

    return NextResponse.json({ 
        questions, 
        polls, 
        chatMessages, 
        viewerCount: viewerCount > 0 ? viewerCount : 1 // Always show at least 1 (the current user)
    });
  } catch (error) {
    console.error('Live data fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type } = body;
    const seminarId = params.id;

    // 1. Handle Real-time Chat
    if (type === 'CHAT_MESSAGE') {
      const { message } = body;
      if (!message?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 });

      const msg = await prisma.seminarChatMessage.create({
        data: {
          seminarId,
          userId: user.id,
          userName: user.name || 'Student',
          message: message,
        }
      });
      return NextResponse.json(msg);
    }

    // 2. Handle Live Presence (Heartbeat)
    if (type === 'HEARTBEAT') {
      const participant = await prisma.liveParticipant.upsert({
        where: { seminarId_userId: { seminarId, userId: user.id } },
        update: { lastSeen: new Date() },
        create: {
          seminarId,
          userId: user.id,
          lastSeen: new Date(),
        }
      });
      return NextResponse.json({ success: true, timestamp: participant.lastSeen });
    }

    // 3. Handle Question Submit
    if (type === 'QUESTION') {
      const { question } = body;
      const q = await prisma.seminarQuestion.create({
        data: {
          seminarId,
          userId: user.id,
          userName: user.name || 'Student',
          question: question,
        }
      });
      return NextResponse.json(q);
    }

    // 4. Handle Q&A Upvote
    if (type === 'UPVOTE' && body.questionId) {
      const q = await prisma.seminarQuestion.update({
        where: { id: body.questionId },
        data: { upvotes: { increment: 1 } },
      });
      return NextResponse.json(q);
    }

    // 5. Handle Poll Voting
    if (type === 'VOTE' && body.pollId && typeof body.optionIndex === 'number') {
      const vote = await prisma.seminarPollVote.upsert({
        where: { pollId_userId: { pollId: body.pollId, userId: user.id } },
        update: { optionIndex: body.optionIndex },
        create: {
          pollId: body.pollId,
          userId: user.id,
          optionIndex: body.optionIndex,
        },
      });
      return NextResponse.json(vote);
    }

    // --- Host Actions Section ---
    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
      select: { instructorId: true },
    });

    const isAuthorized = user.id === seminar?.instructorId || user.role === 'ADMIN';

    if (isAuthorized) {
        // Handle Answer Question
        if (type === 'ANSWER_QUESTION' && body.questionId) {
            const q = await prisma.seminarQuestion.update({
                where: { id: body.questionId },
                data: { isAnswered: true, answer: body.answer || 'Answered during live session.' },
            });
            return NextResponse.json(q);
        }

        // Handle Create Poll
        if (type === 'CREATE_POLL') {
            const poll = await prisma.seminarPoll.create({
                data: {
                    seminarId,
                    question: body.question,
                    options: body.options,
                    isActive: true,
                }
            });
            return NextResponse.json(poll);
        }
    }

    return NextResponse.json({ error: 'Instruction invalid or unauthorized' }, { status: 400 });
  } catch (error) {
    console.error('Live action error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
