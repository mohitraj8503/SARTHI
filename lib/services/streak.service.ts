import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * Streak Service
 * Handles calculation of user learning streaks based on LearningSessions.
 */
export class StreakService {
  /**
   * Calculate the current streak for a user.
   * @param userId The ID of the user.
   * @param timezone The user's timezone (defaults to Asia/Kolkata).
   */
  static async getUserStreak(userId?: string, timezone: string = 'Asia/Kolkata'): Promise<{ currentStreak: number; lastActivityDate: Date | null }> {
    let targetUserId = userId;

    if (!targetUserId) {
      const user = await getCurrentUser();
      if (!user) return { currentStreak: 0, lastActivityDate: null };
      targetUserId = user.id;
    }

    const streak = await prisma.userStreak.findUnique({
      where: { userId: targetUserId },
      select: { currentStreak: true, lastActiveDate: true }
    });

    if (!streak) {
      return {
        currentStreak: 0,
        lastActivityDate: null
      };
    }

    // Check if the streak was broken (last active more than 1 day ago in user's timezone)
    const now = new Date();
    const userNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    userNow.setHours(0, 0, 0, 0);
    
    const lastActive = new Date(streak.lastActiveDate);
    const userLastActive = new Date(lastActive.toLocaleString('en-US', { timeZone: timezone }));
    userLastActive.setHours(0, 0, 0, 0);

    const diff = Math.floor((userNow.getTime() - userLastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    // If diff > 1, the streak is technically broken but not yet updated in DB
    // (the update happens on next session). For UI, we should show current status.
    const effectiveStreak = diff > 1 ? 0 : streak.currentStreak;

    return {
      currentStreak: effectiveStreak,
      lastActivityDate: streak.lastActiveDate
    };
  }
}
