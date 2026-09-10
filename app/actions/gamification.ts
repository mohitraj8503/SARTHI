'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

async function getCurrentUserId() {
    const session = await getSession();
    return session?.userId || null;
}

export async function getLeaderboardData(period: 'weekly' | 'monthly' | 'all-time' = 'weekly') {
    try {
        const userId = await getCurrentUserId();
        
        let dateFilter = {};
        const now = new Date();
        if (period === 'weekly') {
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = { gte: lastWeek };
        } else if (period === 'monthly') {
            const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            dateFilter = { gte: lastMonth };
        }

        // Aggregate XP from XPTransaction
        const xpAggregation = await prisma.xPTransaction.groupBy({
            by: ['userId'],
            where: period === 'all-time' ? {} : { createdAt: dateFilter },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 20
        });

        const userIds = xpAggregation.map(item => item.userId);
        if (userId && !userIds.includes(userId)) {
            userIds.push(userId);
        }

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                name: true,
                image: true,
                enrollments: { select: { id: true } },
                streaks: { select: { length: true }, take: 1, orderBy: { startDate: 'desc' } }
            }
        });

        const leaderboard = xpAggregation.map((item, index) => {
            const user = users.find(u => u.id === item.userId);
            return {
                rank: index + 1,
                id: item.userId,
                name: user?.name || 'Anonymous Operative',
                avatar: user?.name?.[0] || '?',
                points: item._sum.amount || 0,
                courses: user?.enrollments.length || 0,
                streak: user?.streaks[0]?.length || 0,
                isCurrentUser: item.userId === userId
            };
        });

        // Find current user's rank if not in top 20
        let currentUserRankData: {
            rank: number;
            id: string;
            name: string;
            avatar: string;
            points: number;
            courses: number;
            streak: number;
            isCurrentUser: boolean;
        } | null = null;
        if (userId) {
            const userInTop20 = leaderboard.find(l => l.id === userId);
            if (!userInTop20) {
              const userXp = await prisma.xPTransaction.aggregate({
                  where: { 
                      userId,
                      ...(period === 'all-time' ? {} : { createdAt: dateFilter })
                  },
                  _sum: { amount: true }
              });
              
              const points = userXp._sum.amount || 0;
              
              const higherRankedCount = await prisma.xPTransaction.groupBy({
                  by: ['userId'],
                  where: period === 'all-time' ? {} : { createdAt: dateFilter },
                  _sum: { amount: true },
                  having: {
                      amount: {
                          _sum: { gt: points }
                      }
                  }
              });

              const user = users.find(u => u.id === userId);
              currentUserRankData = {
                  rank: higherRankedCount.length + 1,
                  id: userId,
                  name: user?.name || 'You',
                  avatar: user?.name?.[0] || '?',
                  points,
                  courses: user?.enrollments.length || 0,
                  streak: user?.streaks[0]?.length || 0,
                  isCurrentUser: true
              };
           } else {
               currentUserRankData = userInTop20;
           }
        }

        return { 
            leaderboard, 
            currentUser: currentUserRankData 
        };
    } catch (error) {
        console.error('Leaderboard Fetch Error:', error);
        return { leaderboard: [], currentUser: null };
    }
}

export async function getStudentBadges() {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    try {
        const [enrollments, completedEnrollments, sessions, submissions, certificateCount] = await Promise.all([
            prisma.enrollment.findMany({ where: { userId } }),
            prisma.enrollment.findMany({ where: { userId, status: 'completed' } }),
            prisma.learningSession.findMany({ where: { userId } }),
            prisma.assignmentSubmission.findMany({ where: { userId, status: 'graded' } }),
            prisma.certificate.count({ where: { userId } })
        ]);

        const totalPoints = await prisma.xPTransaction.aggregate({
            where: { userId },
            _sum: { amount: true }
        });

        const points = totalPoints._sum.amount || 0;

        // Badge Logic
        const badges = [
            {
                id: '1',
                title: 'Early_Bird',
                desc: 'Sync modules before 0800 HRS',
                icon: 'Zap',
                unlocked: sessions.some(s => new Date(s.date).getHours() < 8)
            },
            {
                id: '2',
                title: 'Elite_Protocol',
                desc: 'Get 100% in any evaluation',
                icon: 'Trophy',
                unlocked: submissions.some(s => (s.score || 0) >= (s.assignmentId ? 100 : 0)) // Simplified
            },
            {
                id: '3',
                title: 'Tech_Pioneer',
                desc: 'Mastered 5 distinct technology sectors',
                icon: 'Rocket',
                unlocked: completedEnrollments.length >= 5
            },
            {
                id: '4',
                title: 'Neural_Node',
                desc: 'Earn your first certificate',
                icon: 'Award',
                unlocked: certificateCount > 0
            },
            {
                id: '5',
                title: 'Deep_Linker',
                desc: 'Reach 1000 Total XP points',
                icon: 'Brain',
                unlocked: points >= 1000
            },
            {
                id: '6',
                title: 'Consistency_Core',
                desc: 'Maintain a 7-day operational streak',
                icon: 'Shield',
                unlocked: false // Streak model would be checked here
            }
        ];

        return { badges, stats: { points, rank: 0, percentile: 99, badgesUnlocked: badges.filter(b => b.unlocked).length } };
    } catch (error) {
        console.error('Badges Fetch Error:', error);
        return { badges: [], stats: { points: 0, rank: 0, percentile: 0, badgesUnlocked: 0 } };
    }
}

