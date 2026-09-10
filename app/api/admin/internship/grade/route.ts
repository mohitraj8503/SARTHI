import { NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/lib/services/internship.service';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const isUserAdmin = await isAdmin();
    if (!user || !isUserAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { submissionId, status, rating, publicFeedback, privateNotes } = await req.json();
    if (!submissionId || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Get submission
    const submission = await prisma.internshipSubmission.findUnique({
      where: { id: submissionId },
      include: {
        member: {
          include: {
            submissions: true,
            badges: true,
          },
        },
        assignment: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // 2. Create feedback
    await prisma.mentorFeedback.create({
      data: {
        submissionId,
        rating: rating || 5,
        publicFeedback,
        privateNotes,
      },
    });

    // 3. If approved, add XP and update level
    if (status === 'Approved' && submission.status !== 'Approved') {
      const xpAmount = submission.assignment.xpReward;

      // Create XP Transaction
      await prisma.xpTransaction.create({
        data: {
          memberId: submission.memberId,
          amount: xpAmount,
          description: `Assignment Approved: ${submission.assignment.title}`,
        },
      });

      // Update XP & level using config settings
      const settings = await prisma.internshipSettings.findFirst() || { levelThresholds: "500,1200,2200" };
      const newXp = submission.member.currentXp + xpAmount;
      const newLevel = calculateLevel(newXp, settings.levelThresholds);

      await prisma.batchMember.update({
        where: { id: submission.memberId },
        data: {
          currentXp: newXp,
          currentLevel: newLevel,
        },
      });

      // Check badges (e.g. "First Submission")
      const firstSubmissionBadge = submission.member.badges.find(b => b.name === 'First Submission');
      if (!firstSubmissionBadge) {
        await prisma.internshipBadge.create({
          data: {
            memberId: submission.memberId,
            name: 'First Submission',
            description: 'Successfully completed and approved your first internship assignment!',
            icon: 'Award',
          },
        });
      }

      // Check for Level up badge
      if (newLevel > submission.member.currentLevel) {
        await prisma.internshipBadge.create({
          data: {
            memberId: submission.memberId,
            name: `Level ${newLevel} Club`,
            description: `Leveled up to Level ${newLevel}!`,
            icon: 'Zap',
          },
        });
      }

      // Create notification
      await prisma.notification.create({
        data: {
          userId: submission.member.userId,
          title: 'Assignment Approved 🎉',
          message: `Your submission for "${submission.assignment.title}" has been approved! You earned +${xpAmount} XP.`,
          type: 'SYSTEM',
        },
      });
    } else if (status === 'Rejected' || status === 'Needs Changes') {
      await prisma.notification.create({
        data: {
          userId: submission.member.userId,
          title: `Assignment Status: ${status} ⚠️`,
          message: `Your submission for "${submission.assignment.title}" was reviewed. Please check feedback and resubmit.`,
          type: 'SYSTEM',
        },
      });
    }

    // 4. Update status
    const updatedSubmission = await prisma.internshipSubmission.update({
      where: { id: submissionId },
      data: { status },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error: any) {
    console.error('Grading error:', error);
    return NextResponse.json({ error: error.message || 'Failed to grade submission' }, { status: 500 });
  }
}
