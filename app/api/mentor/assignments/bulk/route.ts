import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendTransactionalEmail } from '@/lib/email/send';
import { getAssignmentEmailHtml } from '@/lib/email/templates/assignment-email';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (user.role as string)?.toUpperCase() || '';
    const isAuthorized = ['MENTOR', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(role);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      memberIds = [],
      internIds = [],
      title,
      description,
      category = 'Daily Assignment',
      difficulty = 'Intermediate',
      estimatedTime = '2 Hours',
      xpReward = 100,
      deadline,
      scheduled = false,
      releaseAt,
    } = body;

    const targetMemberIds: string[] = Array.from(
      new Set([...(Array.isArray(memberIds) ? memberIds : []), ...(Array.isArray(internIds) ? internIds : [])])
    ).filter(Boolean);

    if (targetMemberIds.length === 0) {
      return NextResponse.json({ error: 'No interns selected for assignment.' }, { status: 400 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Assignment title is required.' }, { status: 400 });
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Assignment description is required.' }, { status: 400 });
    }

    if (!deadline) {
      return NextResponse.json({ error: 'Deadline date is required.' }, { status: 400 });
    }

    // Validate members & get their batch IDs
    const members = await prisma.batchMember.findMany({
      where: { id: { in: targetMemberIds } },
      select: {
        id: true,
        batchId: true,
        userId: true,
        user: { select: { email: true, name: true } },
      },
    });

    if (members.length === 0) {
      return NextResponse.json({ error: 'Selected interns not found in database.' }, { status: 404 });
    }

    const batchId = members[0].batchId;
    const isScheduled = Boolean(scheduled && releaseAt);
    const parsedReleaseAt = isScheduled && releaseAt ? new Date(releaseAt) : null;
    const parsedDeadline = new Date(deadline);

    if (isScheduled && parsedReleaseAt && parsedReleaseAt >= parsedDeadline) {
      return NextResponse.json({ error: 'Deadline date must be after the scheduled release date.' }, { status: 400 });
    }

    // Create InternshipAssignment and recipients in a Prisma transaction
    const assignment = await prisma.$transaction(async (tx) => {
      const createdAssignment = await tx.internshipAssignment.create({
        data: {
          batchId: batchId,
          title: title.trim(),
          description: description.trim(),
          category: category,
          difficulty: difficulty,
          estimatedTime: estimatedTime,
          xpReward: Number(xpReward),
          deadline: parsedDeadline,
          mode: targetMemberIds.length > 1 ? 'MULTI' : 'INDIVIDUAL',
          status: isScheduled ? 'scheduled' : 'active',
          releaseAt: parsedReleaseAt,
        },
      });

      await tx.internshipAssignmentRecipient.createMany({
        data: members.map((m) => ({
          assignmentId: createdAssignment.id,
          memberId: m.id,
        })),
        skipDuplicates: true,
      });

      // If not scheduled, create notifications immediately
      if (!isScheduled) {
        await tx.notification.createMany({
          data: members.map((m) => ({
            userId: m.userId,
            title: 'New Assignment Assigned 📋',
            body: `You have been assigned a new task: "${title.trim()}".`,
            message: `Please complete and submit: "${title.trim()}". XP Reward: ${xpReward} XP.`,
            type: 'SYSTEM',
          })),
        });
      }

      return createdAssignment;
    });

    // If not scheduled, send branded emails immediately
    let emailsSentCount = 0;
    if (!isScheduled) {
      const formattedDeadline = parsedDeadline.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' (IST)';

      for (const member of members) {
        if (member.user?.email) {
          const emailHtml = getAssignmentEmailHtml({
            recipientName: member.user.name || 'Intern',
            assignmentTitle: title.trim(),
            category: category,
            difficulty: difficulty,
            xpReward: Number(xpReward),
            description: description.trim(),
            deadlineFormatted: formattedDeadline,
          });

          sendTransactionalEmail({
            to: member.user.email,
            subject: `New Assignment: ${title.trim()}`,
            html: emailHtml,
            type: 'notification',
            provider: 'resend',
          }).catch((err) => {
            console.error(`[BulkAssignmentAPI] Failed to email ${member.user?.email}:`, err.message);
          });

          emailsSentCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: assignment,
      assignedCount: members.length,
      isScheduled: isScheduled,
      releaseAt: parsedReleaseAt,
      emailsDispatched: emailsSentCount,
      message: isScheduled
        ? `Assignment scheduled for ${parsedReleaseAt?.toLocaleString('en-IN')}`
        : `Assignment published and sent to ${members.length} intern(s).`,
    });
  } catch (error: any) {
    console.error('[API/Mentor/Assignments/Bulk] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create bulk assignment' }, { status: 500 });
  }
}
