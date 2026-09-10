import { cache, Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMentorDashboardData } from '@/lib/services/mentor.service';
import MentorCertificateStudioClient from '@/components/mentor/MentorCertificateStudioClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mentor Certificate Studio | SARTHI',
  description: 'Design, issue and verify official SARTHI internship completion letters and certificates.',
};

export default async function MentorCertificateStudioPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?returnUrl=/mentor/certificate-studio');
  }

  const role = (user.role as string)?.toUpperCase() || '';
  const isAuthorized = ['MENTOR', 'ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(role);
  if (!isAuthorized) {
    redirect('/dashboard');
  }

  const dashboardData = await getMentorDashboardData(user.email || '');
  const allMembers = (dashboardData.batches || []).flatMap((b: any) => b.members || []);

  return (
    <MentorCertificateStudioClient
      initialInterns={allMembers}
      initialApplications={dashboardData.applications || []}
      user={user}
    />
  );
}
