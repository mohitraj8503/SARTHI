import { cache, Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMentorDashboardData } from '@/lib/services/mentor.service';
import MentorDashboardClient from './MentorDashboardClient';

export const dynamic = 'force-dynamic';

const getCachedMentorDashboardData = cache(async (email: string) => {
  return getMentorDashboardData(email);
});

export const metadata = {
  title: 'Mentor Dashboard | SARTHI',
  description: 'Manage interns, assignments, reviews, resources and track performance.',
};

export default async function MentorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?returnUrl=/mentor/dashboard');
  }

  const role = (user.role as string)?.toUpperCase() || '';
  const isAuthorized = ['MENTOR', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(role);
  if (!isAuthorized) {
    redirect('/dashboard');
  }

  const dashboardData = await getCachedMentorDashboardData(user.email || '');

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <MentorDashboardClient 
        initialData={dashboardData}
        currentTab={params.tab || 'dashboard'}
        user={user}
      />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse w-full">
      <div className="h-40 bg-zinc-200 rounded-[24px]" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-24 bg-zinc-200 rounded-[20px]" />
        <div className="h-24 bg-zinc-200 rounded-[20px]" />
        <div className="h-24 bg-zinc-200 rounded-[20px]" />
        <div className="h-24 bg-zinc-200 rounded-[20px]" />
      </div>
      <div className="h-96 bg-zinc-200 rounded-[24px]" />
    </div>
  );
}
