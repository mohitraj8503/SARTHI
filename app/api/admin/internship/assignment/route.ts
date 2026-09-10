import { NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const isUserAdmin = await isAdmin();
    if (!user || !isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, difficulty, estimatedTime, xpReward, deadline, mode, memberIds } = await req.json();
    if (!title || !description || !deadline) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Find active batch to link
    const batch = await prisma.internshipBatch.findFirst({
      where: { status: 'ACTIVE' },
    });
    
    if (!batch) {
      return NextResponse.json({ error: 'No active batch found' }, { status: 404 });
    }

    const assignmentMode = mode || 'INDIVIDUAL';

    const assignment = await prisma.internshipAssignment.create({
      data: {
        batchId: batch.id,
        title,
        description,
        category: category || 'Daily Assignment',
        difficulty: difficulty || 'Intermediate',
        estimatedTime: estimatedTime || '2 Hours',
        xpReward: xpReward || 100,
        deadline: new Date(deadline),
        mode: assignmentMode,
      },
    });

    // Determine target members
    let targetMembers: { id: string; userId: string }[] = [];
    if (assignmentMode === 'BATCH') {
      targetMembers = await prisma.batchMember.findMany({
        where: { batchId: batch.id, status: 'ACTIVE' },
        select: { id: true, userId: true },
      });
    } else if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      targetMembers = await prisma.batchMember.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, userId: true },
      });
    }

    // Create recipients records and send notifications
    if (targetMembers.length > 0) {
      await prisma.internshipAssignmentRecipient.createMany({
        data: targetMembers.map(m => ({
          assignmentId: assignment.id,
          memberId: m.id,
        })),
      });

      // Send notifications to each assigned user
      for (const target of targetMembers) {
        await prisma.notification.create({
          data: {
            userId: target.userId,
            title: 'New Assignment Assigned 📋',
            body: `You have been assigned a new task: "${title}".`,
            message: `Please complete and submit: "${title}". XP Reward: ${xpReward || 100} XP.`,
            type: 'SYSTEM',
          },
        });
      }
    }

    return NextResponse.json(assignment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create assignment' }, { status: 500 });
  }
}
