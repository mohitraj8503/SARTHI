import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import LeaderboardClient from './LeaderboardClient';

export const metadata = {
  title: 'Leaderboard | SARTHI Elite',
  description: 'See where you stand among the global SARTHI learning community.',
};

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Fetch top 50 users
  const topUsersData = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      totalPoints: { gt: 0 },
    },
    orderBy: {
      totalPoints: 'desc',
    },
    take: 50,
    select: {
      id: true,
      name: true,
      image: true,
      avatar_url: true,
      totalPoints: true,
    },
  });

  const topUsers = topUsersData.map((u, index) => ({
    ...u,
    image: u.image || u.avatar_url,
    rank: index + 1,
    isCurrentUser: u.id === user.id,
  }));

  // Find current user's rank if not in top 50
  let currentUserRank = topUsers.find(u => u.id === user.id) || null;

  if (!currentUserRank) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { totalPoints: true, name: true, image: true, avatar_url: true }
    });

    if (dbUser) {
      const higherPointsCount = await prisma.user.count({
        where: {
          role: 'STUDENT',
          totalPoints: { gt: dbUser.totalPoints },
        },
      });

      currentUserRank = {
        id: user.id,
        name: dbUser.name,
        image: dbUser.image || dbUser.avatar_url,
        totalPoints: dbUser.totalPoints,
        rank: higherPointsCount + 1,
        isCurrentUser: true,
      };
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <LeaderboardClient 
        topUsers={topUsers} 
        currentUser={currentUserRank} 
        />
    </div>
  );
}

