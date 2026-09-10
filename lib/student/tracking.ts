import { prisma } from '@/lib/prisma';
import { startOfDay } from 'date-fns';

export class StudentTracking {
  /**
   * Logs a learning session and potentially unlocks achievements
   */
  static async logSession(userId: string, courseId: string | null, type: string, durationSec: number) {
    // 1. Create Learning Session
    await prisma.learningSession.create({
      data: {
        userId,
        courseId,
        type,
        durationSec,
        date: startOfDay(new Date()),
      },
    });

    // 2. XP Logic (Sample: 1 XP per minute)
    const xpGain = Math.floor(durationSec / 60);
    if (xpGain > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalPoints: { increment: xpGain } }
      });
    }

    // 3. Achievement logic can go here (e.g. check for first session)
  }

  /**
   * Handle enrollment-specific events
   */
  static async onEnroll(userId: string, courseId: string) {
    console.log(`[Tracking] Student ${userId} enrolled in ${courseId}`);
    // 1. Notify student
    await prisma.notification.create({
      data: {
        userId,
        title: 'Enrollment Confirmed!',
        body: `You have successfully enrolled in the course. Start learning now!`,
        type: 'ENROLLMENT_SUCCESS'
      }
    });

    // 2. Achievement check
    const enrollmentCount = await prisma.enrollment.count({ where: { userId } });
    if (enrollmentCount === 1) {
      // Unlock "First Steps" achievement
      const achievement = await prisma.achievement.findFirst({ where: { condition: 'first_enrollment' } });
      if (achievement) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: achievement.id } },
          create: { userId, achievementId: achievement.id },
          update: {}
        });
      }
    }
  }

  /**
   * Handle assignment submission events
   */
  static async onAssignmentSubmit(userId: string, assignmentId: string) {
    console.log(`[Tracking] Student ${userId} submitted assignment ${assignmentId}`);
    await prisma.notification.create({
      data: {
        userId,
        title: 'Assignment Submitted',
        body: 'Your assignment has been submitted successfully and is awaiting grading.',
        type: 'ASSIGNMENT_SUBMITTED'
      }
    });
  }
}
