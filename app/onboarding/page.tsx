import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import OnboardingClient from './OnboardingClient';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (user) {
    const role = (user.role || '').toUpperCase();
    if (['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(role)) {
      redirect('/admin/dashboard');
    } else if (['TEACHER', 'INSTRUCTOR'].includes(role)) {
      redirect('/teacher/dashboard');
    } else if (role === 'MENTOR') {
      redirect('/mentor/dashboard');
    }
  }

  return <OnboardingClient />;
}

