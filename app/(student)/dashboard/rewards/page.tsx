import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import RewardsClient from './RewardsClient';

export const metadata = {
  title: 'Rewards & Referrals | SARTHI',
  description: 'Track your XP points, refer friends, and unlock premium learning rewards.',
};

export default async function RewardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      totalPoints: true,
      referralCode: true,
      xp: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      referrals: {
        select: {
          id: true,
          name: true,
          createdAt: true,
        }
      }
    }
  });

  if (!dbUser) redirect('/login');

  // If user has no referral code, generate one (fallback)
  if (!dbUser.referralCode) {
    const newCode = `TT-${dbUser.name?.substring(0, 3).toUpperCase() || 'USR'}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { referralCode: newCode }
    });
    dbUser.referralCode = newCode;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <RewardsClient 
        user={{
          name: dbUser.name,
          totalPoints: dbUser.totalPoints,
          referralCode: dbUser.referralCode
        }}
        transactions={dbUser.xp}
        referrals={dbUser.referrals}
      />
    </div>
  );
}

