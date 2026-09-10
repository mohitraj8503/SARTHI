import BuilderInductionClient from './BuilderInductionClient';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BuilderInductionAdmin() {
  const session = await getSession();
  if (session?.role !== 'ADMIN') {
    redirect('/');
  }

  const submissions = await prisma.builderInductionSubmission.findMany({
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
      <BuilderInductionClient initialSubmissions={submissions as any} />
    </div>
  );
}
