export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/leaderboard/rankings - Get user rankings based on real XP
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get or create UserStreak records for all users
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['STUDENT', 'student'] },
      },
      select: {
        id: true,
        name: true,
        image: true,
        avatar_url: true,
        grade: true,
        lastActive: true,
        enrollments: {
          include: {
            progress: true,
          },
        },
        submissions: {
          where: {
            status: { in: ['graded', 'completed'] },
          },
        },
        streak: true,
      },
    });

    // Calculate XP for each user and update/create streaks
    const rankings = await Promise.all(
      users.map(async (user) => {
        // Calculate total lessons completed
        const completedLessons = user.enrollments.reduce(
          (sum, enrollment) => sum + enrollment.progress.filter((p) => p.completed).length,
          0
        );

        // Calculate total submissions
        const totalSubmissions = user.submissions.length;

        // Calculate XP: 10 XP per lesson + 25 XP per submission
        const totalXP = completedLessons * 10 + totalSubmissions * 25;

        // Calculate streak (simplified: current active days)
        const lastActiveDate = user.lastActive || new Date();
        const daysSinceLastActive = Math.floor(
          (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const currentStreak = daysSinceLastActive === 0 ? 1 : 0;

        // Update or create UserStreak
        const streak = await prisma.userStreak.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            totalXP,
            currentStreak,
            longestStreak: currentStreak,
            lastActiveDate,
          },
          update: {
            totalXP,
            currentStreak: Math.max(currentStreak, user.streak?.currentStreak || 0),
            longestStreak: Math.max(currentStreak, user.streak?.longestStreak || 0),
          },
        });

        return {
          id: user.id,
          name: user.name || 'Unknown',
          avatarUrl: user.image || user.avatar_url || '/avatar.png',
          grade: user.grade,
          totalPoints: totalXP,
          xp: totalXP,
          streak: streak.currentStreak,
          longestStreak: streak.longestStreak,
        };
      })
    );

    // Sort by XP and add rankings
    const sortedRankings = rankings
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    // Find current user's rank
    const currentUserId = session.id;
    const currentUserRank = rankings.findIndex((r) => r.id === currentUserId) + 1;

    return NextResponse.json({
      leaderboard: sortedRankings,
      currentUserRank: currentUserRank > 0 ? currentUserRank : null,
      total: rankings.length,
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: error.message },
      { status: 500 }
    );
  }
}

