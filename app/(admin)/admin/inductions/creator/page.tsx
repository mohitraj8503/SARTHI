import CreatorInductionClient from './CreatorInductionClient';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CreatorInductionAdmin() {
  const session = await getSession();
  if (session?.role !== 'ADMIN') {
    redirect('/');
  }

  const submissions = await prisma.creatorInductionSubmission.findMany({
    orderBy: { appliedAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    }
  });

  return (
    <div className="p-8">
      <CreatorInductionClient initialSubmissions={submissions as any} />
    </div>
  );
}
